import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import type { Episode } from '../../shared/types';

// MAQUETTE : la lecture est SIMULÉE (un compteur avance), car les MP3 n'existent pas encore.
// Version réelle : un seul <audio> dans le layout, piloté par ce même contexte
// (playbackRate pour la vitesse, volume/muted pour le son).

export const SPEEDS = [1, 1.25, 1.5, 2, 0.75] as const;

type PlayerState = {
  episode: Episode | null;
  playing: boolean;
  position: number; // secondes
  speed: number;
  volume: number; // 0 → 1
  muted: boolean;
  hasPrev: boolean;
  hasNext: boolean;
  /** `queue` : la liste d'où l'on lance l'épisode (devient la file de lecture) */
  play: (episode: Episode, queue?: Episode[]) => void;
  toggle: () => void;
  seek: (seconds: number) => void;
  skip: (delta: number) => void;
  next: () => void;
  prev: () => void;
  cycleSpeed: () => void;
  setVolume: (v: number) => void;
  toggleMute: () => void;
  isLiked: (slug: string) => boolean;
  toggleLike: (slug: string) => void;
};

const PlayerContext = createContext<PlayerState | null>(null);
const positionKey = (slug: string) => `player:position:${slug}`;
const readNumber = (key: string, fallback: number) => {
  const v = Number(localStorage.getItem(key));
  return Number.isFinite(v) && localStorage.getItem(key) !== null ? v : fallback;
};

/**
 * File de lecture (précédent / suivant) : la liste affichée là où l'on a lancé
 * l'épisode (accueil, liste filtrée…), comme sur les applis de streaming.
 */
export function PlayerProvider({ children }: { children: ReactNode }) {
  const [playlist, setPlaylist] = useState<Episode[]>([]);
  const [episode, setEpisode] = useState<Episode | null>(null);
  const [playing, setPlaying] = useState(false);
  const [position, setPosition] = useState(0);
  const [speed, setSpeed] = useState(() => readNumber('player:speed', 1));
  const [volume, setVolumeState] = useState(() => readNumber('player:volume', 0.8));
  const [muted, setMuted] = useState(false);
  const [liked, setLiked] = useState<string[]>(() => JSON.parse(localStorage.getItem('player:liked') ?? '[]'));
  const duration = episode?.duration_sec ?? 0;

  // Une seule entrée par épisode (au cas où la liste contient des doublons)
  const queue = useMemo(() => [...new Map(playlist.map((e) => [e.slug, e])).values()], [playlist]);
  const index = episode ? queue.findIndex((e) => e.slug === episode.slug) : -1;

  const load = useCallback((ep: Episode, autoplay = true) => {
    setEpisode(ep);
    setPosition(readNumber(positionKey(ep.slug), 0));
    setPlaying(autoplay);
  }, []);

  const next = useCallback(() => {
    const n = queue[index + 1];
    if (n) load(n);
  }, [queue, index, load]);

  // Simulation de lecture : avance de `speed` secondes par seconde, enchaîne sur le suivant à la fin
  useEffect(() => {
    if (!playing) return;
    const id = setInterval(() => setPosition((p) => Math.min(p + speed, duration)), 1000);
    return () => clearInterval(id);
  }, [playing, speed, duration]);

  useEffect(() => {
    if (!episode || !playing || position < duration) return;
    localStorage.removeItem(positionKey(episode.slug));
    if (queue[index + 1]) next();
    else setPlaying(false);
  }, [position, duration, episode, playing, queue, index, next]);

  // Persistance : position par épisode, réglages, favoris
  useEffect(() => {
    if (episode && position < duration) localStorage.setItem(positionKey(episode.slug), String(Math.floor(position)));
  }, [episode, position, duration]);
  useEffect(() => localStorage.setItem('player:speed', String(speed)), [speed]);
  useEffect(() => localStorage.setItem('player:volume', String(volume)), [volume]);
  useEffect(() => localStorage.setItem('player:liked', JSON.stringify(liked)), [liked]);

  const value = useMemo<PlayerState>(
    () => ({
      episode,
      playing,
      position,
      speed,
      volume,
      muted,
      hasPrev: index > 0,
      hasNext: index >= 0 && index < queue.length - 1,
      play: (ep, list) => {
        setPlaylist(list?.length ? list : [ep]);
        if (episode?.slug === ep.slug) setPlaying(true);
        else load(ep);
      },
      toggle: () => episode && setPlaying((p) => !p),
      seek: (s) => setPosition(Math.min(Math.max(0, s), duration)),
      skip: (d) => setPosition((p) => Math.min(Math.max(0, p + d), duration)),
      next,
      // Comme sur les lecteurs habituels : revient au début si on a déjà écouté quelques secondes
      prev: () => {
        if (position > 5 || index <= 0) setPosition(0);
        else load(queue[index - 1]!);
      },
      cycleSpeed: () => setSpeed((s) => SPEEDS[(SPEEDS.indexOf(s as (typeof SPEEDS)[number]) + 1) % SPEEDS.length]!),
      setVolume: (v) => {
        setVolumeState(Math.min(Math.max(0, v), 1));
        setMuted(false);
      },
      toggleMute: () => setMuted((m) => !m),
      isLiked: (slug) => liked.includes(slug),
      toggleLike: (slug) => setLiked((l) => (l.includes(slug) ? l.filter((s) => s !== slug) : [...l, slug])),
    }),
    [episode, playing, position, speed, volume, muted, index, queue, duration, load, next, liked],
  );

  return <PlayerContext.Provider value={value}>{children}</PlayerContext.Provider>;
}

export function usePlayer() {
  const ctx = useContext(PlayerContext);
  if (!ctx) throw new Error('usePlayer doit être utilisé dans <PlayerProvider>');
  return ctx;
}
