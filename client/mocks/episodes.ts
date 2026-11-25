// DONNÉES FACTICES pour la maquette. À remplacer par les appels à l'API
// (GET /api/episodes, /api/tags) quand le front sera branché.
import type { Episode, Tag } from '../../shared/types';

export const MOCK_TAGS: Tag[] = [
  { slug: 'societe', label: 'Société' },
  { slug: 'culture', label: 'Culture' },
  { slug: 'invite', label: 'Invité' },
  { slug: 'humour', label: 'Humour' },
  { slug: 'actu', label: 'Actu' },
];

const tag = (...slugs: string[]) => MOCK_TAGS.filter((t) => slugs.includes(t.slug));

export const MOCK_EPISODES: Episode[] = [
  {
    slug: 'ep-008-faut-il-tout-dire',
    title: 'Faut-il vraiment tout dire ?',
    summary:
      "Franchise brutale ou mensonges pieux : on débat de ce qu'on se doit de dire, à nos proches comme au travail. Avec, comme toujours, des avis très tranchés.",
    published_at: '2026-11-20T08:00:00Z',
    youtube_id: 'mock-video-8',
    audio_url: 'mock://ep-008.mp3',
    duration_sec: 3120,
    season: 1,
    episode_number: 8,
    tags: tag('societe', 'humour'),
  },
  {
    slug: 'ep-007-la-bibliotheque-ideale',
    title: 'Notre bibliothèque idéale',
    summary:
      "Chacune ramène trois livres qui l'ont marquée. On se dispute sur les classiques, on se réconcilie sur les BD.",
    published_at: '2026-11-06T08:00:00Z',
    youtube_id: 'mock-video-7',
    audio_url: 'mock://ep-007.mp3',
    duration_sec: 2760,
    season: 1,
    episode_number: 7,
    tags: tag('culture'),
  },
  {
    slug: 'ep-006-rencontre-avec-une-illustratrice',
    title: 'Rencontre avec une illustratrice',
    summary:
      "Notre invitée raconte son parcours, de ses premiers carnets aux couvertures de romans, et répond à nos questions les plus naïves.",
    published_at: '2026-10-23T08:00:00Z',
    youtube_id: 'mock-video-6',
    audio_url: 'mock://ep-006.mp3',
    duration_sec: 3480,
    season: 1,
    episode_number: 6,
    tags: tag('invite', 'culture'),
  },
  {
    slug: 'ep-005-on-a-teste-la-deconnexion',
    title: 'On a testé une semaine sans téléphone',
    summary: "Défi relevé (presque). Ce qu'on a gagné, ce qui nous a manqué, et pourquoi on ne recommencera pas tout de suite.",
    published_at: '2026-10-09T08:00:00Z',
    youtube_id: null,
    audio_url: 'mock://ep-005.mp3',
    duration_sec: 2280,
    season: 1,
    episode_number: 5,
    tags: tag('societe', 'humour'),
  },
  {
    slug: 'ep-004-retour-sur-l-actu',
    title: "Retour sur l'actu du mois",
    summary: "Les sujets qui nous ont fait réagir ce mois-ci, décortiqués avec (un peu de) sérieux.",
    published_at: '2026-09-25T08:00:00Z',
    youtube_id: 'mock-video-4',
    audio_url: 'mock://ep-004.mp3',
    duration_sec: 2940,
    season: 1,
    episode_number: 4,
    tags: tag('actu', 'societe'),
  },
  {
    slug: 'ep-003-nos-films-doudous',
    title: 'Nos films doudous',
    summary: 'Ceux "à regarder quand ça ne va pas". Spoiler : il y a beaucoup trop de comédies romantiques.',
    published_at: '2026-09-11T08:00:00Z',
    youtube_id: 'mock-video-3',
    audio_url: 'mock://ep-003.mp3',
    duration_sec: 2520,
    season: 1,
    episode_number: 3,
    tags: tag('culture', 'humour'),
  },
  {
    slug: 'ep-002-premier-invite',
    title: 'Notre tout premier invité',
    summary: 'Un ami de longue date se prête au jeu. On apprend tous les deux à parler devant un micro.',
    published_at: '2026-08-28T08:00:00Z',
    youtube_id: null,
    audio_url: 'mock://ep-002.mp3',
    duration_sec: 2100,
    season: 1,
    episode_number: 2,
    tags: tag('invite'),
  },
  {
    slug: 'ep-001-le-pilote',
    title: 'Le pilote : pourquoi Les Bécasses ?',
    summary: "On se présente, on explique le nom (oui, c'est un oiseau) et ce que vous allez entendre ici.",
    published_at: '2026-08-14T08:00:00Z',
    youtube_id: 'mock-video-1',
    audio_url: 'mock://ep-001.mp3',
    duration_sec: 1860,
    season: 1,
    episode_number: 1,
    tags: tag('societe'),
  },{
    slug: 'ep-001-le-pilote',
    title: 'Le pilote : pourquoi Les Bécasses ?',
    summary: "On se présente, on explique le nom (oui, c'est un oiseau) et ce que vous allez entendre ici.",
    published_at: '2026-08-14T08:00:00Z',
    youtube_id: 'mock-video-1',
    audio_url: 'mock://ep-001.mp3',
    duration_sec: 1860,
    season: 1,
    episode_number: 1,
    tags: tag('societe'),
  },
  {
    slug: 'ep-001-le-pilote',
    title: 'Le pilote : pourquoi Les Bécasses ?',
    summary: "On se présente, on explique le nom (oui, c'est un oiseau) et ce que vous allez entendre ici.",
    published_at: '2026-08-14T08:00:00Z',
    youtube_id: 'mock-video-1',
    audio_url: 'mock://ep-001.mp3',
    duration_sec: 1860,
    season: 1,
    episode_number: 1,
    tags: tag('societe'),
  },
];

