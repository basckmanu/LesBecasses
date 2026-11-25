import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import type { Episode } from '../../shared/types';

// MAQUETTE : la lecture est SIMULÉE (un compteur avance), car les MP3 n'existent pas encore.
// Version réelle : un seul <audio> dans le layout, piloté par ce même contexte.

type PlayerState = {
  episode: Episode | null;
  playing: boolean;
  position: number; // secondes
  play: (episode: Episode) => void;
  toggle: () => void;
  seek: (seconds: number) => void;
  skip: (delta: number) => void;
  close: () => void;
};

const PlayerContext = createContext<PlayerState | null>(null);
const positionKey = (slug: string) => `player:position:${slug}`;

export function PlayerProvider({ children }: { children: ReactNode }) {
  const [episode, setEpisode] = useState<Episode | null>(null);
  const [playing, setPlaying] = useState(false);
  const [position, setPosition] = useState(0);
  const duration = episode?.duration_sec ?? 0;

  // Simulation de lecture : +1 s par seconde
  useEffect(() => {
    if (!playing) return;
    const id = setInterval(() => {
      setPosition((p) => {
        if (p + 1 >= duration) {
          setPlaying(false);
          return duration;
        }
        return p + 1;
      });
    }, 1000);
    return () => clearInterval(id);
  }, [playing, duration]);

  // Reprise de position : sauvegarde dans localStorage
  useEffect(() => {
    if (episode) localStorage.setItem(positionKey(episode.slug), String(position));
  }, [episode, position]);

  // Laisse de la place en bas de page quand la barre est visible
  useEffect(() => {
    document.body.classList.toggle('has-player', !!episode);
  }, [episode]);

  const play = useCallback(
    (next: Episode) => {
      if (episode?.slug === next.slug) {
        setPlaying(true);
        return;
      }
      setEpisode(next);
      setPosition(Number(localStorage.getItem(positionKey(next.slug)) ?? 0));
      setPlaying(true);
    },
    [episode],
  );

  const value = useMemo<PlayerState>(
    () => ({
      episode,
      playing,
      position,
      play,
      toggle: () => setPlaying((p) => !p),
      seek: (s) => setPosition(Math.min(Math.max(0, s), duration)),
      skip: (d) => setPosition((p) => Math.min(Math.max(0, p + d), duration)),
      close: () => {
        setPlaying(false);
        setEpisode(null);
      },
    }),
    [episode, playing, position, play, duration],
  );

  return <PlayerContext.Provider value={value}>{children}</PlayerContext.Provider>;
}

export function usePlayer() {
  const ctx = useContext(PlayerContext);
  if (!ctx) throw new Error('usePlayer doit être utilisé dans <PlayerProvider>');
  return ctx;
}
