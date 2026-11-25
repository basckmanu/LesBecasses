import type { Episode } from '../../shared/types';
import { coverColors } from '../lib/cover-colors';

type Props = {
  episode: Episode;
  /** "number" : gros numéro ; "title" : titre en gros façon affiche ; "mini" : vignette du lecteur */
  variant?: 'number' | 'title' | 'mini';
};

export function Cover({ episode, variant = 'number' }: Props) {
  const n = episode.episode_number ?? 0;
  const [a, b] = coverColors(episode);
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
