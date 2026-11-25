import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router';
import { api, useApi, type ApiError } from '../../lib/api';
import { formatBytes, formatDate } from '../../lib/format';
import { Empty, ErrorState, Loading } from '../../components/States';
import { ConfirmDialog } from '../../components/ConfirmDialog';

// Ligne renvoyée par GET /api/admin/episodes (server/routes/admin.ts)
export type AdminRow = {
  id: number;
  slug: string;
  title: string;
  status: 'draft' | 'published';
  published_at: string | null;
  audio_key: string | null;
  audio_bytes: number | null;
  episode_number: number | null;
};

type Filter = 'all' | 'published' | 'draft';

/** Liste de tous les épisodes (brouillons compris) avec les actions du CRUD. */
export function AdminPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { data, error, loading, reload } = useApi<AdminRow[]>('/api/admin/episodes');

  const [filter, setFilter] = useState<Filter>('all');
  const [search, setSearch] = useState('');
  const [busyId, setBusyId] = useState<number | null>(null);
  const [toDelete, setToDelete] = useState<AdminRow | null>(null);
  // Message laissé par le formulaire après un enregistrement / une suppression
  const [flash, setFlash] = useState<{ type: 'ok' | 'error'; text: string } | null>(
    (location.state as { flash?: string } | null)?.flash ? { type: 'ok', text: (location.state as { flash: string }).flash } : null,
  );

  const run = async (row: AdminRow, action: () => Promise<unknown>, okText: string) => {
    setBusyId(row.id);
    setFlash(null);
    try {
      await action();
      setFlash({ type: 'ok', text: okText });
      reload();
    } catch (e) {
      setFlash({ type: 'error', text: (e as ApiError).message });
    } finally {
      setBusyId(null);
    }
  };

  const togglePublish = (row: AdminRow) =>
    row.status === 'published'
      ? run(row, () => api(`/api/admin/episodes/${row.id}/unpublish`, { method: 'POST' }), `« ${row.title} » est repassé en brouillon.`)
      : run(row, () => api(`/api/admin/episodes/${row.id}/publish`, { method: 'POST' }), `« ${row.title} » est publié.`);

  const confirmDelete = async () => {
    if (!toDelete) return;
    const row = toDelete;
    await run(row, () => api(`/api/admin/episodes/${row.id}`, { method: 'DELETE' }), `« ${row.title} » a été supprimé.`);
    setToDelete(null);
  };

  if (loading && !data) return <Loading />;
  if (error) return <ErrorState error={error} onRetry={reload} />;
  const rows = data ?? [];

  const published = rows.filter((r) => r.status === 'published').length;
  const drafts = rows.length - published;
  const withoutAudio = rows.filter((r) => !r.audio_key).length;

  const q = search.trim().toLowerCase();
  const visible = rows.filter(
    (r) => (filter === 'all' || r.status === filter) && (!q || r.title.toLowerCase().includes(q) || r.slug.includes(q)),
  );

  return (
    <>
      <div className="admin-head">
        <h1>Épisodes</h1>
        <Link className="btn" to="/admin/episodes/new">+ Nouvel épisode</Link>
      </div>

      <div className="stats">
        <div className="stat"><strong>{published}</strong><span>publié{published > 1 ? 's' : ''}</span></div>
        <div className="stat"><strong>{drafts}</strong><span>brouillon{drafts > 1 ? 's' : ''}</span></div>
        <div className="stat"><strong>{withoutAudio}</strong><span>sans fichier audio</span></div>
      </div>

      {flash && (
        <div className={`flash ${flash.type}`} role={flash.type === 'error' ? 'alert' : 'status'}>
          {flash.text}
          <button className="icon-btn" onClick={() => setFlash(null)} aria-label="Fermer le message">✕</button>
        </div>
      )}

      <div className="admin-toolbar">
        <div className="chips" role="group" aria-label="Filtrer par statut">
          {(['all', 'published', 'draft'] as Filter[]).map((f) => (
            <button key={f} className={`chip filter ${filter === f ? 'active' : ''}`} onClick={() => setFilter(f)}>
              {{ all: 'Tous', published: 'Publiés', draft: 'Brouillons' }[f]}
            </button>
          ))}
        </div>
        <input
          className="search"
          type="search"
          placeholder="Rechercher un épisode…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          aria-label="Rechercher un épisode"
        />
      </div>

      {!rows.length ? (
        <Empty>
          Aucun épisode pour l'instant. <Link to="/admin/episodes/new">Crée le premier !</Link>
        </Empty>
      ) : !visible.length ? (
        <Empty>Aucun épisode ne correspond.</Empty>
      ) : (
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>N°</th>
                <th>Titre</th>
                <th>Statut</th>
                <th>Publié le</th>
                <th>Fichier audio</th>
                <th><span className="sr-only">Actions</span></th>
              </tr>
            </thead>
            <tbody>
              {visible.map((row) => (
                <tr key={row.id} onDoubleClick={() => navigate(`/admin/episodes/${row.id}`)}>
                  <td>{row.episode_number ?? '—'}</td>
                  <td className="title">
                    <Link to={`/admin/episodes/${row.id}`}>{row.title}</Link>
                  </td>
                  <td>
                    <span className={`badge ${row.status}`}>{row.status === 'published' ? 'Publié' : 'Brouillon'}</span>
                  </td>
                  <td>{formatDate(row.published_at)}</td>
                  <td className="meta">{row.audio_key ? `${row.audio_key} · ${formatBytes(row.audio_bytes)}` : 'Aucun fichier'}</td>
                  <td>
                    <div className="row-actions">
                      <Link className="btn ghost small" to={`/admin/episodes/${row.id}`}>Modifier</Link>
                      <button className="btn secondary small" disabled={busyId === row.id} onClick={() => togglePublish(row)}>
                        {row.status === 'published' ? 'Dépublier' : 'Publier'}
                      </button>
                      <button className="btn danger small" disabled={busyId === row.id} onClick={() => setToDelete(row)}>
                        Supprimer
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {toDelete && (
        <DeleteDialog row={toDelete} pending={busyId === toDelete.id} onConfirm={confirmDelete} onCancel={() => setToDelete(null)} />
      )}
    </>
  );
}

/** Confirmation de suppression, partagée avec le formulaire. */
export function DeleteDialog(props: { row: Pick<AdminRow, 'title' | 'status'>; pending: boolean; onConfirm: () => void; onCancel: () => void }) {
  return (
    <ConfirmDialog
      title="Supprimer l'épisode ?"
      confirmLabel="Supprimer définitivement"
      tone="danger"
      pending={props.pending}
      onConfirm={props.onConfirm}
      onCancel={props.onCancel}
    >
      <p>
        « <strong>{props.row.title}</strong> » sera supprimé du site{props.row.status === 'published' ? ' et du flux RSS (il disparaîtra aussi de Spotify et Apple)' : ''}.
        Cette action est <strong>irréversible</strong>.
      </p>
      {props.row.status === 'published' && <p className="meta">Pour simplement le masquer, utilise plutôt « Dépublier ».</p>}
      <p className="meta">Le fichier MP3 reste conservé dans le stockage.</p>
    </ConfirmDialog>
  );
}
