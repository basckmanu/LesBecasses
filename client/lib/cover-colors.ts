import type { Episode } from '../../shared/types';

// Pas de cover par épisode au MVP : la pochette est générée à partir du numéro.
// Dégradés de la DA : bordeaux, caramel, vin profond, vieux rose, chocolat.
const PALETTES: [string, string][] = [
  ['#7b1e2c', '#b0394c'], // bordeaux
  ['#9c5f2c', '#d39a5c'], // caramel (guépard)
  ['#5a1420', '#93283c'], // vin profond
  ['#8c3a52', '#c9798c'], // vieux rose
  ['#4a2a24', '#8a5340'], // chocolat
];

/** Les deux couleurs du dégradé de la pochette (servent aussi au halo du carrousel). */
export function coverColors(episode: Episode): [string, string] {
  const n = episode.episode_number ?? 0;
  return PALETTES[n % PALETTES.length]!;
}
