// Petites conversions pour le formulaire d'épisode du back-office.

/** "Le pilote : pourquoi ?" → "le-pilote-pourquoi" (même règle que le serveur) */
export function slugify(text: string): string {
  return text
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 100);
}

/** "45:00" → 2700, "1:02:03" → 3723, "45" → 2700 (minutes). Vide → null. Invalide → NaN. */
export function parseDuration(input: string): number | null {
  const v = input.trim();
  if (!v) return null;
  if (/^\d+$/.test(v)) return Number(v) * 60;
  const parts = v.split(':').map(Number);
  if (parts.length < 2 || parts.length > 3 || parts.some((n) => !Number.isInteger(n) || n < 0)) return NaN;
  return parts.reduce((acc, n) => acc * 60 + n, 0);
}

/** 2700 → "45:00", 3723 → "1:02:03" */
export function durationToInput(sec: number | null): string {
  if (!sec) return '';
  const h = Math.floor(sec / 3600);
  const m = Math.floor((sec % 3600) / 60);
  const s = String(sec % 60).padStart(2, '0');
  return h ? `${h}:${String(m).padStart(2, '0')}:${s}` : `${m}:${s}`;
}

/** Accepte un ID ou n'importe quel lien YouTube (watch?v=, youtu.be/, shorts/, embed/). */
export function extractYouTubeId(input: string): string | null {
  const v = input.trim();
  if (!v) return null;
  if (/^[A-Za-z0-9_-]{11}$/.test(v)) return v;
  const m = v.match(/(?:v=|youtu\.be\/|shorts\/|embed\/|live\/)([A-Za-z0-9_-]{11})/);
  return m ? m[1]! : null;
}
