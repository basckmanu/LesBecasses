import type { Episode } from '../../shared/types';

// Pas de cover par épisode au MVP : on génère une pochette à partir du numéro.
// Dégradés de la DA : bordeaux, caramel, vin profond, vieux rose, chocolat.
const PALETTES = [
  ['#7b1e2c', '#b0394c'], // bordeaux
  ['#9c5f2c', '#d39a5c'], // caramel (guépard)
  ['#5a1420', '#93283c'], // vin profond
  ['#8c3a52', '#c9798c'], // vieux rose
  ['#4a2a24', '#8a5340'], // chocolat
];

type Props = {
  episode: Episode;
  /** "number" : gros numéro ; "title" : titre en gros façon affiche ; "mini" : vignette du lecteur */
  variant?: 'number' | 'title' | 'mini';
};

export function Cover({ episode, variant = 'number' }: Props) {
  const n = episode.episode_number ?? 0;
  const [a, b] = PALETTES[n % PALETTES.length]!;
  const style = { background: `linear-gradient(140deg, ${a}, ${b})` };
  const num = `#${String(n).padStart(2, '0')}`;

  if (variant === 'title') {
    return (
      <div className="cover" style={{ ...style, justifyContent: 'flex-end' }} aria-hidden>
        <span className="cover-badge">Les Bécasses</span>
        <span className="cover-title">{episode.title}</span>
        <span className="cover-sub">Épisode {n}</span>
      </div>
    );
  }

  return (
    <div className="cover" style={style} aria-hidden>
      {variant === 'number' && <span className="cover-label">Les Bécasses</span>}
      <span className="cover-num">{num}</span>
    </div>
  );
}
