// Module Infra 3 — relu par le dev.
// Fonction PURE : aucune dépendance à Cloudflare, testable avec des fixtures.

export type RssConfig = {
  title: string;
  description: string;
  siteUrl: string;
  feedUrl: string;
  author: string;
  ownerEmail: string; // sert à la vérification Spotify / Apple
  imageUrl: string; // cover 3000×3000
  category: string;
  language: string;
  podcastGuid?: string; // podcast:guid du show (uuid v5 de l'URL du flux)
  mediaBaseUrl: string;
  op3Prefix: string; // ex. https://op3.dev/e/ — appliqué UNIQUEMENT dans le RSS
};

export type RssEpisode = {
  guid: string;
  slug: string;
  title: string;
  summary: string;
  published_at: string;
  audio_key: string | null;
  audio_bytes: number | null;
  duration_sec: number | null;
  season: number | null;
  episode_number: number | null;
};

export function escapeXml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

/** https://media.x/ep.mp3 → https://op3.dev/e/media.x/ep.mp3 */
export function withOp3(prefix: string, url: string): string {
  return prefix + url.replace(/^https?:\/\//, '');
}

function item(ep: RssEpisode, cfg: RssConfig): string {
  const audio = `${cfg.mediaBaseUrl}/${ep.audio_key}`;
  const lines = [
    `<title>${escapeXml(ep.title)}</title>`,
    `<link>${escapeXml(`${cfg.siteUrl}/episodes/${ep.slug}`)}</link>`,
    `<guid isPermaLink="false">${escapeXml(ep.guid)}</guid>`,
    `<pubDate>${new Date(ep.published_at).toUTCString()}</pubDate>`,
    `<description>${escapeXml(ep.summary)}</description>`,
    `<enclosure url="${escapeXml(withOp3(cfg.op3Prefix, audio))}" length="${ep.audio_bytes ?? 0}" type="audio/mpeg"/>`,
    `<itunes:explicit>false</itunes:explicit>`,
  ];
  if (ep.duration_sec) lines.push(`<itunes:duration>${ep.duration_sec}</itunes:duration>`);
  if (ep.season) lines.push(`<itunes:season>${ep.season}</itunes:season>`);
  if (ep.episode_number) lines.push(`<itunes:episode>${ep.episode_number}</itunes:episode>`);
  return `    <item>\n      ${lines.join('\n      ')}\n    </item>`;
}

export function buildRss(episodes: RssEpisode[], cfg: RssConfig): string {
  // Un épisode sans audio n'a rien à faire dans un flux podcast
  const items = episodes.filter((e) => e.audio_key).map((e) => item(e, cfg));

  return `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0"
  xmlns:itunes="http://www.itunes.com/dtds/podcast-1.0.dtd"
  xmlns:podcast="https://podcastindex.org/namespace/1.0"
  xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${escapeXml(cfg.title)}</title>
    <link>${escapeXml(cfg.siteUrl)}</link>
    <atom:link href="${escapeXml(cfg.feedUrl)}" rel="self" type="application/rss+xml"/>
    <description>${escapeXml(cfg.description)}</description>
    <language>${escapeXml(cfg.language)}</language>
    <itunes:author>${escapeXml(cfg.author)}</itunes:author>
    <itunes:owner>
      <itunes:name>${escapeXml(cfg.author)}</itunes:name>
      <itunes:email>${escapeXml(cfg.ownerEmail)}</itunes:email>
    </itunes:owner>
    <itunes:image href="${escapeXml(cfg.imageUrl)}"/>
    <itunes:category text="${escapeXml(cfg.category)}"/>
    <itunes:explicit>false</itunes:explicit>
    <itunes:type>episodic</itunes:type>${cfg.podcastGuid ? `\n    <podcast:guid>${escapeXml(cfg.podcastGuid)}</podcast:guid>` : ''}
${items.join('\n')}
  </channel>
</rss>
`;
}
