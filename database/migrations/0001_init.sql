-- CONTRAT figé en J1 (voir README).
-- Ne jamais modifier une migration déjà appliquée : créer 0002_xxx.sql.

CREATE TABLE episodes (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  slug TEXT UNIQUE NOT NULL,
  guid TEXT UNIQUE NOT NULL,             -- uuid, ne change JAMAIS (identité RSS)
  title TEXT NOT NULL,
  summary TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'draft',  -- draft | published
  published_at TEXT,
  youtube_id TEXT,
  audio_key TEXT,
  audio_bytes INTEGER,                   -- requis par la balise <enclosure>
  duration_sec INTEGER,
  season INTEGER,
  episode_number INTEGER
);

CREATE TABLE tags (
  id INTEGER PRIMARY KEY,
  slug TEXT UNIQUE NOT NULL,
  label TEXT NOT NULL
);

CREATE TABLE episode_tags (
  episode_id INTEGER NOT NULL REFERENCES episodes(id),
  tag_id INTEGER NOT NULL REFERENCES tags(id),
  PRIMARY KEY (episode_id, tag_id)
);

-- Index pour les listes publiques et le filtrage par tag
CREATE INDEX idx_episodes_status_published ON episodes (status, published_at DESC);
CREATE INDEX idx_episode_tags_tag ON episode_tags (tag_id);
