import { createBrowserRouter } from 'react-router';
import { RootLayout } from './layouts/RootLayout';
import { HomePage } from './pages/HomePage';
import { EpisodesPage } from './pages/EpisodesPage';
import { EpisodePage } from './pages/EpisodePage';
import { AboutPage } from './pages/AboutPage';
import { LegalPage } from './pages/LegalPage';
import { NotFoundPage } from './pages/NotFoundPage';
import { AdminPage } from './pages/admin/AdminPage';

export const router = createBrowserRouter([
  {
    element: <RootLayout />,
    children: [
      { path: '/', element: <HomePage /> },
      { path: '/episodes', element: <EpisodesPage /> },
      { path: '/episodes/:slug', element: <EpisodePage /> },
      { path: '/a-propos', element: <AboutPage /> },
      { path: '/mentions-legales', element: <LegalPage /> },

      // Protégé par Cloudflare Access (/admin*)
      { path: '/admin', element: <AdminPage /> },

      { path: '*', element: <NotFoundPage /> },
    ],
  },
]);
