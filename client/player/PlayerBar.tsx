import { Link } from 'react-router';
import { usePlayer } from './PlayerContext';
import { Cover } from '../components/Cover';
import { formatClock } from '../lib/format';

/** Mini-barre fixe en bas de l'écran, hors de l'<Outlet/> : elle survit aux navigations. */
export function PlayerBar() {
  const { episode, playing, position, toggle, seek, skip, close } = usePlayer();
  if (!episode) return null;
  const duration = episode.duration_sec ?? 0;

  return (
    <div className="player" role="region" aria-label="Lecteur audio">
      <div className="player-info">
        <Cover episode={episode} compact />
        <div style={{ minWidth: 0 }}>
          <div className="player-title">
            <Link to={`/episodes/${episode.slug}`}>{episode.title}</Link>
          </div>
          <div className="player-sub">Les Bécasses · Épisode {episode.episode_number}</div>
        </div>
      </div>

      <div className="player-controls">
        <button onClick={() => skip(-15)} aria-label="Reculer de 15 secondes">−15</button>
        <button className="play-btn" onClick={toggle} aria-label={playing ? 'Pause' : 'Lecture'}>
          {playing ? '❚❚' : '▶'}
        </button>
        <button onClick={() => skip(30)} aria-label="Avancer de 30 secondes">+30</button>
      </div>

      <div className="player-progress">
        <span>{formatClock(position)}</span>
        <input
          type="range"
          min={0}
          max={duration}
          value={position}
          onChange={(e) => seek(Number(e.target.value))}
          aria-label="Position de lecture"
        />
        <span>{formatClock(duration)}</span>
        <button className="btn ghost small player-close" onClick={close} aria-label="Fermer le lecteur" style={{ color: 'inherit' }}>
          ✕
        </button>
      </div>
    </div>
  );
}
