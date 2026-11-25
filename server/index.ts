import { Hono } from 'hono';
import { HTTPException } from 'hono/http-exception';
import type { AppEnv } from './env';
import { publicRoutes } from './routes/public';
import { adminRoutes } from './routes/admin';
import { adminTagRoutes } from './routes/admin-tags';
import { uploadRoutes } from './routes/uploads';
import { feedRoutes } from './routes/feeds';
import { seoRoutes } from './routes/seo';
import { adminAuth } from './middleware/admin-auth';

// Seules les routes de `run_worker_first` (wrangler.toml) arrivent ici.
// Tout le reste (JS, CSS, pages React) est servi directement par les assets.
const app = new Hono<AppEnv>();

app.get('/api/health', (c) => c.json({ ok: true }));

// API publique
app.route('/api', publicRoutes);

// API admin : Cloudflare Access en façade + validation du JWT ici (défense en profondeur)
app.use('/api/admin/*', adminAuth);
app.get('/api/admin/me', (c) => c.json({ user: c.get('adminEmail') })); // « suis-je connecté ? »
app.route('/api/admin/episodes', adminRoutes);
app.route('/api/admin/tags', adminTagRoutes);
app.route('/api/admin/uploads', uploadRoutes);

// Flux et SEO
app.route('/', feedRoutes); // /rss.xml, /sitemap.xml
app.route('/episodes', seoRoutes); // /episodes/:slug avec meta/OG injectées

app.notFound((c) => {
  if (c.req.path.startsWith('/api/')) return c.json({ error: 'Introuvable' }, 404);
  return c.env.ASSETS.fetch(c.req.raw); // fallback SPA
});

app.onError((err, c) => {
  // Erreurs HTTP volontaires (ex. 401 du basic-auth, avec son en-tête WWW-Authenticate) : on les laisse passer telles quelles
  if (err instanceof HTTPException) return err.getResponse();
  console.error(err);
  return c.json({ error: 'Erreur interne' }, 500);
});

export default app;
