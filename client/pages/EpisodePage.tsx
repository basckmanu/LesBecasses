import { useParams } from 'react-router';

// TODO : détail depuis GET /api/episodes/:slug
export function EpisodePage() {
  const { slug } = useParams();
  return <h1>Épisode : {slug}</h1>;
}
