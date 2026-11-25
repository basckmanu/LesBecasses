import { Link, NavLink, Outlet, ScrollRestoration } from 'react-router';
import { PlayerBar } from '../player/PlayerBar';

export function RootLayout() {
  return (
    <>
      {/* TODO : retirer avant la mise en ligne */}
      <div className="mock-banner">VERSION DE DÉVELOPPEMENT — lecture audio simulée</div>

      <header className="site-header">
        <div className="container">
          <Link to="/" className="brand">
            <span className="brand-mark" aria-hidden>LB</span>
            <span className="brand-name">Les Bécasses</span>
          </Link>
          <nav className="nav">
            <NavLink to="/episodes">Épisodes</NavLink>
            <NavLink to="/a-propos">À propos</NavLink>
            <NavLink to="/admin">Admin</NavLink>
          </nav>
          <div className="header-actions">
            <a className="btn light small" href="/rss.xml">S'abonner</a>
          </div>
        </div>
      </header>

      <main className="container">
        <Outlet />
      </main>

      <footer className="site-footer">
        <div className="container">
          <span>© {new Date().getFullYear()} Les Bécasses</span>
          <nav>
            <Link to="/episodes">Épisodes</Link>
            <Link to="/a-propos">À propos</Link>
            <Link to="/mentions-legales">Mentions légales</Link>
            <a href="/rss.xml">Flux RSS</a>
          </nav>
        </div>
      </footer>

      {/* Hors de l'<Outlet/> : la lecture continue pendant la navigation */}
      <PlayerBar />
      <ScrollRestoration />
    </>
  );
}
