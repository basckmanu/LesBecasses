import { zValidator } from '@hono/zod-validator';
import type { ValidationTargets } from 'hono';
import type { ZodType } from 'zod';

// Noms lisibles des champs, pour des messages d'erreur compréhensibles par la Com
const LABELS: Record<string, string> = {
  slug: 'Adresse (slug)',
  title: 'Titre',
  summary: 'Résumé',
  youtube_id: 'Vidéo YouTube',
  audio_key: 'Fichier audio',
  duration_sec: 'Durée',
  season: 'Saison',
  episode_number: "Numéro d'épisode",
  tags: 'Thèmes',
  label: 'Nom du thème',
};

/**
 * Comme zValidator, mais une erreur renvoie { error: "Titre : obligatoire", field: "title" }
 * au lieu de l'objet zod brut.
 */
export const validate = <T extends ZodType, Target extends keyof ValidationTargets>(target: Target, schema: T) =>
  zValidator(target, schema, (result, c) => {
    if (result.success) return;
    const issue = result.error.issues[0];
    const field = issue?.path[0] !== undefined ? String(issue.path[0]) : undefined;
    const label = field ? (LABELS[field] ?? field) : 'Requête';
    return c.json({ error: `${label} : ${issue?.message ?? 'invalide'}`, field }, 400);
  });
