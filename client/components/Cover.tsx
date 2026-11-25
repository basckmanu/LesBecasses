import type { Episode } from '../../shared/types';

// Pas de cover par épisode au MVP : on génère une pochette à partir du numéro.
// Dégradés de la DA : bordeaux, vin, caramel, chocolat, vieux rose.
const PALETTES = [
  ['#7b1e2c', '#a8394a'], // bordeaux
  ['#c98b4f', '#9c5f2c'], // caramel (guépard)
  ['#5a1420', '#8c2a3a'], // vin profond
  ['#a85a6a', '#d39a9a'], // vieux rose
  ['#4a2a24', '#7d4a3a'], // chocolat
];

export function Cover({ episode, compact = false }: { episode: Episode; compact?: boolean }) {
  const n = episode.episode_number ?? 0;
  const [a, b] = PALETTES[n % PALETTES.length]!;

  return (
    <div className="cover" style={{ background: `linear-gradient(140deg, ${a}, ${b})` }} aria-hidden>
      {!compact && <span className="cover-label">Les Bécasses</span>}
      <span className="cover-num">#{String(n).padStart(2, '0')}</span>
    </div>
  );
}
