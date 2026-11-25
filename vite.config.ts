import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Le front vit dans client/ ; le build sort dans dist/ (servi par le Worker).
// En dev : Vite (5173) redirige l'API vers `wrangler dev` (8787).
export default defineConfig({
  root: 'client',
  plugins: [react()],
  build: {
    outDir: '../dist',
    emptyOutDir: true,
  },
  server: {
    proxy: {
      '/api': 'http://localhost:8787',
      '/rss.xml': 'http://localhost:8787',
      '/sitemap.xml': 'http://localhost:8787',
    },
  },
});
