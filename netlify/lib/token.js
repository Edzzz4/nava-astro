/* Download tokens: base64url(JSON payload) + "." + base64url(HMAC-SHA256).
   Payload: { v: 1, o: <Stripe Checkout Session id>, exp: <unix seconds> }.
   The secret is DOWNLOAD_SECRET (env only, ≥ 32 chars, different per
   Netlify context). The download counter lives in the "orders" store,
   not in the token, so a token can't be replayed past the limit. */
import { createHmac, timingSafeEqual } from 'node:crypto';

export const TTL_HOURS = 72;
export const MAX_DOWNLOADS = 5;

export function downloadSecret() {
  const secret = process.env.DOWNLOAD_SECRET;
  if (!secret || secret.length < 32) throw new Error('DOWNLOAD_SECRET is missing or shorter than 32 characters');
  return secret;
}

const mac = (body, secret) => createHmac('sha256', secret).update(body).digest();

export function signToken(payload, secret = downloadSecret()) {
  const body = Buffer.from(JSON.stringify({ v: 1, ...payload })).toString('base64url');
  return `${body}.${mac(body, secret).toString('base64url')}`;
}

/** → { payload } | { error: 'invalid' } | { error: 'expired', payload } */
export function verifyToken(token, secret = downloadSecret(), now = Date.now()) {
  if (typeof token !== 'string' || token.length > 1024) return { error: 'invalid' };
  const parts = token.split('.');
  if (parts.length !== 2 || !parts[0] || !parts[1]) return { error: 'invalid' };
  const [body, sig] = parts;
  const given = Buffer.from(sig, 'base64url');
  const expected = mac(body, secret);
  if (given.length !== expected.length || !timingSafeEqual(given, expected)) return { error: 'invalid' };
  let payload;
  try {
    payload = JSON.parse(Buffer.from(body, 'base64url').toString('utf8'));
  } catch {
    return { error: 'invalid' };
  }
  if (payload?.v !== 1 || typeof payload.o !== 'string' || typeof payload.exp !== 'number') return { error: 'invalid' };
  if (now >= payload.exp * 1000) return { error: 'expired', payload };
  return { payload };
}
