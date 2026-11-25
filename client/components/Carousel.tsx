import { useEffect, useRef, useState, type ReactNode } from 'react';

type Props = {
  title: string;
  /** Classe de la piste : "ranked" (classement) ou "posters" (pochettes) */
  kind: 'ranked' | 'posters';
  children: ReactNode;
};

/** Section avec titre, flèches ← → et piste défilante horizontalement. */
export function Carousel({ title, kind, children }: Props) {
  const track = useRef<HTMLDivElement>(null);
  const [atStart, setAtStart] = useState(true);
  const [atEnd, setAtEnd] = useState(false);

  useEffect(() => {
    const el = track.current;
    if (!el) return;
    const update = () => {
      setAtStart(el.scrollLeft <= 4);
      setAtEnd(el.scrollLeft + el.clientWidth >= el.scrollWidth - 4);
    };
    update();
    el.addEventListener('scroll', update, { passive: true });
    window.addEventListener('resize', update);
    return () => {
      el.removeEventListener('scroll', update);
      window.removeEventListener('resize', update);
    };
  }, []);

  const scroll = (dir: 1 | -1) => {
    const el = track.current;
    if (el) el.scrollBy({ left: dir * el.clientWidth * 0.8 });
  };

  return (
    <section className="section" aria-label={title}>
      <div className="section-head">
        <h2>{title}</h2>
        <div className="arrows">
          <button className="round-btn" onClick={() => scroll(-1)} disabled={atStart} aria-label="Précédents">←</button>
          <button className="round-btn" onClick={() => scroll(1)} disabled={atEnd} aria-label="Suivants">→</button>
        </div>
      </div>
      <div ref={track} className={`carousel ${kind}`}>
        {children}
      </div>
    </section>
  );
}
