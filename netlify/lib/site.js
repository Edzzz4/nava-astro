/* Which site a request belongs to, and which origins we build links for
   (checkout return URLs, download links in emails).

   At RUNTIME Netlify Functions only get URL, SITE_NAME and SITE_ID:
   CONTEXT, DEPLOY_URL and DEPLOY_PRIME_URL exist at build time only.
   So the deploy context comes from the function's `context` argument
   (context.deploy.context), and previews are recognised by their host:
   https://<deploy-preview-N|branch|deploy-id>--<SITE_NAME>.netlify.app.
   Anything else falls back to the main site URL, so a forged Host header
   can't redirect buyers elsewhere. */
import Stripe from 'stripe';

/** Main site origin, e.g. https://navaeditore.com. */
export function siteOrigin() {
  return process.env.URL ? new URL(process.env.URL).origin : 'https://navaeditore.com';
}

/** Our own origins only: the main site, its Netlify previews, local dev. */
export function isAllowedOrigin(origin) {
  if (!origin) return false;
  if (origin === siteOrigin()) return true;
  if (process.env.NETLIFY_DEV === 'true' && /^http:\/\/localhost:\d+$/.test(origin)) return true;
  const name = process.env.SITE_NAME;
  return Boolean(name) && new RegExp(`^https://[a-z0-9-]+--${name}\\.netlify\\.app$`).test(origin);
}

/** The request's own origin if it is one of ours, else null. */
export function requestOrigin(req) {
  const origin = new URL(req.url).origin;
  return isAllowedOrigin(origin) ? origin : null;
}

/** A stored origin (session metadata) if still one of ours, else the main site. */
export function trustedOrigin(candidate) {
  return isAllowedOrigin(candidate) ? candidate : siteOrigin();
}

/**
 * Production = the Production deploy context, or any request served on the
 * main site URL (belt and braces in case the context is missing).
 */
export function isProduction(req, context) {
  return context?.deploy?.context === 'production' || new URL(req.url).origin === siteOrigin();
}

/** Stripe client. Live keys are refused outside production. */
export function stripeClient({ production }) {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) throw new Error('STRIPE_SECRET_KEY is not set');
  if (/^(sk|rk)_live_/.test(key) && !production) {
    throw new Error('Live Stripe key outside production: refused');
  }
  return new Stripe(key);
}

export function json(data, status = 200, headers = {}) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store', ...headers },
  });
}

/** Wraps a handler: unexpected errors are logged, never returned (no stack traces). */
export function guarded(handler, onError = () => json({ error: 'server' }, 500)) {
  return async (req, context) => {
    try {
      return await handler(req, context);
    } catch (err) {
      console.error('function error:', err?.message ?? err);
      return onError(err);
    }
  };
}
