// Réglages d'affichage du front qui ne viennent PAS de la base de données.
// (Les thèmes eux-mêmes viennent de GET /api/tags : ici, seulement leur habillage.)

export type ThemeStyle = { from: string; to: string; pitch: string };

/** Couleurs et accroche des tuiles de thèmes, par slug de tag. */
export const THEME_STYLES: Record<string, ThemeStyle> = {
  societe: { from: '#7b1e2c', to: '#b0394c', pitch: 'On refait le monde' },
  culture: { from: '#9c5f2c', to: '#d39a5c', pitch: 'Livres, films, coups de cœur' },
  invite: { from: '#8c3a52', to: '#c9798c', pitch: 'Ils et elles passent au salon' },
  humour: { from: '#4a2a24', to: '#8a5340', pitch: 'Pour rire sous le plaid' },
  actu: { from: '#5a1420', to: '#93283c', pitch: "L'actu, version canapé" },
  'jeux-video': { from: '#3d2a4a', to: '#7a5a8c', pitch: 'Manette en main, plaid sur les genoux' },
  sport: { from: '#7a3a1e', to: '#c06a3a', pitch: 'Le sport, vu du canapé' },
};

/** Thème créé depuis l'admin sans habillage prévu : on alterne ces couleurs. */
const FALLBACKS: ThemeStyle[] = [
  { from: '#7b1e2c', to: '#b0394c', pitch: '' },
  { from: '#9c5f2c', to: '#d39a5c', pitch: '' },
  { from: '#8c3a52', to: '#c9798c', pitch: '' },
];

export function themeStyle(slug: string, index: number): ThemeStyle {
  return THEME_STYLES[slug] ?? FALLBACKS[index % FALLBACKS.length]!;
}

/**
 * Classement « les plus écoutés » : à remplir à la main avec des slugs d'épisodes
 * en attendant les stats d'écoute (OP3). Vide = les épisodes les plus récents.
 */
export const TOP_SLUGS: string[] = [];
