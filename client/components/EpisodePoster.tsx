import { Link } from 'react-router';
import type { Episode } from '../../shared/types';
import { formatDate, formatDuration } from '../lib/format';
import { Cover } from './Cover';
import { PlayButton } from './PlayButton';

/** Pochette « affiche » + titre et infos en dessous (carrousels). */
export function EpisodePoster({ episode }: { episode: Episode }) {
  return (
    <div className="poster">
      <div className="poster-cover">
        <Link to={`/episodes/${episode.slug}`} tabIndex={-1}>
          <Cover episode={episode} variant="title" />
        </Link>
        <PlayButton episode={episode} />
      </div>
      <Link to={`/episodes/${episode.slug}`} className="poster-title" style={{ color: 'inherit', textDecoration: 'none' }}>
        {episode.title}
      </Link>
      <span className="meta">
        {formatDate(episode.published_at)} · {formatDuration(episode.duration_sec)}
      </span>
    </div>
  );
}

/** Pochette précédée d'un grand numéro de classement en contour. */
export function RankedEpisode({ episode, rank }: { episode: Episode; rank: number }) {
  return (
    <Link to={`/episodes/${episode.slug}`} className="ranked-item" aria-label={`${rank}. ${episode.title}`}>
      <span className="rank-num" aria-hidden>{rank}</span>
      <Cover episode={episode} variant="title" />
    </Link>
  );
}
