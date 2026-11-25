import { describe, expect, it } from 'vitest';
import { buildRss, escapeXml, withOp3, type RssConfig, type RssEpisode } from './rss';

const cfg: RssConfig = {
  title: 'Les Bécasses',
  description: 'Un podcast & des vidéos',
  siteUrl: 'https://exemple.fr',
  feedUrl: 'https://exemple.fr/rss.xml',
  author: 'Les Bécasses',
  ownerEmail: 'contact@exemple.fr',
  imageUrl: 'https://media.exemple.fr/cover.jpg',
  category: 'Society & Culture',
  language: 'fr',
  podcastGuid: 'aaaaaaaa-bbbb-5ccc-8ddd-eeeeeeeeeeee',
  mediaBaseUrl: 'https://media.exemple.fr',
  op3Prefix: 'https://op3.dev/e/',
};

const ep: RssEpisode = {
  guid: '7d1c2f0e-0001-4a3b-9c1d-000000000001',
  slug: 'ep-001-pilote',
  title: 'Épisode 1 <le pilote>',
  summary: 'Résumé',
  published_at: '2026-09-01T08:00:00Z',
  audio_key: 'ep-001-pilote.mp3',
  audio_bytes: 43200000,
  duration_sec: 2700,
  season: 1,
  episode_number: 1,
};

describe('buildRss', () => {
  const xml = buildRss([ep, { ...ep, guid: 'sans-audio', audio_key: null }], cfg);

  it('échappe le XML', () => {
    expect(escapeXml(`<a & "b">`)).toBe('&lt;a &amp; &quot;b&quot;&gt;');
    expect(xml).toContain('<title>Épisode 1 &lt;le pilote&gt;</title>');
    expect(xml).toContain('text="Society &amp; Culture"');
  });

  it('applique le préfixe OP3 uniquement sur l’enclosure', () => {
    expect(withOp3(cfg.op3Prefix, 'https://media.exemple.fr/a.mp3')).toBe('https://op3.dev/e/media.exemple.fr/a.mp3');
    expect(xml).toContain(
      '<enclosure url="https://op3.dev/e/media.exemple.fr/ep-001-pilote.mp3" length="43200000" type="audio/mpeg"/>',
    );
  });

  it('utilise le guid immuable et pas le slug', () => {
    expect(xml).toContain(`<guid isPermaLink="false">${ep.guid}</guid>`);
  });

  it('ignore les épisodes sans audio', () => {
    expect(xml).not.toContain('sans-audio');
  });

  it('contient les balises iTunes et podcast:guid', () => {
    expect(xml).toContain('<itunes:email>contact@exemple.fr</itunes:email>');
    expect(xml).toContain('<itunes:duration>2700</itunes:duration>');
    expect(xml).toContain(`<podcast:guid>${cfg.podcastGuid}</podcast:guid>`);
    expect(xml).toContain('<pubDate>Tue, 01 Sep 2026 08:00:00 GMT</pubDate>');
  });
});