/** Classement factice « les plus écoutés » (plus tard : stats OP3). */
export const MOCK_TOP_SLUGS = [
  'ep-006-rencontre-avec-une-illustratrice',
  'ep-008-faut-il-tout-dire',
  'ep-003-nos-films-doudous',
  'ep-001-le-pilote',
  'ep-005-on-a-teste-la-deconnexion',
  'ep-007-la-bibliotheque-ideale',
];

/** Couleur et accroche de chaque thème (tuiles de l'accueil). */
export const THEME_STYLES: Record<string, { from: string; to: string; pitch: string }> = {
  societe: { from: '#7b1e2c', to: '#b0394c', pitch: 'On refait le monde' },
  culture: { from: '#9c5f2c', to: '#d39a5c', pitch: 'Livres, films, coups de cœur' },
  invite: { from: '#8c3a52', to: '#c9798c', pitch: 'Ils et elles passent au salon' },
  humour: { from: '#4a2a24', to: '#8a5340', pitch: 'Pour rire sous le plaid' },
  actu: { from: '#5a1420', to: '#93283c', pitch: "L'actu, version canapé" },
};

/** Notes d'épisode factices (le contrat MVP n'a que `summary`). */
export const MOCK_NOTES = [
  'Introduction et nouvelles de la semaine',
  'Le sujet du jour',
  'Le débat',
  'Nos recommandations',
  'Le mot de la fin',
];

/** Lignes du back-office (inclut des brouillons). */
export const MOCK_ADMIN_ROWS = [
  { id: 9, title: 'Spécial fin d\'année', status: 'draft' as const, published_at: null, audio_key: null, audio_bytes: null },
  ...MOCK_EPISODES.map((e, i) => ({
    id: 8 - i,
    title: e.title,
    status: 'published' as const,
    published_at: e.published_at,
    audio_key: `${e.slug}.mp3`,
    audio_bytes: (e.duration_sec ?? 0) * 16000,
  })),
];
