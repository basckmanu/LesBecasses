import { createBrowserRouter } from 'react-router';
import { RootLayout } from './layouts/RootLayout';
import { HomePage } from './pages/HomePage';
import { EpisodesPage } from './pages/EpisodesPage';
import { EpisodePage } from './pages/EpisodePage';
import { AboutPage } from './pages/AboutPage';
import { LegalPage } from './pages/LegalPage';
import { NotFoundPage } from './pages/NotFoundPage';
import { AdminLayout } from './layouts/AdminLayout';
import { AdminPage } from './pages/admin/AdminPage';
import { EpisodeFormPage } from './pages/admin/EpisodeFormPage';

export const router = createBrowserRouter([
  {
    element: <RootLayout />,
    children: [
      { path: '/', element: <HomePage /> },
      { path: '/episodes', element: <EpisodesPage /> },
      { path: '/episodes/:slug', element: <EpisodePage /> },
      { path: '/a-propos', element: <AboutPage /> },
      { path: '/mentions-legales', element: <LegalPage /> },

      // Back-office : AdminLayout vérifie l'accès (modale en local, Cloudflare Access en production)
      {
        path: '/admin',
        element: <AdminLayout />,
        children: [
          { index: true, element: <AdminPage /> },
          { path: 'episodes/new', element: <EpisodeFormPage /> },
          { path: 'episodes/:id', element: <EpisodeFormPage /> },
        ],
      },

      { path: '*', element: <NotFoundPage /> },
    ],
  },
]);
