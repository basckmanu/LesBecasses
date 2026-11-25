import { createMiddleware } from 'hono/factory';
import { basicAuth } from 'hono/basic-auth';
import type { AppEnv } from '../types';
import { verifyAccessJwt } from './access-jwt';

/**
 * AUTH_MODE = "access" : Cloudflare Access (one-time PIN, liste blanche Com) + validation JWT.
 * AUTH_MODE = "basic"  : plan B (et dev local) — basic-auth avec secrets Worker.
 */
export const adminAuth = createMiddleware<AppEnv>(async (c, next) => {
  if (c.env.AUTH_MODE === 'basic') {
    const { BASIC_AUTH_USER: username, BASIC_AUTH_PASSWORD: password } = c.env;
    if (!username || !password) return c.json({ error: 'Basic-auth non configuré' }, 500);
    c.set('adminEmail', username);
    return basicAuth({ username, password })(c, next);
  }

  const token = c.req.header('Cf-Access-Jwt-Assertion');
  if (!token) return c.json({ error: 'Non autorisé' }, 401);
  try {
    const claims = await verifyAccessJwt(token, c.env.ACCESS_TEAM_DOMAIN, c.env.ACCESS_AUD);
    c.set('adminEmail', claims.email ?? claims.sub);
  } catch (err) {
    console.warn('JWT Access refusé', (err as Error).message);
    return c.json({ error: 'Non autorisé' }, 403);
  }
  await next();
});
