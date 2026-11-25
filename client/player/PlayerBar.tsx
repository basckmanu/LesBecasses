import { Link } from 'react-router';
import { usePlayer } from './PlayerContext';
import { Cover } from '../components/Cover';
import { formatClock } from '../lib/format';
import {
  Back15Icon,
  Forward30Icon,
  HeartIcon,
  NextIcon,
  PauseIcon,
  PlayIcon,
  PrevIcon,
  VolumeIcon,
} from '../components/icons';

/** Curseur stylé : la partie écoutée est colorée grâce à la variable CSS --p (0 → 100 %). */
function Slider(props: { value: number; max: number; onChange: (v: number) => void; label: string; className?: string }) {
  const pct = props.max ? (props.value / props.max) * 100 : 0;
  return (
    <input
      type="range"
      className={`slider ${props.className ?? ''}`}
      min={0}
      max={props.max}
      value={props.value}
      onChange={(e) => props.onChange(Number(e.target.value))}
      aria-label={props.label}
      style={{ '--p': `${pct}%` } as React.CSSProperties}
    />
  );
}

/**
 * Barre d'écoute flottante en verre dépoli, toujours visible :
 * commandes | pastille « en cours d'écoute » (pochette, titre, progression) | réglages.
 * Elle est hors de l'<Outlet/> : la lecture continue pendant la navigation.
 */
export function PlayerBar() {
  const p = usePlayer();
  const ep = p.episode;
  const duration = ep?.duration_sec ?? 0;
  const vol = p.muted ? 0 : p.volume;
  const liked = ep ? p.isLiked(ep.slug) : false;

  return (
    <div className={`playerbar glass ${ep ? '' : 'is-empty'}`} role="region" aria-label="Lecteur audio">
      {/* Gauche : commandes */}
      <div className="pb-controls">
        <button className="icon-btn" onClick={p.prev} disabled={!ep} aria-label="Épisode précédent ou retour au début">
          <PrevIcon />
        </button>
        <button className="icon-btn hide-sm" onClick={() => p.skip(-15)} disabled={!ep} aria-label="Reculer de 15 secondes">
          <Back15Icon />
        </button>
        <button className="pb-play" onClick={p.toggle} disabled={!ep} aria-label={p.playing ? 'Pause' : 'Lecture'}>
          {p.playing ? <PauseIcon size={20} /> : <PlayIcon size={20} />}
        </button>
        <button className="icon-btn hide-sm" onClick={() => p.skip(30)} disabled={!ep} aria-label="Avancer de 30 secondes">
          <Forward30Icon />
        </button>
        <button className="icon-btn" onClick={p.next} disabled={!p.hasNext} aria-label="Épisode suivant">
          <NextIcon />
        </button>
      </div>

      {/* Centre : pastille « en cours d'écoute » */}
      <div className="pb-now">
        {ep ? <Cover episode={ep} variant="mini" /> : <div className="pb-placeholder" aria-hidden />}
        <div className="pb-now-main">
          <div className="pb-now-text">
            {ep ? (
              <Link to={`/episodes/${ep.slug}`} className="pb-title">{ep.title}</Link>
            ) : (
              <span className="pb-title">Rien en écoute</span>
            )}
            <span className="pb-sub">{ep ? `Les Bécasses · Épisode ${ep.episode_number}` : 'Choisis un épisode et installe-toi'}</span>
          </div>
          <div className="pb-progress">
            <span className="pb-time">{formatClock(p.position)}</span>
            <Slider value={Math.floor(p.position)} max={duration} onChange={p.seek} label="Position de lecture" />
            <span className="pb-time">−{formatClock(Math.max(0, duration - p.position))}</span>
          </div>
        </div>
        {ep && (
          <button
            className={`icon-btn pb-like ${liked ? 'is-on' : ''}`}
            onClick={() => p.toggleLike(ep.slug)}
            aria-label={liked ? 'Retirer des favoris' : 'Ajouter aux favoris'}
            aria-pressed={liked}
          >
            <HeartIcon filled={liked} />
          </button>
        )}
      </div>

      {/* Droite : vitesse + volume */}
      <div className="pb-extra">
        <button className="pb-speed" onClick={p.cycleSpeed} disabled={!ep} aria-label={`Vitesse de lecture : ${p.speed}x`}>
          {String(p.speed).replace('.', ',')}×
        </button>
        <button className="icon-btn" onClick={p.toggleMute} aria-label={vol ? 'Couper le son' : 'Rétablir le son'}>
          <VolumeIcon level={vol} />
        </button>
        <Slider value={Math.round(vol * 100)} max={100} onChange={(v) => p.setVolume(v / 100)} label="Volume" className="pb-volume" />
      </div>
    </div>
  );
}
