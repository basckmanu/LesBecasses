# Les Bécasses

Podcast / vidéocast, 100 % Cloudflare : **un seul Worker** sert le front React (assets statiques) et l'API Hono.

| Brique                 | Rôle                                        |
|------------------------|---------------------------------------------|
| Worker + Static Assets | Front React (Vite + React Router) + API Hono |
| D1 (`podcast-db`)      | Épisodes et tags                            |
| R2 (`podcast-media`)   | Fichiers MP3, lus via `media.`              |
| Cloudflare Access      | Protection de `/admin*` et `/api/admin/*`   |

## Structure

```
client/                  FRONT — React (Vite + React Router)            → Dev
  index.html               page HTML unique (meta/OG par défaut)
  main.tsx                 point d'entrée
  router.tsx               liste des routes
  layouts/                 mise en page commune (header, footer, lecteur)
  pages/                   une page = un fichier
    admin/                 pages du back-office (/admin)
  styles/                  CSS global, design tokens
  public/                  fichiers copiés tels quels (_headers, favicon)

server/                  BACK — API Hono sur Cloudflare Worker
  index.ts                 point d'entrée : branche les routes
  env.ts                   bindings et variables (DB, MEDIA, secrets…)
  routes/                  une route = un fichier                        → Dev
    public.ts                GET /api/episodes, /api/episodes/:slug, /api/tags
    admin.ts                 CRUD /api/admin/episodes + publish
    uploads.ts               POST /api/admin/uploads/sign
    feeds.ts                 /rss.xml et /sitemap.xml
    seo.ts                   meta/OG injectées sur /episodes/:slug
  middleware/              authentification admin                        → Infra 2
  services/                logique isolée et testable
    rss.ts (+ rss.test.ts)   générateur RSS                              → Infra 3
    r2-presign.ts            URLs présignées R2                          → Infra 1
  db/                      requêtes SQL (D1)
  validation/              schémas zod des entrées

shared/                  CONTRAT — types communs au front et au back
database/                BASE DE DONNÉES (D1)
  migrations/              schéma, figé en J1
  seed.sql                 5 épisodes factices pour le local

infra/terraform/         ressources Cloudflare (R2, D1, DNS…)            → Infra 1
scripts/                 outils (npm run setup)
.github/workflows/       CI : lint, typecheck, tests, build              → Infra 2
```

À la racine, uniquement des fichiers de config : `wrangler.toml` (Worker), `vite.config.ts` (front),
`tsconfig.*.json` (un par partie : client, server, node), `eslint.config.js`, `vitest.config.ts`.

## Lancer en local

Une seule fois :

```bash
git clone https://github.com/basckmanu/LesBecasses.git
cd LesBecasses
npm install
npm run setup          # crée .dev.vars + base D1 locale (migrations) + 5 épisodes factices
```

Ensuite, dans deux terminaux :

```bash
npm run server         # API Hono  → http://localhost:8787
npm run dev            # front     → http://localhost:5173  (ouvrir celui-là)
```

Ou les deux d'un coup : `npm start`.

## Environnements en ligne

| | Production | Test |
|---|---|---|
| Worker | `podcast` | `podcast-test` |
| Base D1 | `podcast-db` | `database_lesbecasses` |
| Adresse | domaine du site (à venir) | `*.workers.dev` |
| Connexion admin | Cloudflare Access | identifiant + mot de passe |
| Déployer | `npm run deploy` | `npm run deploy:test` |
| Migrations | `npm run db:migrate:remote` | `npm run db:migrate:test` |

Une seule fois pour le test, définir les identifiants de l'admin (demandés au clavier) :

```bash
npx wrangler secret put BASIC_AUTH_USER --env test
npx wrangler secret put BASIC_AUTH_PASSWORD --env test
```

⚠ Toujours modifier les bases en ligne via les **migrations** (`db:migrate:*`), jamais avec
`d1 execute --file` : sinon le registre des migrations se désynchronise.

## Règle d'or

Le dev ne touche pas à l'infra, les infras ne touchent pas au code applicatif.
Les deux se rejoignent via le contrat : `database/migrations/0001_init.sql` et `shared/types.ts`.
