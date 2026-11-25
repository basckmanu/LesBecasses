import { createMiddleware } from 'hono/factory';
import type { AppEnv } from '../env';
import { verifyAccessJwt } from './access-jwt';

/**
 * AUTH_MODE = "access" : Cloudflare Access (code par email, liste blanche Com) + validation du JWT.
 * AUTH_MODE = "basic"  : plan B (et dev local) — identifiant + mot de passe (secrets Worker).
 *
 * Les refus renvoient du JSON avec `auth` pour que le front sache quoi afficher :
 *   - auth: "basic"  → la modale de connexion du site ;
 *   - auth: "access" → un message (la connexion se fait via Cloudflare Access).
 * Volontairement SANS en-tête WWW-Authenticate : sinon le navigateur ouvre sa propre fenêtre.
 */
export const adminAuth = createMiddleware<AppEnv>(async (c, next) => {
  if (c.env.AUTH_MODE === 'basic') {
    const { BASIC_AUTH_USER: username, BASIC_AUTH_PASSWORD: password } = c.env;
    if (!username || !password) return c.json({ error: 'Connexion admin non configurée' }, 500);

    const creds = parseBasic(c.req.header('Authorization'));
    const ok = creds !== null && (await safeEqual(creds.user, username)) && (await safeEqual(creds.pass, password));
    if (!ok) {
      return c.json({ error: creds ? 'Identifiant ou mot de passe incorrect' : 'Connexion requise', auth: 'basic' }, 401);
    }
    c.set('adminEmail', username);
    return next();
  }

  const token = c.req.header('Cf-Access-Jwt-Assertion');
  if (!token) return c.json({ error: 'Non autorisé', auth: 'access' }, 403);
  try {
    const claims = await verifyAccessJwt(token, c.env.ACCESS_TEAM_DOMAIN, c.env.ACCESS_AUD);
    c.set('adminEmail', claims.email ?? claims.sub);
  } catch (err) {
    console.warn('JWT Access refusé', (err as Error).message);
    return c.json({ error: 'Non autorisé', auth: 'access' }, 403);
  }
  await next();
});

/** "Basic base64(user:pass)" → { user, pass } (le mot de passe peut contenir « : ») */
function parseBasic(header: string | undefined): { user: string; pass: string } | null {
  const match = header?.match(/^Basic\s+(.+)$/i);
  if (!match) return null;
  try {
    const bytes = Uint8Array.from(atob(match[1]!), (ch) => ch.charCodeAt(0));
    const decoded = new TextDecoder().decode(bytes);
    const i = decoded.indexOf(':');
    return i < 0 ? null : { user: decoded.slice(0, i), pass: decoded.slice(i + 1) };
  } catch {
    return null;
  }
}

/** Comparaison à temps constant (via empreintes SHA-256) : ne révèle pas la longueur ni le préfixe correct. */
async function safeEqual(a: string, b: string): Promise<boolean> {
  const enc = new TextEncoder();
  const [ha, hb] = await Promise.all([
    crypto.subtle.digest('SHA-256', enc.encode(a)),
    crypto.subtle.digest('SHA-256', enc.encode(b)),
  ]);
  const x = new Uint8Array(ha);
  const y = new Uint8Array(hb);
  let diff = 0;
  for (let i = 0; i < x.length; i++) diff |= x[i]! ^ y[i]!;
  return diff === 0;
}
