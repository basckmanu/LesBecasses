// Identifiants du back-office en mode « basic » (dev local / plan B).
// En production avec Cloudflare Access, rien n'est stocké ici : Access gère la session.
//
// Stockés en sessionStorage : oubliés à la fermeture de l'onglet, jamais envoyés ailleurs
// que sur /api/admin (même origine).

const KEY = 'admin:basic';

function toBase64(text: string): string {
  return btoa(String.fromCharCode(...new TextEncoder().encode(text)));
}

export function saveAdminCredentials(user: string, pass: string) {
  sessionStorage.setItem(KEY, toBase64(`${user}:${pass}`));
}

export function clearAdminCredentials() {
  sessionStorage.removeItem(KEY);
}

export function hasAdminCredentials(): boolean {
  return sessionStorage.getItem(KEY) !== null;
}

/** En-tête Authorization à joindre aux appels /api/admin (ou rien). */
export function adminAuthHeader(): Record<string, string> {
  const token = sessionStorage.getItem(KEY);
  return token ? { Authorization: `Basic ${token}` } : {};
}
