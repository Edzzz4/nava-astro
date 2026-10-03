/* ─────────────────────────────────────────────────────────────
   Product page buy box: currency choice + checkout.
   The button POSTs { product, currency, lang } to the checkout
   function (same origin: connect-src 'self'), gets the Stripe
   Checkout URL back and navigates there with location.assign —
   a navigation, so the strict CSP needs no change.
   The button is rendered `hidden` and shown here: without JS the
   page shows a <noscript> notice instead of a dead button.
   ───────────────────────────────────────────────────────────── */

let reset: (() => void) | null = null;

function init(): void {
  reset = null;
  const box = document.querySelector<HTMLElement>('[data-buybox]');
  if (!box) return;
  const button = box.querySelector<HTMLButtonElement>('[data-buy]');
  const price = box.querySelector<HTMLElement>('[data-price]');
  const note = box.querySelector<HTMLElement>('[data-tax-note]');
  const error = box.querySelector<HTMLElement>('[data-buy-error]');
  if (!button || !price || !note || !error) return;

  const radios = [...box.querySelectorAll<HTMLInputElement>('input[name="currency"]')];
  const selected = () => radios.find((r) => r.checked) ?? radios[0]!;

  function show(): void {
    const r = selected();
    price!.textContent = r.dataset.label ?? '';
    note!.textContent = r.dataset.note ?? '';
  }
  radios.forEach((r) => r.addEventListener('change', show));
  show(); // the browser may restore a non-default radio on back/forward

  const label = button.textContent ?? '';
  button.hidden = false;
  reset = () => {
    button.disabled = false;
    button.textContent = label;
  };

  button.addEventListener('click', async () => {
    error!.hidden = true;
    button.disabled = true;
    button.textContent = button.dataset.loading ?? label;
    try {
      const res = await fetch('/.netlify/functions/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          product: button.dataset.product,
          currency: selected().value,
          lang: button.dataset.lang,
        }),
      });
      const data = (await res.json().catch(() => ({}))) as { url?: string };
      if (!res.ok || !data.url || !data.url.startsWith('https://checkout.stripe.com/')) throw new Error('checkout');
      window.location.assign(data.url);
    } catch {
      error!.hidden = false;
      reset?.();
    }
  });
}

// Astro View Transitions: re-run on every client-side navigation.
document.addEventListener('astro:page-load', init);
// Back from Stripe via the bfcache: the page is restored as it was left
// (button disabled, "opening checkout…"): make it usable again.
window.addEventListener('pageshow', (e) => {
  if (e.persisted) reset?.();
});

export {};
