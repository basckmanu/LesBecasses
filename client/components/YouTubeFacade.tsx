import { useState } from 'react';

/**
 * Façade légère : seule la miniature est chargée. L'iframe youtube-nocookie
 * n'arrive qu'au clic (performance + aucun cookie YouTube avant interaction).
 */
export function YouTubeFacade({ id, title }: { id: string; title: string }) {
  const [active, setActive] = useState(false);

  if (active) {
    return (
      <div className="video">
        <iframe
          src={`https://www.youtube-nocookie.com/embed/${id}?autoplay=1`}
          title={title}
          allow="autoplay; encrypted-media; picture-in-picture"
          allowFullScreen
        />
      </div>
    );
  }
  return (
    <button
      className="video"
      onClick={() => setActive(true)}
      aria-label={`Lire la vidéo : ${title}`}
      style={{ backgroundImage: `url(https://i.ytimg.com/vi/${id}/hqdefault.jpg)` }}
    >
      <span className="video-play" aria-hidden>▶</span>
      <span className="video-caption">Regarder la vidéo</span>
    </button>
  );
}
