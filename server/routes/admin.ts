import { Hono } from 'hono';
import type { AppEnv } from '../env';
import { getAdminEpisode, setTagsStatements } from '../db/episodes';
import { episodeInputSchema, idParamSchema } from '../validation/schemas';
import { validate } from '../validation/validate';

export const adminRoutes = new Hono<AppEnv>();

/** Le slug est unique en base : on traduit l'erreur SQL en message clair. */
const isSlugTaken = (err: unknown) => String((err as Error)?.message ?? err).includes('UNIQUE constraint failed: episodes.slug');
const SLUG_TAKEN = { error: 'Adresse (slug) : déjà utilisée par un autre épisode', field: 'slug' } as const;

// GET /api/admin/episodes — tous les épisodes, brouillons compris
adminRoutes.get('/', async (c) => {
  const { results } = await c.env.DB.prepare(
    `SELECT id, slug, title, status, published_at, audio_key, audio_bytes, episode_number
     FROM episodes ORDER BY COALESCE(published_at, '9999') DESC, id DESC`,
  ).all();
  return c.json(results);
});

// GET /api/admin/episodes/:id
adminRoutes.get('/:id', validate('param', idParamSchema), async (c) => {
  const ep = await getAdminEpisode(c.env.DB, c.req.valid('param').id);
  return ep ? c.json(ep) : c.json({ error: 'Épisode introuvable' }, 404);
});

// POST /api/admin/episodes — création (toujours en brouillon)
adminRoutes.post('/', validate('json', episodeInputSchema), async (c) => {
  const d = c.req.valid('json');
  let row: { id: number } | null;
  try {
    row = await c.env.DB.prepare(
      `INSERT INTO episodes (slug, guid, title, summary, youtube_id, audio_key, duration_sec, season, episode_number)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?) RETURNING id`,
    )
      .bind(d.slug, crypto.randomUUID(), d.title, d.summary, d.youtube_id, d.audio_key, d.duration_sec, d.season, d.episode_number)
      .first<{ id: number }>();
  } catch (err) {
    if (isSlugTaken(err)) return c.json(SLUG_TAKEN, 409);
    throw err;
  }
  if (!row) return c.json({ error: 'Création impossible' }, 500);
  await c.env.DB.batch(setTagsStatements(c.env.DB, row.id, d.tags));
  return c.json({ id: row.id }, 201);
});

// PUT /api/admin/episodes/:id — modification (le guid ne change jamais : identité RSS)
adminRoutes.put('/:id', validate('param', idParamSchema), validate('json', episodeInputSchema), async (c) => {
  const { id } = c.req.valid('param');
  const d = c.req.valid('json');
  try {
    const [res] = await c.env.DB.batch([
      c.env.DB.prepare(
        `UPDATE episodes SET slug = ?, title = ?, summary = ?, youtube_id = ?, audio_key = ?,
           duration_sec = ?, season = ?, episode_number = ? WHERE id = ?`,
      ).bind(d.slug, d.title, d.summary, d.youtube_id, d.audio_key, d.duration_sec, d.season, d.episode_number, id),
      ...setTagsStatements(c.env.DB, id, d.tags),
    ]);
    if (!res?.meta.changes) return c.json({ error: 'Épisode introuvable' }, 404);
  } catch (err) {
    if (isSlugTaken(err)) return c.json(SLUG_TAKEN, 409);
    throw err;
  }
  return c.json({ ok: true });
});

// DELETE /api/admin/episodes/:id — suppression définitive.
// Le MP3 reste dans R2 (pas de perte accidentelle du fichier lourd).
adminRoutes.delete('/:id', validate('param', idParamSchema), async (c) => {
  const { id } = c.req.valid('param');
  const [, res] = await c.env.DB.batch([
    c.env.DB.prepare('DELETE FROM episode_tags WHERE episode_id = ?').bind(id),
    c.env.DB.prepare('DELETE FROM episodes WHERE id = ?').bind(id),
  ]);
  return res?.meta.changes ? c.json({ ok: true }) : c.json({ error: 'Épisode introuvable' }, 404);
});

// POST /api/admin/episodes/:id/publish — vérifie le MP3 dans R2 et remplit audio_bytes (requis par le RSS)
adminRoutes.post('/:id/publish', validate('param', idParamSchema), async (c) => {
  const ep = await getAdminEpisode(c.env.DB, c.req.valid('param').id);
  if (!ep) return c.json({ error: 'Épisode introuvable' }, 404);
  if (!ep.audio_key) return c.json({ error: "Ajoute d'abord le fichier audio (MP3) avant de publier" }, 400);

  const obj = await c.env.MEDIA.head(ep.audio_key);
  if (!obj) return c.json({ error: `Le fichier ${ep.audio_key} n'a pas été trouvé : renvoie le MP3 avant de publier` }, 400);

  await c.env.DB.prepare(
    `UPDATE episodes SET status = 'published', audio_bytes = ?,
       published_at = COALESCE(published_at, ?) WHERE id = ?`,
  )
    .bind(obj.size, new Date().toISOString(), ep.id)
    .run();
  return c.json({ ok: true, audio_bytes: obj.size });
});

// POST /api/admin/episodes/:id/unpublish — repasse en brouillon (disparaît du site et du RSS)
adminRoutes.post('/:id/unpublish', validate('param', idParamSchema), async (c) => {
  const res = await c.env.DB.prepare(`UPDATE episodes SET status = 'draft' WHERE id = ?`)
    .bind(c.req.valid('param').id)
    .run();
  return res.meta.changes ? c.json({ ok: true }) : c.json({ error: 'Épisode introuvable' }, 404);
});
