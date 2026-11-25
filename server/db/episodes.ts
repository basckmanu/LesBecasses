import type { AdminEpisode, Episode, Tag } from '../../shared/types';

type EpisodeRow = Omit<AdminEpisode, 'tags'>;
type RowWithTags = EpisodeRow & { tags_json: string };

// Agrège les tags d'un épisode en JSON dans la même requête (pas de N+1).
const TAGS_JSON = `COALESCE(
  (SELECT json_group_array(json_object('slug', t.slug, 'label', t.label))
     FROM episode_tags et JOIN tags t ON t.id = et.tag_id
    WHERE et.episode_id = e.id), '[]') AS tags_json`;

export function toPublic(row: RowWithTags, mediaBaseUrl: string): Episode {
  return {
    slug: row.slug,
    title: row.title,
    summary: row.summary,
    published_at: row.published_at!,
    youtube_id: row.youtube_id,
    audio_url: row.audio_key ? `${mediaBaseUrl}/${row.audio_key}` : null,
    duration_sec: row.duration_sec,
    season: row.season,
    episode_number: row.episode_number,
    tags: JSON.parse(row.tags_json) as Tag[],
  };
}

export async function listPublished(
  db: D1Database,
  opts: { tag?: string; limit: number; offset: number },
) {
  const where = `e.status = 'published'` +
    (opts.tag
      ? ` AND EXISTS (SELECT 1 FROM episode_tags et JOIN tags t ON t.id = et.tag_id
                      WHERE et.episode_id = e.id AND t.slug = ?1)`
      : '');
  const binds = opts.tag ? [opts.tag] : [];

  const [rows, count] = await db.batch([
    db
      .prepare(
        `SELECT e.*, ${TAGS_JSON} FROM episodes e WHERE ${where}
         ORDER BY e.published_at DESC LIMIT ?${binds.length + 1} OFFSET ?${binds.length + 2}`,
      )
      .bind(...binds, opts.limit, opts.offset),
    db.prepare(`SELECT COUNT(*) AS n FROM episodes e WHERE ${where}`).bind(...binds),
  ]);
  return {
    rows: rows.results as RowWithTags[],
    total: (count.results[0] as { n: number }).n,
  };
}

/** Tous les épisodes publiés (RSS, sitemap). */
export async function listAllPublished(db: D1Database) {
  const { results } = await db
    .prepare(
      `SELECT e.*, ${TAGS_JSON} FROM episodes e
       WHERE e.status = 'published' ORDER BY e.published_at DESC`,
    )
    .all<RowWithTags>();
  return results;
}

export async function getPublishedBySlug(db: D1Database, slug: string) {
  return db
    .prepare(`SELECT e.*, ${TAGS_JSON} FROM episodes e WHERE e.slug = ? AND e.status = 'published'`)
    .bind(slug)
    .first<RowWithTags>();
}

export async function listTags(db: D1Database): Promise<Tag[]> {
  const { results } = await db.prepare('SELECT slug, label FROM tags ORDER BY label').all<Tag>();
  return results;
}

// ---------- Admin ----------

export async function getAdminEpisode(db: D1Database, id: number): Promise<AdminEpisode | null> {
  const row = await db.prepare(`SELECT e.*, ${TAGS_JSON} FROM episodes e WHERE e.id = ?`).bind(id).first<RowWithTags>();
  if (!row) return null;
  const { tags_json, ...rest } = row;
  return { ...rest, tags: (JSON.parse(tags_json) as Tag[]).map((t) => t.slug) };
}

/** Remplace les tags d'un épisode. Les tags doivent exister (créés par slug/label). */
export function setTagsStatements(db: D1Database, episodeId: number, tagSlugs: string[]) {
  return [
    db.prepare('DELETE FROM episode_tags WHERE episode_id = ?').bind(episodeId),
    ...tagSlugs.map((slug) =>
      db
        .prepare('INSERT INTO episode_tags (episode_id, tag_id) SELECT ?, id FROM tags WHERE slug = ?')
        .bind(episodeId, slug),
    ),
  ];
}
