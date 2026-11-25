import { Link } from 'react-router';

export function NotFoundPage() {
  return (
    <div className="empty">
      <h1>Page introuvable</h1>
      <p>Cette page fait la sieste. On n'ose pas la réveiller.</p>
      <Link className="btn" to="/episodes">Retourner au canapé</Link>
    </div>
  );
}
