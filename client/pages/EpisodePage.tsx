import { Link, useParams } from 'react-router';
import { MOCK_EPISODES, MOCK_NOTES } from '../mocks/episodes';
import { formatClock, formatDate, formatDuration } from '../lib/format';
import { Cover } from '../components/Cover';
import { PlayButton } from '../components/PlayButton';
import { TagChips } from '../components/TagChips';
import { NotFoundPage } from './NotFoundPage';

export function EpisodePage() {
  const { slug } = useParams();
  // MAQUETTE : recherche locale. Version réelle : GET /api/episodes/:slug
  const ep = MOCK_EPISODES.find((e) => e.slug === slug);
  if (!ep) return <NotFoundPage />;

  const others = MOCK_EPISODES.filter((e) => e.slug !== ep.slug).slice(0, 3);
  const step = (ep.duration_sec ?? 0) / MOCK_NOTES.length;

  return (
    <>
      <div className="breadcrumb">
        <Link to="/episodes">Épisodes</Link> / Épisode {ep.episode_number}
      </div>

      <header className="episode-head">
        <Cover episode={ep} />
        <div>
          <span className="meta">
            Saison {ep.season} · Épisode {ep.episode_number} · {formatDate(ep.published_at)} ·{' '}
            {formatDuration(ep.duration_sec)}
          </span>
          <h1>{ep.title}</h1>
          <TagChips tags={ep.tags} />
          <div className="episode-actions">
            <PlayButton episode={ep} variant="full" />
            <button className="btn ghost">Partager</button>
          </div>
        </div>
      </header>

      <div className="episode-layout">
        <div>
          {ep.youtube_id && (
            <div className="video" role="img" aria-label="Aperçu de la vidéo YouTube">
              <span className="video-play">▶</span>
              <span className="video-caption">Vidéo YouTube (chargée au clic, youtube-nocookie)</span>
            </div>
          )}

          <h2>Résumé</h2>
          <p>{ep.summary}</p>

          <h2>Au programme</h2>
          <ul className="notes">
            {MOCK_NOTES.map((note, i) => (
              <li key={note}>
                <time>{formatClock(i * step)}</time>
                {note}
              </li>
            ))}
          </ul>
        </div>

        <aside>
          <div className="aside-box">
            <h3>Écouter ailleurs</h3>
            <div className="chips">
              <span className="chip filter">Spotify</span>
              <span className="chip filter">Apple Podcasts</span>
              <span className="chip filter">YouTube</span>
            </div>
          </div>
          <div className="aside-box">
            <h3>À écouter aussi</h3>
            <ul className="aside-list">
              {others.map((o) => (
                <li key={o.slug}>
                  <Link to={`/episodes/${o.slug}`}>{o.title}</Link>
                  <div className="meta">{formatDuration(o.duration_sec)}</div>
                </li>
              ))}
            </ul>
          </div>
        </aside>
      </div>
    </>
  );
}
