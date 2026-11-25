import { Link } from 'react-router';
import type { Episode } from '../../shared/types';
import { formatDate, formatDuration } from '../lib/format';
import { Cover } from './Cover';
import { PlayButton } from './PlayButton';
import { TagChips } from './TagChips';

/** Carte d'épisode en verre dépoli : pochette façon affiche, titre et infos en dessous. */
export function EpisodeCard({ episode, queue }: { episode: Episode; queue?: Episode[] }) {
  return (
    <article className="ep-card glass">
      <div className="ep-cover">
        <Link to={`/episodes/${episode.slug}`} tabIndex={-1} aria-hidden>
          <Cover episode={episode} variant="title" />
        </Link>
        <PlayButton episode={episode} queue={queue} />
      </div>
      <div className="ep-text">
        <Link to={`/episodes/${episode.slug}`} className="ep-title">{episode.title}</Link>
        <span className="ep-sub">
          {formatDate(episode.published_at)} · {formatDuration(episode.duration_sec)}
        </span>
        <TagChips tags={episode.tags} />
      </div>
    </article>
  );
}
