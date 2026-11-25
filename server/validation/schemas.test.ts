import { describe, expect, it } from 'vitest';
import { episodeInputSchema, listQuerySchema, signUploadSchema } from './schemas';

const valid = {
  slug: 'ep-012-mon-titre',
  title: 'Épisode 12',
  summary: 'Résumé',
  youtube_id: 'dQw4w9WgXcQ',
  audio_key: 'ep-012-mon-titre.mp3',
  duration_sec: '2700',
  season: 1,
  episode_number: 12,
  tags: ['societe'],
};

describe('episodeInputSchema', () => {
  it('accepte un épisode valide et convertit les nombres', () => {
    const out = episodeInputSchema.parse(valid);
    expect(out.duration_sec).toBe(2700);
    expect(out.tags).toEqual(['societe']);
  });

  it('transforme les champs vides du formulaire en null', () => {
    const out = episodeInputSchema.parse({ ...valid, youtube_id: '', audio_key: '', duration_sec: '', season: undefined });
    expect(out.youtube_id).toBeNull();
    expect(out.audio_key).toBeNull();
    expect(out.duration_sec).toBeNull();
    expect(out.season).toBeNull();
  });

  it('met tags à [] par défaut', () => {
    const rest: Partial<typeof valid> = { ...valid };
    delete rest.tags;
    expect(episodeInputSchema.parse(rest).tags).toEqual([]);
  });

  it('refuse un slug, un ID YouTube ou un fichier invalides', () => {
    expect(episodeInputSchema.safeParse({ ...valid, slug: 'Mon Titre' }).success).toBe(false);
    expect(episodeInputSchema.safeParse({ ...valid, youtube_id: 'trop-court' }).success).toBe(false);
    expect(episodeInputSchema.safeParse({ ...valid, audio_key: 'ep.wav' }).success).toBe(false);
  });

  it('refuse trop de tags (protection contre les gros envois)', () => {
    const tags = Array.from({ length: 21 }, (_, i) => `tag-${i}`);
    expect(episodeInputSchema.safeParse({ ...valid, tags }).success).toBe(false);
  });
});

describe('listQuerySchema', () => {
  it('page vaut 1 par défaut et est convertie en nombre', () => {
    expect(listQuerySchema.parse({}).page).toBe(1);
    expect(listQuerySchema.parse({ page: '3', tag: 'culture' })).toEqual({ page: 3, tag: 'culture' });
  });
});

describe('signUploadSchema', () => {
  it("n'accepte que des MP3 bien nommés", () => {
    expect(signUploadSchema.safeParse({ key: 'ep-001-pilote.mp3', content_type: 'audio/mpeg' }).success).toBe(true);
    expect(signUploadSchema.safeParse({ key: '../secret.mp3', content_type: 'audio/mpeg' }).success).toBe(false);
    expect(signUploadSchema.safeParse({ key: 'ep-001.mp3', content_type: 'image/png' }).success).toBe(false);
  });
});
