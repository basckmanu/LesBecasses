import { Link } from 'react-router';
import type { Tag } from '../../shared/types';
import { THEME_STYLES } from '../mocks/episodes';

/** Grille de tuiles colorées, une par thème, qui mènent à la liste filtrée. */
export function ThemeTiles({ tags }: { tags: Tag[] }) {
  return (
    <div className="tiles">
      {tags.map((t) => {
        const s = THEME_STYLES[t.slug] ?? { from: '#7b1e2c', to: '#b0394c', pitch: '' };
        return (
          <Link
            key={t.slug}
            to={`/episodes?tag=${t.slug}`}
            className="tile"
            style={{ background: `linear-gradient(100deg, ${s.from}, ${s.to})` }}
          >
            <span>{s.pitch}</span>
            <strong>{t.label}</strong>
          </Link>
        );
      })}
    </div>
  );
}
