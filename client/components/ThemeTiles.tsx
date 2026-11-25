import { Link } from 'react-router';
import type { Tag } from '../../shared/types';
import { themeStyle } from '../config/home';

/** Grille de tuiles colorées, une par thème, qui mènent à la liste filtrée. */
export function ThemeTiles({ tags }: { tags: Tag[] }) {
  return (
    <div className="tiles">
      {tags.map((t, i) => {
        const s = themeStyle(t.slug, i);
        return (
          <Link
            key={t.slug}
            to={`/episodes?tag=${t.slug}`}
            className="tile"
            style={{ background: `linear-gradient(100deg, ${s.from}, ${s.to})` }}
          >
            {s.pitch && <span>{s.pitch}</span>}
            <strong>{t.label}</strong>
          </Link>
        );
      })}
    </div>
  );
}
