import { Link } from 'react-router';
import type { EpisodeListResponse, Tag } from '../../shared/types';
import { useApi } from '../lib/api';
import { formatDate, formatDuration } from '../lib/format';
import { TOP_SLUGS } from '../config/home';
import { Cover } from '../components/Cover';
import { PlayButton } from '../components/PlayButton';
import { ThemeTiles } from '../components/ThemeTiles';
import { Carousel } from '../components/Carousel';
import { RankedEpisode } from '../components/EpisodePoster';
import { Coverflow } from '../components/Coverflow';
import { Empty, ErrorState, Loading } from '../components/States';

export function HomePage() {
  // Première page = les 12 épisodes les plus récents (assez pour l'accueil)
  const list = useApi<EpisodeListResponse>('/api/episodes?page=1');
  const tags = useApi<Tag[]>('/api/tags');

  if (list.loading) return <Loading />;
  if (list.error) return <ErrorState error={list.error} onRetry={list.reload} />;

  const episodes = list.data?.episodes ?? [];
  if (!episodes.length) return <Empty>Pas encore d'épisode publié. Revenez bientôt, on prépare le thé.</Empty>;

  const [latest] = episodes;
  // Classement : réglé à la main dans config/home.ts en attendant les stats OP3 (sinon : les plus récents)
  const ranked = TOP_SLUGS.map((s) => episodes.find((e) => e.slug === s)).filter((e) => e !== undefined);
  const top = (ranked.length ? ranked : episodes).slice(0, 6);

  return (
    <>
      {/* À la une : le dernier épisode */}
      {latest && (
        <section className="hero">
          <div>
            <span className="hero-kicker">Nouvel épisode · à écouter sous un plaid</span>
            <h1>{latest.title}</h1>
            <p className="lead">{latest.summary}</p>
            <p className="meta" style={{ color: 'inherit', opacity: 0.85 }}>
              {formatDate(latest.published_at)} · {formatDuration(latest.duration_sec)}
            </p>
            <div className="hero-actions">
              <PlayButton episode={latest} queue={episodes} variant="full" />
              <Link className="btn secondary" to={`/episodes/${latest.slug}`}>Voir l'épisode</Link>
            </div>
          </div>
          <Cover episode={latest} variant="title" />
        </section>
      )}

      {/* Thèmes (s'ils ne chargent pas, on n'affiche simplement pas la section) */}
      {!!tags.data?.length && (
        <section className="section" aria-label="Thèmes">
          <ThemeTiles tags={tags.data} />
        </section>
      )}

      {/* Classement */}
      <Carousel title="Les épisodes les plus écoutés" kind="ranked">
        {top.map((ep, i) => (
          <RankedEpisode key={ep.slug} episode={ep} rank={i + 1} />
        ))}
      </Carousel>

      {/* Derniers épisodes : carrousel en perspective */}
      <Coverflow title="À rattraper sous la couette" episodes={episodes} />

      <section className="section" style={{ textAlign: 'center' }}>
        <Link className="btn light" to="/episodes">Voir tous les épisodes</Link>
      </section>
    </>
  );
}
