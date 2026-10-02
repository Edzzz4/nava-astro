/* ─────────────────────────────────────────────────────────────
   READ-ONLY readiness check of a Stripe account against
   src/data/books.ts. Changes nothing, prints no secrets.

     npm run stripe:check          # sandbox key from .env
     npm run stripe:check:live     # live key from .env.live (git-ignored)

   For live, a restricted key (rk_live_…) with read-only access is
   enough. Exit code 1 if anything blocking is found.
   ───────────────────────────────────────────────────────────── */

import Stripe from 'stripe';
import { CURRENCIES, STRIPE_TAX_CODE, TAX_INCLUSIVE, products } from '../src/data/books.ts';

const key = process.env.STRIPE_SECRET_KEY ?? '';
const m = /^(sk|rk)_(test|live)_/.exec(key);
if (!m) {
  console.error('STRIPE_SECRET_KEY missing or not a Stripe secret/restricted key.');
  process.exit(1);
}
const live = m[2] === 'live';
const stripe = new Stripe(key);
const WEBHOOK_PATH = '/.netlify/functions/stripe-webhook';
const EVENTS = ['checkout.session.completed', 'checkout.session.async_payment_succeeded', 'checkout.session.async_payment_failed'];

let blocking = 0;
const ok = (msg) => console.log(`  ✓ ${msg}`);
const bad = (msg) => (blocking++, console.log(`  ✗ ${msg}`));
const note = (msg) => console.log(`  · ${msg}`);
const section = (t) => console.log(`\n${t}`);
/** "NL standard/small_seller" — options are keyed by lowercase country code. */
function describeRegistration(r) {
  const o = r.country_options?.[r.country.toLowerCase()];
  const scheme = o?.[o?.type]?.place_of_supply_scheme;
  return `${r.country}${o?.type ? ` ${o.type}` : ''}${scheme ? `/${scheme}` : ''}`;
}

async function read(label, fn) {
  try {
    return await fn();
  } catch (err) {
    note(`${label}: not readable with this key (${err?.code ?? err?.type ?? 'error'})`);
    return undefined;
  }
}

console.log(`Stripe ${live ? 'LIVE' : 'sandbox/test'} — ${m[1] === 'rk' ? 'restricted key' : 'secret key'} (read-only check)`);
if (m[1] === 'sk') note('Stripe recommends a restricted key (rk_…) with only the permissions needed');

section('Account');
const acct = await read('account', () => stripe.accounts.retrieve());
if (acct) {
  note(`${acct.id} · ${acct.country} · ${acct.default_currency} · "${acct.business_profile?.name ?? '-'}" · MCC ${acct.business_profile?.mcc ?? '-'}`);
  acct.charges_enabled ? ok('payments enabled') : bad('payments NOT enabled (complete account activation)');
  acct.payouts_enabled ? ok('payouts enabled') : bad('payouts NOT enabled');
  const due = acct.requirements?.currently_due ?? [];
  due.length ? bad(`requirements due: ${due.join(', ')}`) : ok('no requirements due');
  acct.business_profile?.url ? ok(`website: ${acct.business_profile.url}`) : bad('website URL missing');
  acct.business_profile?.support_email ? ok('support email set') : note('support email not set (shown on receipts)');
}

section('Stripe Tax');
const tax = await read('tax settings', () => stripe.tax.settings.retrieve());
if (tax) {
  tax.status === 'active'
    ? ok(`settings active (head office ${tax.head_office?.address?.country}, preset tax code ${tax.defaults?.tax_code ?? '-'})`)
    : bad('settings "pending": head office address missing (Dashboard → Tax → Settings)');
}
const regs = await read('tax registrations', () => stripe.tax.registrations.list({ limit: 100 }));
if (regs) {
  const active = regs.data.filter((r) => r.status === 'active');
  active.length
    ? ok(`active registrations: ${active.map(describeRegistration).join(', ')}`)
    : bad('no active tax registration: automatic tax would collect 0 (ask the tax advisor which ones)');
}

section('Products and prices (src/data/books.ts)');
for (const p of products) {
  const prod = await read(p.stripe.product, () => stripe.products.retrieve(p.stripe.product));
  if (!prod) {
    bad(`${p.stripe.product}: product missing (npm run stripe:setup)`);
    continue;
  }
  const issues = [];
  if (!prod.active) issues.push('inactive');
  if (prod.tax_code !== STRIPE_TAX_CODE) issues.push(`tax_code ${prod.tax_code}`);
  if (prod.name !== p.title) issues.push('name differs');
  for (const c of CURRENCIES) {
    const { data } = await stripe.prices.list({ lookup_keys: [p.stripe.lookupKeys[c]], active: true, limit: 1 });
    const pr = data[0];
    const want = Math.round(p.prices[c] * 100);
    const tb = TAX_INCLUSIVE[c] ? 'inclusive' : 'exclusive';
    if (!pr) issues.push(`${c} price missing`);
    else if (pr.unit_amount !== want || pr.currency !== c.toLowerCase() || pr.tax_behavior !== tb || pr.product !== prod.id)
      issues.push(`${c} ${pr.unit_amount}/${pr.tax_behavior} ≠ ${want}/${tb}`);
  }
  issues.length ? bad(`${p.stripe.product}: ${issues.join('; ')}`) : ok(`${p.stripe.product}: product + ${CURRENCIES.join('/')} prices match`);
}

section('Webhook endpoint');
const hooks = await read('webhook endpoints', () => stripe.webhookEndpoints.list({ limit: 100 }));
if (hooks) {
  const ours = hooks.data.filter((h) => h.url.endsWith(WEBHOOK_PATH));
  if (!ours.length) {
    (live ? bad : note)(`no endpoint for …${WEBHOOK_PATH}${live ? '' : ' (local tests use stripe listen)'}`);
  }
  for (const h of ours) {
    const missing = EVENTS.filter((e) => !h.enabled_events.includes(e) && !h.enabled_events.includes('*'));
    const label = `${h.url} (${h.status}, API ${h.api_version ?? 'account default'})`;
    if (h.status !== 'enabled' || missing.length) bad(`${label}${missing.length ? ` missing: ${missing.join(', ')}` : ''}`);
    else ok(label);
    if (live && !h.url.startsWith('https://navaeditore.com/')) note(`live endpoint not on https://navaeditore.com: ${h.url}`);
  }
}

console.log(`\n${blocking ? `${blocking} blocking issue(s).` : 'Nothing blocking found.'}`);
process.exit(blocking ? 1 : 0);
