import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { RouterProvider } from 'react-router';
import { router } from './router';
import { PlayerProvider } from './player/PlayerContext';
// Polices auto-hébergées (pas d'appel à Google Fonts → pas de souci RGPD)
import '@fontsource-variable/fraunces/full.css';
import '@fontsource-variable/nunito';
import './styles/global.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    {/* Le lecteur est AU-DESSUS du routeur : son état survit à toutes les navigations */}
    <PlayerProvider>
      <RouterProvider router={router} />
    </PlayerProvider>
  </StrictMode>,
);
