import { createBrowserRouter, Link, Outlet } from 'react-router';

// Squelette : chaque page est un placeholder à remplacer par le dev.

function RootLayout() {
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

const Placeholder = ({ title }: { title: string }) => <h1>{title}</h1>;

export const router = createBrowserRouter([
  {
    element: <RootLayout />,
    children: [
      { path: '/', element: <Placeholder title="Accueil" /> },
      { path: '/episodes', element: <Placeholder title="Épisodes" /> },
      { path: '/episodes/:slug', element: <Placeholder title="Épisode" /> },
      { path: '/a-propos', element: <Placeholder title="À propos" /> },
      { path: '/mentions-legales', element: <Placeholder title="Mentions légales" /> },
      // Protégé par Cloudflare Access (/admin*)
      { path: '/admin', element: <Placeholder title="Administration" /> },
      { path: '*', element: <Placeholder title="Page introuvable" /> },
    ],
  },
]);
