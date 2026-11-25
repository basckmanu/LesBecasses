import { useMemo, useRef, useState, type CSSProperties, type KeyboardEvent, type PointerEvent } from 'react';
import { Link } from 'react-router';
import type { Episode } from '../../shared/types';
import { coverColors } from '../lib/cover-colors';
import { formatDuration } from '../lib/format';
import { Cover } from './Cover';
import { PlayButton } from './PlayButton';

/**
 * Carrousel en perspective : la carte centrale est mise en avant, les voisines
 * sont inclinées en 3D. Un halo reprend la couleur de l'épisode sélectionné.
 * Navigation : clic sur une carte voisine, flèches ← →, clavier ou glissé (mobile).
 */
export function Coverflow({ title, episodes }: { title: string; episodes: Episode[] }) {
  // Une seule carte par épisode (au cas où la liste contient des doublons)
  const items = useMemo(() => [...new Map(episodes.map((e) => [e.slug, e])).values()], [episodes]);
  // Démarre sur la 3ᵉ carte : des voisines de chaque côté (le tout dernier épisode est déjà « à la une »)
  const [active, setActive] = useState(() => Math.min(2, Math.max(0, items.length - 1)));
  const dragStart = useRef<number | null>(null);

  const go = (i: number) => setActive(Math.min(Math.max(0, i), items.length - 1));
  const current = items[active];
  if (!current) return null;
  const [c1, c2] = coverColors(current);

  const onKey = (e: KeyboardEvent) => {
    if (e.key === 'ArrowLeft') go(active - 1);
    if (e.key === 'ArrowRight') go(active + 1);
  };
  const onPointerDown = (e: PointerEvent) => (dragStart.current = e.clientX);
  const onPointerUp = (e: PointerEvent) => {
    if (dragStart.current === null) return;
    const dx = e.clientX - dragStart.current;
    dragStart.current = null;
    if (Math.abs(dx) > 40) go(active + (dx < 0 ? 1 : -1));
  };

  return (
    <section className="section coverflow" aria-label={title} aria-roledescription="carrousel">
      <div className="coverflow-halo" style={{ '--c1': c1, '--c2': c2 } as CSSProperties} aria-hidden />
      <div className="section-head">
        <h2>{title}</h2>
        <div className="arrows">
          <button className="round-btn glass" onClick={() => go(active - 1)} disabled={active === 0} aria-label="Épisode précédent">←</button>
          <button className="round-btn glass" onClick={() => go(active + 1)} disabled={active === items.length - 1} aria-label="Épisode suivant">→</button>
        </div>
      </div>

      <div
        className="coverflow-stage"
        tabIndex={0}
        onKeyDown={onKey}
        onPointerDown={onPointerDown}
        onPointerUp={onPointerUp}
        aria-live="polite"
      >
        {items.map((ep, i) => {
          const o = i - active;
          const abs = Math.abs(o);
          const sign = Math.sign(o);
          const style = {
            transform: [
              `translateX(${sign * (abs === 0 ? 0 : 58 + (abs - 1) * 34)}%)`,
              `translateZ(${-abs * 90}px)`,
              `rotateY(${-sign * Math.min(abs, 1) * 38}deg)`,
              `scale(${1 - Math.min(abs, 3) * 0.08})`,
            ].join(' '),
            zIndex: 20 - abs,
            opacity: abs > 3 ? 0 : 1 - abs * 0.12,
            pointerEvents: abs > 3 ? 'none' : undefined,
          } as CSSProperties;

          const isActive = o === 0;
          return (
            <article
              key={ep.slug}
              className={`cf-card glass ${isActive ? 'is-active' : ''}`}
              style={style}
              aria-hidden={!isActive}
              onClick={isActive ? undefined : () => go(i)}
            >
              <div className="cf-cover">
                <Cover episode={ep} variant="title" />
                {isActive && <PlayButton episode={ep} queue={items} />}
              </div>
              <div className="cf-text">
                {isActive ? (
                  <Link to={`/episodes/${ep.slug}`} className="cf-title">{ep.title}</Link>
                ) : (
                  <span className="cf-title">{ep.title}</span>
                )}
                <span className="cf-sub">Épisode {ep.episode_number} · {formatDuration(ep.duration_sec)}</span>
              </div>
            </article>
          );
        })}
      </div>

      <div className="coverflow-dots" role="tablist" aria-label="Choisir un épisode">
        {items.map((ep, i) => (
          <button
            key={ep.slug}
            role="tab"
            aria-selected={i === active}
            aria-label={ep.title}
            className={i === active ? 'is-active' : ''}
            onClick={() => go(i)}
          />
        ))}
      </div>
    </section>
  );
}
