import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { z } from 'zod';
import type { AppEnv } from '../env';
import type { EpisodeListResponse } from '../../shared/types';
import { getPublishedBySlug, listPublished, listTags, toPublic } from '../db/episodes';
import { listQuerySchema } from '../validation/schemas';

const PAGE_SIZE = 12;
// Cache edge pour ménager les lectures D1 (quotas gratuits)
const CACHE = 'public, max-age=60, s-maxage=300';

export const publicRoutes = new Hono<AppEnv>();

// GET /api/episodes?tag=&page=
publicRoutes.get('/episodes', zValidator('query', listQuerySchema), async (c) => {
  const { tag, page } = c.req.valid('query');
  const { rows, total } = await listPublished(c.env.DB, { tag, limit: PAGE_SIZE, offset: (page - 1) * PAGE_SIZE });
  const body: EpisodeListResponse = {
    episodes: rows.map((r) => toPublic(r, c.env.MEDIA_BASE_URL)),
    page,
    page_size: PAGE_SIZE,
    total,
  };
  c.header('Cache-Control', CACHE);
  return c.json(body);
});

// GET /api/episodes/:slug
publicRoutes.get('/episodes/:slug', zValidator('param', z.object({ slug: z.string().max(120) })), async (c) => {
  const row = await getPublishedBySlug(c.env.DB, c.req.valid('param').slug);
  if (!row) return c.json({ error: 'Épisode introuvable' }, 404);
  c.header('Cache-Control', CACHE);
  return c.json(toPublic(row, c.env.MEDIA_BASE_URL));
});

// GET /api/tags
publicRoutes.get('/tags', async (c) => {
  c.header('Cache-Control', CACHE);
  return c.json(await listTags(c.env.DB));
});
