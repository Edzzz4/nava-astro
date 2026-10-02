/* /.netlify/functions/download
   GET  ?t=<token>          → JSON status for the download page
                              { title, expires, files: [{ kind, remaining }] }
   POST t=<token>&file=pdf  → the file, from the private "books" store
   Checks: HMAC signature, 72-hour expiry, 5 downloads per file.
   Only POST counts, so link scanners opening the email link don't burn
   downloads. A refused POST redirects (303) to the download page with
   ?e=<code>, keeping the token in the fragment. */
import { productById } from '../../src/data/books.ts';
import { json } from '../lib/site.js';
import { booksStore, getOrder, saveOrder } from '../lib/stores.js';
import { MAX_DOWNLOADS, verifyToken } from '../lib/token.js';

const KINDS = { pdf: 'application/pdf', epub: 'application/epub+zip' };

/** → { order, exp } | { error, order? } */
async function check(token) {
  const v = verifyToken(token);
  if (v.error === 'invalid') return { error: 'invalid' };
  const order = await getOrder(v.payload.o);
  if (!order) return { error: 'invalid' };
  if (v.error === 'expired') return { error: 'expired', order };
  return { order, exp: v.payload.exp };
}

export default async (req) => {
  if (req.method === 'GET') return status(req);
  if (req.method === 'POST') return deliver(req);
  return json({ error: 'method' }, 405, { Allow: 'GET, POST' });
};

async function status(req) {
  const { order, exp, error } = await check(new URL(req.url).searchParams.get('t'));
  if (error) return json({ error }, error === 'expired' ? 410 : 403);
  const product = productById(order.product);
  return json({
    title: product?.title ?? order.product,
    // The token's expiry (a link re-issued by support has a later one).
    expires: new Date(exp * 1000).toISOString(),
    files: Object.keys(KINDS).map((kind) => ({
      kind,
      remaining: Math.max(0, MAX_DOWNLOADS - (order.downloads?.[kind] ?? 0)),
    })),
  });
}

async function deliver(req) {
  let form;
  try {
    form = await req.formData();
  } catch {
    return json({ error: 'body' }, 400);
  }
  const token = String(form.get('t') ?? '');
  const kind = String(form.get('file') ?? '');
  const { order, error } = await check(token);
  const back = (code) =>
    new Response(null, {
      status: 303,
      headers: {
        Location: `/${order?.lang ?? 'it'}/download/?e=${code}#t=${encodeURIComponent(token)}`,
        'Cache-Control': 'no-store',
      },
    });

  if (error) return back(error);
  if (!(kind in KINDS)) return back('invalid');
  if ((order.downloads?.[kind] ?? 0) >= MAX_DOWNLOADS) return back('limit');

  const key = order.files[kind];
  const file = await booksStore().get(key, { type: 'stream' });
  if (!file) {
    console.error('download: missing blob', key);
    return back('generic');
  }

  order.downloads = { ...order.downloads, [kind]: (order.downloads?.[kind] ?? 0) + 1 };
  order.lastDownloadAt = new Date().toISOString();
  await saveOrder(order);

  return new Response(file, {
    status: 200,
    headers: {
      'Content-Type': KINDS[kind],
      'Content-Disposition': `attachment; filename="${key}"`,
      'Cache-Control': 'private, no-store',
      'X-Content-Type-Options': 'nosniff',
      'Referrer-Policy': 'no-referrer',
    },
  });
}
