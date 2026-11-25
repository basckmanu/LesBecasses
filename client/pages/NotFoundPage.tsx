import { Link } from 'react-router';

export function NotFoundPage() {
  return (
    <div className="empty">
      <h1>Page introuvable</h1>
      <p>Cette page s'est envolée. Les bécasses sont parfois difficiles à attraper.</p>
      <Link className="btn" to="/episodes">Voir les épisodes</Link>
    </div>
  );
}
