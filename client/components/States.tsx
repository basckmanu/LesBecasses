import type { ApiError } from '../lib/api';

// États communs : chargement, erreur, vide.

export function Loading({ label = 'Chargement…' }: { label?: string }) {
  return (
    <div className="empty" role="status">
      {label}
    </div>
  );
}

export function ErrorState({ error, onRetry }: { error: ApiError; onRetry?: () => void }) {
  const offline = error.status === 0 || error.message === 'Serveur injoignable';
  return (
    <div className="empty" role="alert">
      <p>
        <strong>{offline ? 'Le serveur ne répond pas.' : 'Oups, impossible de charger.'}</strong>
      </p>
      <p>{offline ? 'En local, lance aussi `npm run server` (ou `npm start` pour tout lancer).' : error.message}</p>
      {onRetry && (
        <button className="btn secondary" onClick={onRetry}>
          Réessayer
        </button>
      )}
    </div>
  );
}

export function Empty({ children }: { children: React.ReactNode }) {
  return <div className="empty">{children}</div>;
}
