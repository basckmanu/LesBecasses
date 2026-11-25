import { Link } from 'react-router';
import { MOCK_EPISODES } from '../mocks/episodes';
import { formatDate, formatDuration } from '../lib/format';
import { Cover } from '../components/Cover';
import { EpisodeCard } from '../components/EpisodeCard';
import { PlayButton } from '../components/PlayButton';
import { TagChips } from '../components/TagChips';

export function HomePage() {
  const [latest, ...others] = MOCK_EPISODES;

  return (
    <>
      <section className="hero">
        <div>
          <span className="hero-kicker">Podcast & vidéocast · à écouter sous un plaid</span>
          <h1>
            Le podcast qui a <em>la flemme</em>, mais qui a des choses à dire.
          </h1>
          <p className="lead">
            Tous les quinze jours, Les Bécasses refont le monde depuis le canapé : société, culture et tout ce qui nous
            passe par la tête. Thé chaud conseillé. À écouter ici, sur Spotify, Apple Podcasts ou YouTube.
          </p>
          <div className="hero-actions">
            <Link className="btn" to="/episodes">Se poser et écouter</Link>
            <Link className="btn secondary" to="/a-propos">Qui sont ces bécasses ?</Link>
          </div>
          <div className="platforms">
            Aussi sur
            <span className="chip filter">Spotify</span>
            <span className="chip filter">Apple Podcasts</span>
            <span className="chip filter">YouTube</span>
          </div>
        </div>

        {latest && (
          <article className="featured">
            <Cover episode={latest} />
            <span className="featured-tag">Dernier épisode</span>
            <h2 style={{ margin: 0 }}>
              <Link to={`/episodes/${latest.slug}`} style={{ color: 'inherit', textDecoration: 'none' }}>
                {latest.title}
              </Link>
            </h2>
            <span className="meta">
              {formatDate(latest.published_at)} · {formatDuration(latest.duration_sec)}
            </span>
            <TagChips tags={latest.tags} />
            <div>
              <PlayButton episode={latest} variant="full" />
            </div>
          </article>
        )}
      </section>

      <section>
        <div className="section-head">
          <h2>À rattraper sous la couette</h2>
          <Link to="/episodes">Tout voir →</Link>
        </div>
        <div className="grid">
          {others.slice(0, 4).map((ep) => (
            <EpisodeCard key={ep.slug} episode={ep} />
          ))}
        </div>
      </section>
    </>
  );
}
