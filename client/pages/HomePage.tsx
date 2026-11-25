import { Link } from 'react-router';
import { MOCK_EPISODES, MOCK_TAGS, MOCK_TOP_SLUGS } from '../mocks/episodes';
import { formatDate, formatDuration } from '../lib/format';
import { Cover } from '../components/Cover';
import { PlayButton } from '../components/PlayButton';
import { ThemeTiles } from '../components/ThemeTiles';
import { Carousel } from '../components/Carousel';
import { EpisodePoster, RankedEpisode } from '../components/EpisodePoster';

export function HomePage() {
  const [latest] = MOCK_EPISODES;
  // MAQUETTE : classement factice. Version réelle : stats d'écoute (OP3).
  const top = MOCK_TOP_SLUGS.map((slug) => MOCK_EPISODES.find((e) => e.slug === slug)!).filter(Boolean);

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
              <PlayButton episode={latest} variant="full" />
              <Link className="btn secondary" to={`/episodes/${latest.slug}`}>Voir l'épisode</Link>
            </div>
          </div>
          <Cover episode={latest} variant="title" />
        </section>
      )}

      {/* Thèmes */}
      <section className="section" aria-label="Thèmes">
        <ThemeTiles tags={MOCK_TAGS} />
      </section>

      {/* Classement */}
      <Carousel title="Les épisodes les plus écoutés" kind="ranked">
        {top.map((ep, i) => (
          <RankedEpisode key={`${ep.slug}-${i}`} episode={ep} rank={i + 1} />
        ))}
      </Carousel>

      {/* Derniers épisodes */}
      <Carousel title="À rattraper sous la couette" kind="posters">
        {MOCK_EPISODES.map((ep, i) => (
          <EpisodePoster key={`${ep.slug}-${i}`} episode={ep} />
        ))}
      </Carousel>

      <section className="section" style={{ textAlign: 'center' }}>
        <Link className="btn light" to="/episodes">Voir tous les épisodes</Link>
      </section>
    </>
  );
}
