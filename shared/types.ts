// CONTRAT API partagé entre le front (client/) et le serveur (server/).
// Toute modification se discute à plusieurs (voir README).

export type EpisodeStatus = 'draft' | 'published';

export type Tag = {
  slug: string;
  label: string;
};

/** Épisode tel que renvoyé par l'API publique. */
export type Episode = {
  slug: string;
  title: string;
  summary: string;
  published_at: string; // ISO 8601
  youtube_id: string | null;
  audio_url: string | null; // URL publique sur media. (sans préfixe OP3)
  duration_sec: number | null;
  season: number | null;
  episode_number: number | null;
  tags: Tag[];
};

export type EpisodeListResponse = {
  episodes: Episode[];
  page: number;
  page_size: number;
  total: number;
};

/** Épisode complet côté admin. */
export type AdminEpisode = {
  id: number;
  slug: string;
  guid: string;
  title: string;
  summary: string;
  status: EpisodeStatus;
  published_at: string | null;
  youtube_id: string | null;
  audio_key: string | null;
  audio_bytes: number | null;
  duration_sec: number | null;
  season: number | null;
  episode_number: number | null;
  tags: string[]; // slugs
};

/** Corps de POST/PUT /api/admin/episodes. */
export type AdminEpisodeInput = Pick<
  AdminEpisode,
  'slug' | 'title' | 'summary' | 'youtube_id' | 'audio_key' | 'duration_sec' | 'season' | 'episode_number' | 'tags'
>;

/** Réponse de POST /api/admin/uploads/sign. */
export type UploadSignResponse = {
  url: string; // URL présignée (endpoint S3 de R2)
  key: string;
  expires_in: number;
};
