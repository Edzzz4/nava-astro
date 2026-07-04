/* ─────────────────────────────────────────────────────────────
   Contact form island: honeypot + client validation + AJAX submit
   to Netlify Forms (same-origin POST, CSP-safe).
   Progressive enhancement: `novalidate` is added here, so with JS
   off the browser validates natively and Netlify serves its own
   success page after the plain POST.
   ───────────────────────────────────────────────────────────── */

function init(): void {
  const form = document.querySelector<HTMLFormElement>('[data-contact-form]');
  if (!form) return;
  form.setAttribute('novalidate', '');
  const ok = form.querySelector<HTMLElement>('[data-contact-ok]');
  const err = form.querySelector<HTMLElement>('[data-contact-err]');

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    ok?.setAttribute('hidden', '');
    err?.setAttribute('hidden', '');

    // Honeypot: a filled "website" field means a bot — drop silently.
    const honeypot = form.querySelector<HTMLInputElement>('input[name="website"]');
    if (honeypot && honeypot.value !== '') return;

    // Client validation (novalidate is on, so we control the UX).
    let valid = true;
    for (const field of form.querySelectorAll<HTMLInputElement | HTMLTextAreaElement>(
      '.field[required], .field[type="email"]'
    )) {
      const fieldValid = field.checkValidity();
      field.setAttribute('aria-invalid', String(!fieldValid));
      if (!fieldValid) valid = false;
    }
    if (!valid) {
      err?.removeAttribute('hidden');
      form.querySelector<HTMLElement>('[aria-invalid="true"]')?.focus();
      return;
    }

    // Netlify Forms accepts URL-encoded POSTs on any same-origin path.
    const body = new URLSearchParams(
      new FormData(form) as unknown as Record<string, string>
    ).toString();
    fetch(window.location.pathname, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body,
    })
      .then((res) => {
        if (!res.ok) throw new Error(String(res.status));
        form.reset();
        ok?.removeAttribute('hidden');
      })
      .catch(() => {
        err?.removeAttribute('hidden');
      });
  });
}

document.addEventListener('astro:page-load', init);

export {};
