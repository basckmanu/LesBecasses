import { useSearchParams } from 'react-router';
import { MOCK_EPISODES, MOCK_TAGS } from '../mocks/episodes';
import { EpisodeCard } from '../components/EpisodeCard';

export function EpisodesPage() {
  const [params, setParams] = useSearchParams();
  const tag = params.get('tag');

  // MAQUETTE : filtrage local. Version réelle : GET /api/episodes?tag=&page=
  const episodes = tag ? MOCK_EPISODES.filter((e) => e.tags.some((t) => t.slug === tag)) : MOCK_EPISODES;
  const setTag = (slug: string | null) => setParams(slug ? { tag: slug } : {});

  return (
    <>
      <h1>Tous les épisodes</h1>
      <p className="meta">{MOCK_EPISODES.length} épisodes · saison 1</p>

      <div className="list-toolbar">
        <div className="chips" role="group" aria-label="Filtrer par thème">
          <button className={`chip filter ${!tag ? 'active' : ''}`} onClick={() => setTag(null)}>
            Tous
          </button>
          {MOCK_TAGS.map((t) => (
            <button key={t.slug} className={`chip filter ${tag === t.slug ? 'active' : ''}`} onClick={() => setTag(t.slug)}>
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {episodes.length ? (
        <div className="grid">
          {episodes.map((ep) => (
            <EpisodeCard key={ep.slug} episode={ep} />
          ))}
        </div>
      ) : (
        <div className="empty">Rien par ici pour l'instant… on avait un peu la flemme. Ça arrive !</div>
      )}
    </>
  );
}
