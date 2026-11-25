import { describe, expect, it } from 'vitest';
import { slugify } from './admin-tags';

describe('slugify', () => {
  it('retire accents, majuscules et ponctuation', () => {
    expect(slugify('Jeux vidéo')).toBe('jeux-video');
    expect(slugify('  Société & Culture !  ')).toBe('societe-culture');
    expect(slugify('Été 2026')).toBe('ete-2026');
  });

  it('renvoie une chaîne vide si rien d’utilisable', () => {
    expect(slugify('!!!')).toBe('');
  });
});
