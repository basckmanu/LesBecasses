import { Link } from 'react-router';
import type { Tag } from '../../shared/types';

export function TagChips({ tags }: { tags: Tag[] }) {
  if (!tags.length) return null;
  return (
    <ul className="chips">
      {tags.map((t) => (
        <li key={t.slug}>
          <Link className="chip" to={`/episodes?tag=${t.slug}`}>
            {t.label}
          </Link>
        </li>
      ))}
    </ul>
  );
}
