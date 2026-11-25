import { Hono } from 'hono';
import type { AppEnv } from '../env';
import { getPublishedBySlug } from '../db/episodes';

// SEO d'une SPA : sur /episodes/:slug, on sert index.html avec titre,
// description et balises OpenGraph déjà remplis (Google + aperçus de partage).
export const seoRoutes = new Hono<AppEnv>();

class SetAttr {
  constructor(private attr: string, private value: string) {}
  element(el: Element) {
    el.setAttribute(this.attr, this.value);
  }
}
class SetText {
  constructor(private value: string) {}
  element(el: Element) {
    el.setInnerContent(this.value); // échappé par HTMLRewriter
  }
}

seoRoutes.get('/:slug', async (c) => {
  const indexReq = new Request(new URL('/', c.req.url), c.req.raw); // "/" : les assets redirigent /index.html
  const index = await c.env.ASSETS.fetch(indexReq);

  const ep = await getPublishedBySlug(c.env.DB, c.req.param('slug'));
  if (!ep) return new Response(index.body, { status: 404, headers: index.headers }); // la SPA affiche sa page 404

  const title = `${ep.title} · ${c.env.PODCAST_TITLE}`;
  const url = `${c.env.SITE_URL}/episodes/${ep.slug}`;
  const image = ep.youtube_id ? `https://i.ytimg.com/vi/${ep.youtube_id}/hqdefault.jpg` : c.env.PODCAST_IMAGE_URL;

  return new HTMLRewriter()
    .on('title', new SetText(title))
    .on('meta[name="description"]', new SetAttr('content', ep.summary))
    .on('meta[property="og:title"]', new SetAttr('content', title))
    .on('meta[property="og:description"]', new SetAttr('content', ep.summary))
    .on('meta[property="og:url"]', new SetAttr('content', url))
    .on('meta[property="og:image"]', new SetAttr('content', image))
    .on('meta[property="og:type"]', new SetAttr('content', 'article'))
    .on('link[rel="canonical"]', new SetAttr('href', url))
    .transform(index);
});
