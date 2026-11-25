import { Hono } from 'hono';
import type { AppEnv } from '../env';
import type { Tag } from '../../shared/types';
import { tagInputSchema } from '../validation/schemas';
import { validate } from '../validation/validate';

export const adminTagRoutes = new Hono<AppEnv>();

/** "Jeux vidéo !" → "jeux-video" */
export function slugify(label: string): string {
  return label
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '') // retire les accents
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 60);
}

// POST /api/admin/tags { label } — crée un thème (ou renvoie celui qui existe déjà)
adminTagRoutes.post('/', validate('json', tagInputSchema), async (c) => {
  const { label } = c.req.valid('json');
  const slug = slugify(label);
  if (!slug) return c.json({ error: 'Nom du thème : doit contenir au moins une lettre ou un chiffre', field: 'label' }, 400);

  await c.env.DB.prepare('INSERT OR IGNORE INTO tags (slug, label) VALUES (?, ?)').bind(slug, label).run();
  const tag = await c.env.DB.prepare('SELECT slug, label FROM tags WHERE slug = ?').bind(slug).first<Tag>();
  return c.json(tag, 201);
});
