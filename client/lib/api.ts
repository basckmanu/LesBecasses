import { useEffect, useState } from 'react';
import { adminAuthHeader } from './admin-auth';

// Client de l'API Hono (server/). En dev, Vite redirige /api vers `wrangler dev` (8787).

export class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
    /** Pour les refus d'accès admin : "basic" (modale de connexion) ou "access" (Cloudflare Access) */
    public auth?: 'basic' | 'access',
  ) {
    super(message);
  }
}

export async function api<T>(path: string, init?: RequestInit): Promise<T> {
  // Les identifiants admin ne partent QUE vers /api/admin
  const auth = path.startsWith('/api/admin') ? adminAuthHeader() : {};
  let res: Response;
  try {
    res = await fetch(path, { ...init, headers: { 'Content-Type': 'application/json', ...auth, ...init?.headers } });
  } catch {
    throw new ApiError(0, 'Serveur injoignable');
  }
  const isJson = res.headers.get('content-type')?.includes('json');
  const data = isJson ? await res.json() : null;
  if (!res.ok) {
    const msg = typeof data?.error === 'string' ? data.error : `Erreur ${res.status}`;
    const authMode = data?.auth === 'basic' || data?.auth === 'access' ? data.auth : undefined;
    // En dev, si `npm run server` n'est pas lancé, le proxy Vite renvoie une erreur sans JSON
    throw new ApiError(res.status, res.status >= 500 && !isJson ? 'Serveur injoignable' : msg, authMode);
  }
  if (!isJson) throw new ApiError(res.status, 'Réponse inattendue du serveur');
  return data as T;
}

type State<T> = { data: T | null; error: ApiError | null; loading: boolean };

/** Charge une ressource GET. `path` à null = ne rien charger. */
export function useApi<T>(path: string | null) {
  const [state, setState] = useState<State<T>>({ data: null, error: null, loading: !!path });
  const [version, setVersion] = useState(0);

  useEffect(() => {
    if (!path) return;
    let cancelled = false;
    setState((s) => ({ ...s, loading: true, error: null }));
    api<T>(path)
      .then((data) => !cancelled && setState({ data, error: null, loading: false }))
      .catch((error: ApiError) => !cancelled && setState({ data: null, error, loading: false }));
    return () => {
      cancelled = true;
    };
  }, [path, version]);

  return { ...state, reload: () => setVersion((v) => v + 1) };
}
