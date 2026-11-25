// Module Infra 2 — relu par le dev.
// Valide le JWT `Cf-Access-Jwt-Assertion` ajouté par Cloudflare Access.
// Défense en profondeur : même si Access était contourné, l'API refuse.

type Jwk = JsonWebKey & { kid: string };
type JwtHeader = { alg: string; kid: string };
export type AccessClaims = { aud: string | string[]; email?: string; exp: number; iss: string; sub: string };

let cachedKeys: { at: number; keys: Jwk[] } | null = null;
const KEYS_TTL_MS = 60 * 60 * 1000;

function b64urlDecode(s: string): Uint8Array {
  const pad = s.length % 4 === 0 ? '' : '='.repeat(4 - (s.length % 4));
  return Uint8Array.from(atob(s.replace(/-/g, '+').replace(/_/g, '/') + pad), (c) => c.charCodeAt(0));
}
const decodeJson = <T>(s: string): T => JSON.parse(new TextDecoder().decode(b64urlDecode(s))) as T;

async function getKeys(teamDomain: string, forceRefresh = false): Promise<Jwk[]> {
  if (!forceRefresh && cachedKeys && Date.now() - cachedKeys.at < KEYS_TTL_MS) return cachedKeys.keys;
  const res = await fetch(`https://${teamDomain}/cdn-cgi/access/certs`);
  if (!res.ok) throw new Error(`Certs Access indisponibles (${res.status})`);
  const { keys } = (await res.json()) as { keys: Jwk[] };
  cachedKeys = { at: Date.now(), keys };
  return keys;
}

/** Renvoie les claims si le token est valide, sinon lève une erreur. */
export async function verifyAccessJwt(token: string, teamDomain: string, audience: string): Promise<AccessClaims> {
  const parts = token.split('.');
  if (parts.length !== 3) throw new Error('JWT mal formé');
  const [h, p, sig] = parts as [string, string, string];
  const header = decodeJson<JwtHeader>(h);
  if (header.alg !== 'RS256') throw new Error('Algorithme non supporté');

  let jwk = (await getKeys(teamDomain)).find((k) => k.kid === header.kid);
  if (!jwk) jwk = (await getKeys(teamDomain, true)).find((k) => k.kid === header.kid); // rotation de clés
  if (!jwk) throw new Error('Clé inconnue');

  const key = await crypto.subtle.importKey('jwk', jwk, { name: 'RSASSA-PKCS1-v1_5', hash: 'SHA-256' }, false, ['verify']);
  const ok = await crypto.subtle.verify('RSASSA-PKCS1-v1_5', key, b64urlDecode(sig), new TextEncoder().encode(`${h}.${p}`));
  if (!ok) throw new Error('Signature invalide');

  const claims = decodeJson<AccessClaims>(p);
  const auds = Array.isArray(claims.aud) ? claims.aud : [claims.aud];
  if (!auds.includes(audience)) throw new Error('Audience invalide');
  if (claims.iss !== `https://${teamDomain}`) throw new Error('Émetteur invalide');
  if (claims.exp * 1000 < Date.now()) throw new Error('Token expiré');
  return claims;
}
