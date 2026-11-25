import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router';
import type { Episode, EpisodeListResponse } from '../../shared/types';
import { useApi } from '../lib/api';
import { formatDate, formatDuration } from '../lib/format';
import { Cover } from '../components/Cover';
import { PlayButton } from '../components/PlayButton';
import { TagChips } from '../components/TagChips';
import { YouTubeFacade } from '../components/YouTubeFacade';
import { ErrorState, Loading } from '../components/States';
import { NotFoundPage } from './NotFoundPage';

export function EpisodePage() {
  const { slug } = useParams();
  const { data: ep, error, loading, reload } = useApi<Episode>(`/api/episodes/${slug}`);
  const recent = useApi<EpisodeListResponse>('/api/episodes?page=1');

  // Titre de l'onglet (le Worker injecte déjà titre et OG au premier chargement, pour le SEO)
  useEffect(() => {
    if (ep) document.title = `${ep.title} · Les Bécasses`;
  }, [ep]);

  if (loading) return <Loading />;
  if (error?.status === 404) return <NotFoundPage />;
  if (error || !ep) return <ErrorState error={error!} onRetry={reload} />;

  const others = (recent.data?.episodes ?? []).filter((e) => e.slug !== ep.slug).slice(0, 4);

  return (
    <>
      <div className="breadcrumb">
        <Link to="/episodes">Épisodes</Link> / Épisode {ep.episode_number}
      </div>

      <header className="episode-head">
        <Cover episode={ep} />
        <div>
          <span className="meta">
            {ep.season && `Saison ${ep.season} · `}
            {ep.episode_number && `Épisode ${ep.episode_number} · `}
            {formatDate(ep.published_at)}
            {ep.duration_sec ? ` · ${formatDuration(ep.duration_sec)}` : ''}
          </span>
          <h1>{ep.title}</h1>
          <TagChips tags={ep.tags} />
          <div className="episode-actions">
            <PlayButton episode={ep} queue={[ep, ...others]} variant="full" />
            <ShareButton title={ep.title} />
          </div>
        </div>
      </header>

      <div className="episode-layout">
        <div>
          {ep.youtube_id && <YouTubeFacade id={ep.youtube_id} title={ep.title} />}
          <h2>Résumé</h2>
          <p className="summary">{ep.summary}</p>
        </div>

        <aside>
          <div className="aside-box">
            <h3>Écouter ailleurs</h3>
            {/* TODO Infra 3 : liens réels une fois le podcast soumis aux plateformes */}
            <div className="chips">
              <a className="chip filter" href="/rss.xml">Flux RSS</a>
              <span className="chip filter">Spotify</span>
              <span className="chip filter">Apple Podcasts</span>
            </div>
          </div>
          {!!others.length && (
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
          )}
        </aside>
      </div>
    </>
  );
}

/** Partage natif sur mobile, sinon copie du lien. */
function ShareButton({ title }: { title: string }) {
  const [copied, setCopied] = useState(false);
  const share = async () => {
    const url = window.location.href;
    if (navigator.share) {
      await navigator.share({ title, url }).catch(() => {});
      return;
    }
    await navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  return (
    <button className="btn ghost" onClick={share}>
      {copied ? 'Lien copié ✓' : 'Partager'}
    </button>
  );
}
