/* POST /.netlify/functions/checkout  { product, currency }
   Creates a Stripe Checkout Session for one ebook edition and returns
   { url }. The price is resolved by lookup key (same in test and live)
   and must match the price shown on the site (src/data/books.ts).
   EU digital content: the buyer must tick the consent box (immediate
   delivery + loss of the 14-day withdrawal right); Stripe records it
   in session.consent, stripe-webhook.js copies it into the order. */
import { CURRENCIES, productById } from '../../src/data/books.ts';
import { json, requestOrigin, stripeClient } from '../lib/site.js';

/** Bump when the consent text changes: stored with every order. */
const CONSENT_VERSION = '2026-10-02';

const COPY = {
  it: {
    consent: (terms) =>
      `Chiedo la consegna immediata dell'ebook e riconosco che, una volta iniziata la consegna, perdo il diritto di recesso di 14 giorni. Accetto i [Termini di vendita](${terms}).`,
    submit: 'Subito dopo il pagamento ricevi via email il link per scaricare il PDF e l’EPUB.',
  },
  en: {
    consent: (terms) =>
      `I request immediate delivery of the ebook and acknowledge that, once delivery has started, I lose my 14-day right of withdrawal. I accept the [Terms of sale](${terms}).`,
    submit: 'Right after payment you will receive an email with the link to download the PDF and the EPUB.',
  },
};

export default async (req) => {
  if (req.method !== 'POST') return json({ error: 'method' }, 405, { Allow: 'POST' });

  // Same-origin only: the buy button is on our own product pages.
  const origin = requestOrigin(req);
  if (!origin || req.headers.get('origin') !== origin) return json({ error: 'origin' }, 403);

  let body;
  try {
    body = await req.json();
  } catch {
    return json({ error: 'body' }, 400);
  }
  const product = productById(String(body?.product ?? ''));
  const currency = String(body?.currency ?? '');
  if (!product || !CURRENCIES.includes(currency)) return json({ error: 'input' }, 400);

  const lang = product.lang;
  const stripe = stripeClient();
  const lookupKey = product.stripe.lookupKeys[currency];
  const { data } = await stripe.prices.list({ lookup_keys: [lookupKey], active: true, limit: 1 });
  const price = data[0];
  const expected = Math.round(product.prices[currency] * 100);
  if (
    !price ||
    price.unit_amount !== expected ||
    price.currency !== currency.toLowerCase() ||
    price.product !== product.stripe.product
  ) {
    console.error('checkout: price mismatch', { lookupKey, expected, found: price?.unit_amount, product: price?.product });
    return json({ error: 'price' }, 500);
  }

  const copy = COPY[lang];
  const metadata = { product: product.id, lang, currency, consent_version: CONSENT_VERSION };
  const session = await stripe.checkout.sessions.create({
    mode: 'payment',
    // Tags these sessions in the Dashboard (fixed label, random suffix).
    integration_identifier: 'nava-ebook-checkout-qhtwmzrk',
    line_items: [{ price: price.id, quantity: 1 }],
    locale: lang,
    success_url: `${origin}/${lang}/grazie/`,
    cancel_url: `${origin}/${lang}/catalogo/${product.id}/`,
    automatic_tax: { enabled: process.env.STRIPE_AUTOMATIC_TAX !== 'false' },
    consent_collection: { terms_of_service: 'required' },
    custom_text: {
      terms_of_service_acceptance: { message: copy.consent(`${origin}/${lang}/legale/termini-di-vendita/`) },
      submit: { message: copy.submit },
    },
    metadata: { ...metadata, site: origin },
    payment_intent_data: { metadata, description: `${product.title} (ebook, ${lang.toUpperCase()})` },
  });

  return json({ url: session.url });
};
