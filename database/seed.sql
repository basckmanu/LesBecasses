-- 5 épisodes factices pour le développement local uniquement.
-- Chargé par `npm run setup` (idempotent).

INSERT OR IGNORE INTO tags (id, slug, label) VALUES
  (1, 'societe', 'Société'),
  (2, 'culture', 'Culture'),
  (3, 'invite', 'Invité'),
  (4, 'jeux-video', 'Jeux vidéo'),
  (5, 'sport', 'Sport');

INSERT OR IGNORE INTO episodes (id, slug, guid, title, summary, status, published_at, youtube_id, audio_key, audio_bytes, duration_sec, season, episode_number) VALUES
  (1, 'ep-001-pilote', '7d1c2f0e-0001-4a3b-9c1d-000000000001', 'Épisode 1 — Le pilote', 'On se présente et on explique le projet.', 'published', '2026-09-01T08:00:00Z', NULL, 'ep-001-pilote.mp3', 43200000, 2700, 1, 1),
  (2, 'ep-002-societe', '7d1c2f0e-0002-4a3b-9c1d-000000000002', 'Épisode 2 — Parlons société', 'Un premier débat de fond.', 'published', '2026-09-15T08:00:00Z', NULL, 'ep-002-societe.mp3', 41000000, 2560, 1, 2),
  (3, 'ep-003-invite', '7d1c2f0e-0003-4a3b-9c1d-000000000003', 'Épisode 3 — Notre premier invité', 'Rencontre avec un invité surprise.', 'published', '2026-10-01T08:00:00Z', NULL, 'ep-003-invite.mp3', 45500000, 2840, 1, 3),
  (4, 'ep-004-culture', '7d1c2f0e-0004-4a3b-9c1d-000000000004', 'Épisode 4 — Culture', 'Livres, films et coups de cœur.', 'published', '2026-10-15T08:00:00Z', NULL, 'ep-004-culture.mp3', 39800000, 2490, 1, 4),
  (5, 'ep-005-brouillon', '7d1c2f0e-0005-4a3b-9c1d-000000000005', 'Épisode 5 — En préparation', 'Brouillon : ne doit pas apparaître sur le site.', 'draft', NULL, NULL, NULL, NULL, NULL, 1, 5);

INSERT OR IGNORE INTO episode_tags (episode_id, tag_id) VALUES
  (1, 1), (2, 1), (3, 3), (3, 2), (4, 2), (5, 1);
