/* POST /.netlify/functions/stripe-webhook  (called by Stripe)
   Verifies the signature, and for a paid Checkout Session:
   1. writes the order (product, files, expiry, download counters,
      EU consent) to the private "orders" store;
   2. copies the consent onto the PaymentIntent metadata (visible on
      the payment in the Stripe Dashboard);
   3. emails the personal download link via Resend.
   Idempotent: Stripe retries, and a session already delivered is skipped. */
import { productById } from '../../src/data/books.ts';
import { deliveryEmail, sendEmail } from '../lib/email.js';
import { stripeClient, trustedOrigin } from '../lib/site.js';
import { getOrder, saveOrder } from '../lib/stores.js';
import { TTL_HOURS, signToken } from '../lib/token.js';

const PAID_EVENTS = new Set(['checkout.session.completed', 'checkout.session.async_payment_succeeded']);

export default async (req) => {
  if (req.method !== 'POST') return new Response('method', { status: 405 });
  const stripe = stripeClient();

  let event;
  try {
    event = await stripe.webhooks.constructEventAsync(
      await req.text(),
      req.headers.get('stripe-signature') ?? '',
      process.env.STRIPE_WEBHOOK_SECRET ?? ''
    );
  } catch (err) {
    console.error('webhook: bad signature', err.message);
    return new Response('bad signature', { status: 400 });
  }

  if (!PAID_EVENTS.has(event.type)) return new Response('ignored', { status: 200 });
  const session = event.data.object;
  // Delayed payment methods: wait for async_payment_succeeded.
  if (session.payment_status !== 'paid') return new Response('not paid yet', { status: 200 });

  await fulfill(stripe, session);
  return new Response('ok', { status: 200 });
};

async function fulfill(stripe, session) {
  const existing = await getOrder(session.id);
  if (existing?.emailSentAt) return;

  const product = productById(session.metadata?.product ?? '');
  // Throw → 500 → Stripe retries and shows the failure in the Dashboard.
  if (!product) throw new Error(`webhook: unknown product "${session.metadata?.product}" in ${session.id}`);
  const email = session.customer_details?.email;
  if (!email) throw new Error(`webhook: no customer email in ${session.id}`);

  const now = Date.now();
  const order = existing ?? {
    id: session.id,
    livemode: session.livemode,
    product: product.id,
    lang: product.lang,
    files: { pdf: product.files.pdf, epub: product.files.epub },
    amount: session.amount_total,
    currency: session.currency,
    createdAt: new Date(now).toISOString(),
    expires: new Date(now + TTL_HOURS * 3600 * 1000).toISOString(),
    downloads: { pdf: 0, epub: 0 },
    consent: {
      termsOfService: session.consent?.terms_of_service ?? 'missing',
      version: session.metadata?.consent_version ?? 'unknown',
      at: new Date(session.created * 1000).toISOString(),
    },
  };
  if (order.consent.termsOfService !== 'accepted') {
    console.warn('webhook: consent not accepted', session.id, order.consent);
  }
  await saveOrder(order);

  if (session.payment_intent) {
    await stripe.paymentIntents.update(String(session.payment_intent), {
      metadata: {
        consent_tos: order.consent.termsOfService,
        consent_version: order.consent.version,
        consent_at: order.consent.at,
      },
    });
  }

  const token = signToken({ o: order.id, exp: Math.floor(Date.parse(order.expires) / 1000) });
  const link = `${trustedOrigin(session.metadata?.site)}/${order.lang}/download/#t=${token}`;
  const mail = deliveryEmail({
    lang: order.lang,
    title: product.title,
    link,
    expires: order.expires,
    orderRef: order.id.slice(-10),
  });
  await sendEmail({ to: email, ...mail, idempotencyKey: `delivery-${order.id}` });

  order.emailSentAt = new Date().toISOString();
  await saveOrder(order);
}
