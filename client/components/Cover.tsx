import type { Episode } from '../../shared/types';

// Pas de cover par épisode au MVP : on génère une pochette à partir du numéro.
const PALETTES = [
  ['#2f4a3a', '#5c7a5f'],
  ['#b5562f', '#d9894f'],
  ['#3d3a5c', '#6e6a9e'],
  ['#7a5c2e', '#b08a4a'],
  ['#2e5a63', '#4f8c95'],
];

export function Cover({ episode, compact = false }: { episode: Episode; compact?: boolean }) {
  const n = episode.episode_number ?? 0;
  const [a, b] = PALETTES[n % PALETTES.length]!;

  return (
    <div className="cover" style={{ background: `linear-gradient(135deg, ${a}, ${b})` }} aria-hidden>
      {!compact && <span className="cover-label">Les Bécasses</span>}
      <span className="cover-num">#{String(n).padStart(2, '0')}</span>
    </div>
  );
}
