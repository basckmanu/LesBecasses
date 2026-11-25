import type { Episode } from '../../shared/types';
import { usePlayer } from '../player/PlayerContext';

type Props = {
  episode: Episode;
  /** La liste affichée autour du bouton : elle devient la file de lecture (précédent / suivant). */
  queue?: Episode[];
  /** "icon" : bouton rond ; "full" : bouton avec texte */
  variant?: 'icon' | 'full';
};

export function PlayButton({ episode, queue, variant = 'icon' }: Props) {
  const { episode: current, playing, play, toggle } = usePlayer();
  if (!episode.audio_url) return null;

  const isCurrent = current?.slug === episode.slug;
  const isPlaying = isCurrent && playing;
  const onClick = () => (isCurrent ? toggle() : play(episode, queue));

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
