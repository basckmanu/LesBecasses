import { MOCK_ADMIN_ROWS } from '../../mocks/episodes';
import { formatBytes, formatDate } from '../../lib/format';

// MAQUETTE du back-office. Version réelle : GET /api/admin/episodes (derrière Cloudflare Access).
export function AdminPage() {
  const published = MOCK_ADMIN_ROWS.filter((r) => r.status === 'published').length;
  const drafts = MOCK_ADMIN_ROWS.length - published;

  return (
    <>
      <div className="admin-head">
        <h1>Administration</h1>
        <button className="btn secondary">Où voir mes stats</button>
        <button className="btn">+ Nouvel épisode</button>
      </div>

      <div className="stats">
        <div className="stat"><strong>{published}</strong><span>épisodes publiés</span></div>
        <div className="stat"><strong>{drafts}</strong><span>brouillon</span></div>
        <div className="stat"><strong>1 284</strong><span>écoutes ce mois (OP3, factice)</span></div>
        <div className="stat"><strong>3 910</strong><span>visites ce mois (factice)</span></div>
      </div>

      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>#</th>
              <th>Titre</th>
              <th>Statut</th>
              <th>Publié le</th>
              <th>Fichier audio</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {MOCK_ADMIN_ROWS.map((row) => (
              <tr key={row.id}>
                <td>{row.id}</td>
                <td className="title">{row.title}</td>
                <td>
                  <span className={`badge ${row.status}`}>{row.status === 'published' ? 'Publié' : 'Brouillon'}</span>
                </td>
                <td>{formatDate(row.published_at)}</td>
                <td className="meta">{row.audio_key ? `${row.audio_key} · ${formatBytes(row.audio_bytes)}` : 'Aucun fichier'}</td>
                <td>
                  <button className="btn ghost small">Modifier</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
