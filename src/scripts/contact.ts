/* ─────────────────────────────────────────────────────────────
   Contact form island: honeypot + client-side validation.
   The endpoint is FORM_ENDPOINT_TBD, so submission is always
   intercepted and the demo success message shown. When the real
   endpoint exists: set the form `action`, remove the TBD branch,
   and allow the origin in form-action (public/_headers).
   ───────────────────────────────────────────────────────────── */

function init(): void {
  const form = document.querySelector<HTMLFormElement>('[data-contact-form]');
  if (!form) return;
  const ok = form.querySelector<HTMLElement>('[data-contact-ok]');
  const err = form.querySelector<HTMLElement>('[data-contact-err]');

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    ok?.setAttribute('hidden', '');
    err?.setAttribute('hidden', '');

    // Honeypot: a filled "website" field means a bot — drop silently.
    const honeypot = form.querySelector<HTMLInputElement>('input[name="website"]');
    if (honeypot && honeypot.value !== '') return;

    // Client validation (novalidate on the form, so we control UX).
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

    if (form.action.endsWith('FORM_ENDPOINT_TBD')) {
      // Demo mode: no backend yet.
      form.reset();
      ok?.removeAttribute('hidden');
      return;
    }

    form.submit();
  });
}

document.addEventListener('astro:page-load', init);

export {};
