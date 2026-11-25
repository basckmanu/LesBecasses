import { Hono } from 'hono';
import type { AppEnv } from '../env';
import { listAllPublished } from '../db/episodes';
import { buildRss, escapeXml } from '../services/rss';

export const feedRoutes = new Hono<AppEnv>();

// GET /rss.xml — lu par Spotify, Apple Podcasts, etc.
feedRoutes.get('/rss.xml', async (c) => {
  const env = c.env;
  const episodes = await listAllPublished(env.DB);
  // Publiés => published_at toujours rempli
  const xml = buildRss(episodes.map((e) => ({ ...e, published_at: e.published_at! })), {
    title: env.PODCAST_TITLE,
    description: env.PODCAST_DESCRIPTION,
    siteUrl: env.SITE_URL,
    feedUrl: `${env.SITE_URL}/rss.xml`,
    author: env.PODCAST_AUTHOR,
    ownerEmail: env.PODCAST_OWNER_EMAIL,
    imageUrl: env.PODCAST_IMAGE_URL,
    category: env.PODCAST_CATEGORY,
    language: env.PODCAST_LANGUAGE,
    mediaBaseUrl: env.MEDIA_BASE_URL,
    op3Prefix: env.OP3_PREFIX,
  });
  return c.body(xml, 200, {
    'Content-Type': 'application/rss+xml; charset=utf-8',
    'Cache-Control': 'public, max-age=300, s-maxage=900',
  });
});

// GET /sitemap.xml — dynamique, à soumettre dans la Search Console
feedRoutes.get('/sitemap.xml', async (c) => {
  const site = c.env.SITE_URL;
  const episodes = await listAllPublished(c.env.DB);
  const urls = [
    { loc: `${site}/`, lastmod: episodes[0]?.published_at },
    { loc: `${site}/episodes`, lastmod: episodes[0]?.published_at },
    { loc: `${site}/a-propos` },
    ...episodes.map((e) => ({ loc: `${site}/episodes/${e.slug}`, lastmod: e.published_at ?? undefined })),
  ];
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls
  .map((u) => `  <url><loc>${escapeXml(u.loc)}</loc>${u.lastmod ? `<lastmod>${u.lastmod.slice(0, 10)}</lastmod>` : ''}</url>`)
  .join('\n')}
</urlset>
`;
  return c.body(xml, 200, {
    'Content-Type': 'application/xml; charset=utf-8',
    'Cache-Control': 'public, max-age=300, s-maxage=3600',
  });
});
