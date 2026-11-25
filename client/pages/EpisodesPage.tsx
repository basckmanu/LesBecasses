import { useSearchParams } from 'react-router';
import type { EpisodeListResponse, Tag } from '../../shared/types';
import { useApi } from '../lib/api';
import { EpisodeCard } from '../components/EpisodeCard';
import { ErrorState, Loading } from '../components/States';

export function EpisodesPage() {
  const [params, setParams] = useSearchParams();
  const tag = params.get('tag') ?? '';
  const page = Math.max(1, Number(params.get('page')) || 1);

  // Filtrage et pagination faits par l'API : GET /api/episodes?tag=&page=
  const query = new URLSearchParams({ page: String(page), ...(tag && { tag }) });
  const list = useApi<EpisodeListResponse>(`/api/episodes?${query}`);
  const tags = useApi<Tag[]>('/api/tags');

  const go = (next: { tag?: string; page?: number }) => {
    const t = next.tag ?? tag;
    const p = next.page ?? 1;
    setParams({ ...(t && { tag: t }), ...(p > 1 && { page: String(p) }) });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const data = list.data;
  const totalPages = data ? Math.max(1, Math.ceil(data.total / data.page_size)) : 1;
  const currentLabel = tags.data?.find((t) => t.slug === tag)?.label;

  return (
    <>
      <h1>{currentLabel ? `Épisodes · ${currentLabel}` : 'Tous les épisodes'}</h1>
      {data && <p className="meta">{data.total} épisode{data.total > 1 ? 's' : ''}</p>}

      {!!tags.data?.length && (
        <div className="list-toolbar">
          <div className="chips" role="group" aria-label="Filtrer par thème">
            <button className={`chip filter ${!tag ? 'active' : ''}`} onClick={() => go({ tag: '' })}>
              Tous
            </button>
            {tags.data.map((t) => (
              <button key={t.slug} className={`chip filter ${tag === t.slug ? 'active' : ''}`} onClick={() => go({ tag: t.slug })}>
                {t.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {list.loading && <Loading />}
      {list.error && <ErrorState error={list.error} onRetry={list.reload} />}
      {data && !data.episodes.length && (
        <div className="empty">Rien par ici pour l'instant… on avait un peu la flemme. Ça arrive !</div>
      )}
      {data && !!data.episodes.length && (
        <div className="grid glass-zone">
          {data.episodes.map((ep) => (
            <EpisodeCard key={ep.slug} episode={ep} queue={data.episodes} />
          ))}
        </div>
      )}

      {data && totalPages > 1 && (
        <nav className="pagination" aria-label="Pagination">
          <button className="btn secondary" disabled={page <= 1} onClick={() => go({ page: page - 1 })}>
            ← Précédents
          </button>
          <span className="meta">
            Page {page} / {totalPages}
          </span>
          <button className="btn secondary" disabled={page >= totalPages} onClick={() => go({ page: page + 1 })}>
            Suivants →
          </button>
        </nav>
      )}
    </>
  );
}
