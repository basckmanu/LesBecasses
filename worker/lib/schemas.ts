import { z } from 'zod';

const slug = z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'minuscules, chiffres et tirets').max(120);
const emptyToNull = <T extends z.ZodTypeAny>(schema: T) =>
  z.preprocess((v) => (v === '' || v === undefined ? null : v), schema.nullable());

export const episodeInputSchema = z.object({
  slug,
  title: z.string().trim().min(1).max(200),
  summary: z.string().trim().min(1).max(4000),
  youtube_id: emptyToNull(z.string().regex(/^[A-Za-z0-9_-]{11}$/, 'ID YouTube : 11 caractères')),
  audio_key: emptyToNull(z.string().regex(/^[a-z0-9-]+\.mp3$/, 'ex : ep-012-titre.mp3')),
  duration_sec: emptyToNull(z.coerce.number().int().positive()),
  season: emptyToNull(z.coerce.number().int().positive()),
  episode_number: emptyToNull(z.coerce.number().int().positive()),
  tags: z.array(slug).max(20).default([]),
});

export const listQuerySchema = z.object({
  tag: slug.optional(),
  page: z.coerce.number().int().min(1).max(1000).default(1),
});

export const signUploadSchema = z.object({
  key: z.string().regex(/^[a-z0-9-]+\.mp3$/, 'nom de fichier : ep-012-titre.mp3'),
  content_type: z.literal('audio/mpeg'),
});

export const idParamSchema = z.object({ id: z.coerce.number().int().positive() });
