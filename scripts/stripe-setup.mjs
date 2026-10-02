/* ─────────────────────────────────────────────────────────────
   Creates / updates the Stripe Products and Prices from
   src/data/books.ts. Idempotent. Dry run by default.

     node --env-file=.env scripts/stripe-setup.mjs           # show the plan
     node --env-file=.env scripts/stripe-setup.mjs --apply   # execute

   - One Product per edition, id = slug (same id in test and live),
     tax code "Digital Books - downloaded - non subscription - with
     permanent rights", metadata { slug, lang, files }.
   - One Price per currency, found by lookup key (<slug>_eur …).
     A Price can't change amount: a new one takes over the lookup key
     (transfer_lookup_key) and the old one is archived.
   - Active Prices in a currency no longer sold (e.g. GBP) are archived.
   - Live keys (sk_live_…) are refused unless --live is also passed.
   ───────────────────────────────────────────────────────────── */

import Stripe from 'stripe';
import { CURRENCIES, STRIPE_TAX_CODE, TAX_INCLUSIVE, products } from '../src/data/books.ts';

const args = new Set(process.argv.slice(2));
const apply = args.has('--apply');
const key = process.env.STRIPE_SECRET_KEY ?? '';

if (!/^sk_(test|live)_/.test(key) && !/^rk_(test|live)_/.test(key)) {
  console.error('STRIPE_SECRET_KEY missing or not a Stripe secret key (.env).');
  process.exit(1);
}
const live = /^(sk|rk)_live_/.test(key);
if (live && !args.has('--live')) {
  console.error('This is a LIVE key. Re-run with --live to confirm (see CLAUDE.md: STOP before live mode).');
  process.exit(1);
}

const stripe = new Stripe(key);
const mode = live ? 'LIVE' : 'test';
console.log(`Stripe ${mode} mode — ${apply ? 'APPLY' : 'dry run (add --apply to execute)'}\n`);

const plan = [];
const act = async (label, fn) => {
  plan.push(label);
  console.log(`${apply ? '→' : '·'} ${label}`);
  if (apply) await fn();
};

for (const p of products) {
  const wanted = {
    name: p.title,
    description: p.subtitle,
    tax_code: STRIPE_TAX_CODE,
    metadata: { slug: p.id, lang: p.lang, files: `${p.files.pdf},${p.files.epub}` },
  };

  let product = null;
  try {
    product = await stripe.products.retrieve(p.stripe.product);
  } catch (err) {
    if (err?.code !== 'resource_missing') throw err;
  }

  if (!product) {
    await act(`create product ${p.stripe.product}`, () => stripe.products.create({ id: p.stripe.product, ...wanted }));
  } else {
    const differs =
      product.name !== wanted.name ||
      product.description !== wanted.description ||
      product.tax_code !== wanted.tax_code ||
      !product.active ||
      Object.entries(wanted.metadata).some(([k, v]) => product.metadata?.[k] !== v);
    if (differs) {
      await act(`update product ${p.stripe.product}`, () =>
        stripe.products.update(p.stripe.product, { ...wanted, active: true })
      );
    } else {
      console.log(`  ok product ${p.stripe.product}`);
    }
  }

  for (const c of CURRENCIES) {
    const lookupKey = p.stripe.lookupKeys[c];
    const amount = Math.round(p.prices[c] * 100);
    const taxBehavior = TAX_INCLUSIVE[c] ? 'inclusive' : 'exclusive';
    const { data } = await stripe.prices.list({ lookup_keys: [lookupKey], limit: 1 });
    const current = data[0];
    const matches =
      current &&
      current.active &&
      current.unit_amount === amount &&
      current.currency === c.toLowerCase() &&
      current.tax_behavior === taxBehavior &&
      current.product === p.stripe.product;
    if (matches) {
      console.log(`  ok price ${lookupKey} ${amount} ${c} ${taxBehavior}`);
      continue;
    }
    await act(`create price ${lookupKey} ${amount} ${c} ${taxBehavior}${current ? ` (replaces ${current.id})` : ''}`, async () => {
      await stripe.prices.create({
        product: p.stripe.product,
        currency: c.toLowerCase(),
        unit_amount: amount,
        tax_behavior: taxBehavior,
        lookup_key: lookupKey,
        transfer_lookup_key: true,
        metadata: { slug: p.id, lang: p.lang },
      });
      if (current?.active) await stripe.prices.update(current.id, { active: false });
    });
  }

  // Currencies dropped from CURRENCIES: archive their active Prices.
  if (product) {
    const { data: active } = await stripe.prices.list({ product: p.stripe.product, active: true, limit: 100 });
    for (const pr of active.filter((x) => !CURRENCIES.includes(x.currency.toUpperCase()))) {
      await act(`archive price ${pr.lookup_key ?? pr.id} (${pr.currency.toUpperCase()} no longer sold)`, () =>
        stripe.prices.update(pr.id, { active: false })
      );
    }
  }
}

console.log(`\n${plan.length} change(s)${apply ? ' applied' : ' planned'}.`);
