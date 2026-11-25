import { Link } from 'react-router';
import type { Episode } from '../../shared/types';
import { formatDate, formatDuration } from '../lib/format';
import { Cover } from './Cover';
import { PlayButton } from './PlayButton';
import { TagChips } from './TagChips';

export function EpisodeCard({ episode }: { episode: Episode }) {
  return (
    <article className="card">
      <Link to={`/episodes/${episode.slug}`} tabIndex={-1}>
        <Cover episode={episode} />
      </Link>
      <div className="card-body">
        <span className="meta">
          {formatDate(episode.published_at)} · {formatDuration(episode.duration_sec)}
        </span>
        <h3>
          <Link to={`/episodes/${episode.slug}`}>{episode.title}</Link>
        </h3>
        <p>{episode.summary}</p>
        <div className="card-footer">
          <TagChips tags={episode.tags} />
          <PlayButton episode={episode} />
        </div>
      </div>
    </article>
  );
}
