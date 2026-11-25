import { Link, Outlet } from 'react-router';

export function RootLayout() {
  return (
    <>
      <header>
        <Link to="/">Les Bécasses</Link> · <Link to="/episodes">Épisodes</Link> ·{' '}
        <Link to="/a-propos">À propos</Link>
      </header>

      <main>
        <Outlet />
      </main>

      <footer>
        <Link to="/mentions-legales">Mentions légales</Link>
      </footer>

      {/* TODO : lecteur audio persistant ici, hors de l'<Outlet/> */}
    </>
  );
}
