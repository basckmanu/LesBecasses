import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import type { AppEnv } from '../env';
import { getAdminEpisode, setTagsStatements } from '../db/episodes';
import { episodeInputSchema, idParamSchema } from '../validation/schemas';

// MVP : pas de suppression d'épisode — on repasse en brouillon.
export const adminRoutes = new Hono<AppEnv>();

// GET /api/admin/episodes
adminRoutes.get('/', async (c) => {
  const { results } = await c.env.DB.prepare(
    `SELECT id, slug, title, status, published_at, audio_key, audio_bytes
     FROM episodes ORDER BY COALESCE(published_at, '9999') DESC, id DESC`,
  ).all();
  return c.json(results);
});

// GET /api/admin/episodes/:id
adminRoutes.get('/:id', zValidator('param', idParamSchema), async (c) => {
  const ep = await getAdminEpisode(c.env.DB, c.req.valid('param').id);
  return ep ? c.json(ep) : c.json({ error: 'Introuvable' }, 404);
});

// POST /api/admin/episodes
adminRoutes.post('/', zValidator('json', episodeInputSchema), async (c) => {
  const d = c.req.valid('json');
  const row = await c.env.DB.prepare(
    `INSERT INTO episodes (slug, guid, title, summary, youtube_id, audio_key, duration_sec, season, episode_number)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?) RETURNING id`,
  )
    .bind(d.slug, crypto.randomUUID(), d.title, d.summary, d.youtube_id, d.audio_key, d.duration_sec, d.season, d.episode_number)
    .first<{ id: number }>();
  if (!row) return c.json({ error: 'Création impossible' }, 500);
  await c.env.DB.batch(setTagsStatements(c.env.DB, row.id, d.tags));
  return c.json({ id: row.id }, 201);
});

// PUT /api/admin/episodes/:id  (le guid n'est jamais modifiable)
adminRoutes.put('/:id', zValidator('param', idParamSchema), zValidator('json', episodeInputSchema), async (c) => {
  const { id } = c.req.valid('param');
  const d = c.req.valid('json');
  const [res] = await c.env.DB.batch([
    c.env.DB.prepare(
      `UPDATE episodes SET slug = ?, title = ?, summary = ?, youtube_id = ?, audio_key = ?,
         duration_sec = ?, season = ?, episode_number = ? WHERE id = ?`,
    ).bind(d.slug, d.title, d.summary, d.youtube_id, d.audio_key, d.duration_sec, d.season, d.episode_number, id),
    ...setTagsStatements(c.env.DB, id, d.tags),
  ]);
  if (!res?.meta.changes) return c.json({ error: 'Introuvable' }, 404);
  return c.json({ ok: true });
});

// POST /api/admin/episodes/:id/publish — HEAD sur R2 pour remplir audio_bytes
adminRoutes.post('/:id/publish', zValidator('param', idParamSchema), async (c) => {
  const ep = await getAdminEpisode(c.env.DB, c.req.valid('param').id);
  if (!ep) return c.json({ error: 'Introuvable' }, 404);
  if (!ep.audio_key) return c.json({ error: 'Aucun fichier audio associé' }, 400);

  const obj = await c.env.MEDIA.head(ep.audio_key);
  if (!obj) return c.json({ error: `Le fichier ${ep.audio_key} est absent de R2` }, 400);

  await c.env.DB.prepare(
    `UPDATE episodes SET status = 'published', audio_bytes = ?,
       published_at = COALESCE(published_at, ?) WHERE id = ?`,
  )
    .bind(obj.size, new Date().toISOString(), ep.id)
    .run();
  return c.json({ ok: true, audio_bytes: obj.size });
});

// POST /api/admin/episodes/:id/unpublish — remplace la suppression
adminRoutes.post('/:id/unpublish', zValidator('param', idParamSchema), async (c) => {
  const res = await c.env.DB.prepare(`UPDATE episodes SET status = 'draft' WHERE id = ?`)
    .bind(c.req.valid('param').id)
    .run();
  return res.meta.changes ? c.json({ ok: true }) : c.json({ error: 'Introuvable' }, 404);
});
