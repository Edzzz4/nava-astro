/* Origins this deploy may build links for (checkout return URLs, download
   links in emails). Netlify sets URL / DEPLOY_PRIME_URL / DEPLOY_URL per
   context; `netlify dev` runs on localhost. Anything else falls back to
   the main site URL, so a forged Host header can't redirect buyers. */
import Stripe from 'stripe';

function allowedOrigins() {
  const list = [process.env.URL, process.env.DEPLOY_PRIME_URL, process.env.DEPLOY_URL]
    .filter(Boolean)
    .map((u) => new URL(u).origin);
  if (process.env.NETLIFY_DEV === 'true' || process.env.CONTEXT === 'dev') {
    list.push('http://localhost:8888');
  }
  return list;
}

/** The request's own origin if allowed, else null. */
export function requestOrigin(req) {
  const origin = new URL(req.url).origin;
  return allowedOrigins().includes(origin) ? origin : null;
}

/** A stored origin (session metadata) if still allowed, else the main site. */
export function trustedOrigin(candidate) {
  const allowed = allowedOrigins();
  if (candidate && allowed.includes(candidate)) return candidate;
  return allowed[0] ?? 'https://navaeditore.com';
}

/** Stripe client. Live keys are refused outside the Production context. */
export function stripeClient() {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) throw new Error('STRIPE_SECRET_KEY is not set');
  if (key.startsWith('sk_live_') && process.env.CONTEXT !== 'production') {
    throw new Error('Live Stripe key outside the Production context: refused');
  }
  return new Stripe(key);
}

export function json(data, status = 200, headers = {}) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store', ...headers },
  });
}
