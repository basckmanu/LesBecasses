import { Link, NavLink, Outlet, useNavigate } from 'react-router';
import { useApi } from '../lib/api';
import { clearAdminCredentials, hasAdminCredentials } from '../lib/admin-auth';
import { LoginModal } from '../components/LoginModal';
import { Empty, ErrorState, Loading } from '../components/States';

/**
 * Garde d'accès de toutes les pages /admin :
 * - mode « basic » (local / plan B) : modale de connexion du site ;
 * - mode Cloudflare Access (production) : la connexion a lieu avant d'arriver ici.
 */
export function AdminLayout() {
  const navigate = useNavigate();
  const me = useApi<{ user: string }>('/api/admin/me');

  const logout = () => {
    clearAdminCredentials();
    navigate('/');
  };

  if (me.loading) return <Loading label="Vérification de l'accès…" />;

  if (me.error?.auth === 'basic') {
    return (
      <>
        <Empty>Cet espace est réservé à l'équipe.</Empty>
        <LoginModal onSuccess={me.reload} onCancel={() => navigate('/')} />
      </>
    );
  }
  if (me.error?.auth === 'access') {
    return <Empty>Accès refusé. Connecte-toi avec ton adresse email autorisée (Cloudflare Access), puis recharge la page.</Empty>;
  }
  if (me.error) return <ErrorState error={me.error} onRetry={me.reload} />;

  return (
    <div className="admin">
      <nav className="admin-nav" aria-label="Back-office">
        <Link to="/admin" className="admin-brand">Back-office</Link>
        <NavLink to="/admin" end>Épisodes</NavLink>
        <NavLink to="/admin/episodes/new">+ Nouvel épisode</NavLink>
        <span className="admin-user">Connecté : {me.data?.user}</span>
        {hasAdminCredentials() && (
          <button className="btn ghost small" onClick={logout}>Se déconnecter</button>
        )}
      </nav>
      <Outlet />
    </div>
  );
}
