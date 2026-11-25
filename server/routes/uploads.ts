import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { z } from 'zod';
import type { AppEnv } from '../env';
import type { UploadSignResponse } from '../../shared/types';
import { presignPut } from '../services/r2-presign';
import { signUploadSchema } from '../validation/schemas';

const EXPIRES_IN = 900;

export const uploadRoutes = new Hono<AppEnv>();

// POST /api/admin/uploads/sign — plan A : URL présignée, le navigateur PUT directement sur R2
uploadRoutes.post('/sign', zValidator('json', signUploadSchema), async (c) => {
  const { key, content_type } = c.req.valid('json');
  if (await c.env.MEDIA.head(key)) return c.json({ error: 'Un fichier porte déjà ce nom' }, 409);

  const url = await presignPut({
    accountId: c.env.R2_ACCOUNT_ID,
    accessKeyId: c.env.R2_ACCESS_KEY_ID,
    secretAccessKey: c.env.R2_SECRET_ACCESS_KEY,
    bucket: c.env.R2_BUCKET_NAME,
    key,
    contentType: content_type,
    expiresIn: EXPIRES_IN,
  });
  const body: UploadSignResponse = { url, key, expires_in: EXPIRES_IN };
  return c.json(body);
});

// PUT /api/admin/uploads/:key — plan B : le Worker streame le corps vers R2
// (pas de buffer en RAM, ~100 Mo max par requête en offre gratuite ; pas de CORS ni de token S3).
// À comparer au plan A lors du spike de 30 min, puis supprimer celui qu'on ne garde pas.
uploadRoutes.put(
  '/:key',
  zValidator('param', z.object({ key: signUploadSchema.shape.key })),
  async (c) => {
    const { key } = c.req.valid('param');
    if (c.req.header('content-type') !== 'audio/mpeg') return c.json({ error: 'MP3 uniquement' }, 415);
    if (!c.req.raw.body) return c.json({ error: 'Fichier manquant' }, 400);
    // Pas de refus si le fichier existe : son nom vient du slug (unique), donc c'est celui
    // du même épisode → « Remplacer » l'écrase.

    const obj = await c.env.MEDIA.put(key, c.req.raw.body, { httpMetadata: { contentType: 'audio/mpeg' } });
    return c.json({ key: obj.key, size: obj.size }, 201);
  },
);
