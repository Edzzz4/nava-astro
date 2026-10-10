/* ─────────────────────────────────────────────────────────────
   Signs a download link for an existing order (support, and the
   expired-link test). Needs the DOWNLOAD_SECRET of the target
   context (local .env, or the one set in Netlify).

     node --env-file=.env scripts/download-link.mjs <cs_…> [--hours 72] [--lang it] [--site http://localhost:8888]

   --hours -1 makes an already expired link (test).
   ───────────────────────────────────────────────────────────── */

import { signToken } from '../netlify/lib/token.js';

const [orderId, ...rest] = process.argv.slice(2);
if (!orderId?.startsWith('cs_')) {
  console.error('Usage: download-link.mjs <checkout session id cs_…> [--hours 72] [--lang it|en] [--site URL]');
  process.exit(1);
}
const opt = (name, fallback) => {
  const i = rest.indexOf(`--${name}`);
  return i >= 0 && rest[i + 1] !== undefined ? rest[i + 1] : fallback;
};
const hours = Number(opt('hours', '72'));
const lang = opt('lang', 'it');
const site = opt('site', 'http://localhost:8888');

const exp = Math.floor(Date.now() / 1000 + hours * 3600);
console.log(`${site}/${lang}/download/#t=${signToken({ o: orderId, exp })}`);
console.log(`expires ${new Date(exp * 1000).toISOString()}`);
