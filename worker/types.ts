export type Env = {
  DB: D1Database;
  MEDIA: R2Bucket;
  ASSETS: Fetcher;

  // Vars (wrangler.toml)
  SITE_URL: string;
  MEDIA_BASE_URL: string;
  OP3_PREFIX: string;
  R2_BUCKET_NAME: string;
  AUTH_MODE: 'access' | 'basic';
  ACCESS_TEAM_DOMAIN: string;
  PODCAST_TITLE: string;
  PODCAST_DESCRIPTION: string;
  PODCAST_AUTHOR: string;
  PODCAST_OWNER_EMAIL: string;
  PODCAST_IMAGE_URL: string;
  PODCAST_CATEGORY: string;
  PODCAST_LANGUAGE: string;

  // Secrets
  ACCESS_AUD: string;
  R2_ACCOUNT_ID: string;
  R2_ACCESS_KEY_ID: string;
  R2_SECRET_ACCESS_KEY: string;
  BASIC_AUTH_USER?: string;
  BASIC_AUTH_PASSWORD?: string;
};

export type AppEnv = {
  Bindings: Env;
  Variables: { adminEmail: string };
};
