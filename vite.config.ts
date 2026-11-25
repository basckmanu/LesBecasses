import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// En dev : Vite sert le front (5173) et redirige l'API vers `wrangler dev` (8787).
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': 'http://localhost:8787',
      '/rss.xml': 'http://localhost:8787',
      '/sitemap.xml': 'http://localhost:8787',
    },
  },
});
