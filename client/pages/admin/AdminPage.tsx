import { useApi } from '../../lib/api';
import { formatBytes, formatDate } from '../../lib/format';
import { Empty, ErrorState, Loading } from '../../components/States';

// Ligne renvoyée par GET /api/admin/episodes (server/routes/admin.ts)
type AdminRow = {
  id: number;
  slug: string;
  title: string;
  status: 'draft' | 'published';
  published_at: string | null;
  audio_key: string | null;
  audio_bytes: number | null;
};

/**
 * Back-office. En production : protégé par Cloudflare Access (/admin*).
 * En local : basic-auth (identifiants dans .dev.vars), le navigateur demande le mot de passe.
 */
export function AdminPage() {
  const { data, error, loading, reload } = useApi<AdminRow[]>('/api/admin/episodes');

  const published = data?.filter((r) => r.status === 'published').length ?? 0;
  const drafts = (data?.length ?? 0) - published;
  const withoutAudio = data?.filter((r) => !r.audio_key).length ?? 0;

  return (
    <>
      <div className="admin-head">
        <h1>Administration</h1>
        {/* TODO étape suivante : formulaire de création / modification + upload MP3 */}
        <button className="btn secondary" disabled title="Bientôt">Où voir mes stats</button>
        <button className="btn" disabled title="Bientôt">+ Nouvel épisode</button>
      </div>

      {loading && <Loading />}
      {error && (error.status === 401 || error.status === 403 ? (
        <Empty>Accès refusé. Il faut être connecté avec un compte autorisé.</Empty>
      ) : (
        <ErrorState error={error} onRetry={reload} />
      ))}

      {data && (
        <>
          <div className="stats">
            <div className="stat"><strong>{published}</strong><span>épisode{published > 1 ? 's' : ''} publié{published > 1 ? 's' : ''}</span></div>
            <div className="stat"><strong>{drafts}</strong><span>brouillon{drafts > 1 ? 's' : ''}</span></div>
            <div className="stat"><strong>{withoutAudio}</strong><span>sans fichier audio</span></div>
          </div>

          {data.length ? (
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Titre</th>
                    <th>Statut</th>
                    <th>Publié le</th>
                    <th>Fichier audio</th>
                  </tr>
                </thead>
                <tbody>
                  {data.map((row) => (
                    <tr key={row.id}>
                      <td>{row.id}</td>
                      <td className="title">{row.title}</td>
                      <td>
                        <span className={`badge ${row.status}`}>{row.status === 'published' ? 'Publié' : 'Brouillon'}</span>
                      </td>
                      <td>{formatDate(row.published_at)}</td>
                      <td className="meta">{row.audio_key ? `${row.audio_key} · ${formatBytes(row.audio_bytes)}` : 'Aucun fichier'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <Empty>Aucun épisode pour l'instant.</Empty>
          )}
        </>
      )}
    </>
  );
}
