import type { Episode } from '../../shared/types';
import { usePlayer } from '../player/PlayerContext';

/** Bouton rond (variant "icon") ou bouton texte (variant "full"). */
export function PlayButton({ episode, variant = 'icon' }: { episode: Episode; variant?: 'icon' | 'full' }) {
  const { episode: current, playing, play, toggle } = usePlayer();
  if (!episode.audio_url) return null;

  const isCurrent = current?.slug === episode.slug;
  const isPlaying = isCurrent && playing;
  const onClick = () => (isCurrent ? toggle() : play(episode));

  if (variant === 'full') {
    return (
      <button className="btn" onClick={onClick}>
        {isPlaying ? '❚❚ Pause' : isCurrent ? '▶ Reprendre' : "▶ Écouter l'épisode"}
      </button>
    );
  }
  return (
    <button className="play-btn" onClick={onClick} aria-label={isPlaying ? 'Pause' : `Écouter ${episode.title}`}>
      {isPlaying ? '❚❚' : '▶'}
    </button>
  );
}
