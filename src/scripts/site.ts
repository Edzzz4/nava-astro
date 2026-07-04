/* ─────────────────────────────────────────────────────────────
   Shared site behavior (one small vanilla bundle, no framework):
   - mobile menu toggle
   - scroll-reveal via IntersectionObserver (off with reduced motion)
   - newsletter demo submit (no backend yet)
   Re-initialized on every View Transitions navigation via
   `astro:page-load` (which also fires on first load).
   ───────────────────────────────────────────────────────────── */

function initMenu(): void {
  const toggle = document.querySelector<HTMLButtonElement>('[data-menu-toggle]');
  const menu = document.getElementById('mobile-menu');
  if (!toggle || !menu) return;
  toggle.addEventListener('click', () => {
    const open = toggle.getAttribute('aria-expanded') === 'true';
    toggle.setAttribute('aria-expanded', String(!open));
    menu.hidden = open;
  });
  // Close with Escape and return focus to the toggle (keyboard support)
  menu.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      toggle.setAttribute('aria-expanded', 'false');
      menu.hidden = true;
      toggle.focus();
    }
  });
}

function initReveal(): void {
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reduced || !('IntersectionObserver' in window)) {
    delete document.documentElement.dataset.reveal;
    return;
  }
  // Opt in: only with this attribute does CSS hide .reveal elements.
  document.documentElement.dataset.reveal = '';
  const observer = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-revealed');
          observer.unobserve(entry.target);
        }
      }
    },
    { rootMargin: '0px 0px -8% 0px' }
  );
  document.querySelectorAll('.reveal:not(.is-revealed)').forEach((el) => {
    // Already in view (e.g. after back navigation): show immediately.
    const rect = el.getBoundingClientRect();
    if (rect.top < window.innerHeight * 0.92) el.classList.add('is-revealed');
    else observer.observe(el);
  });
}

function initNewsletter(): void {
  const form = document.querySelector<HTMLFormElement>('[data-newsletter]');
  if (!form) return;
  form.addEventListener('submit', (e) => {
    // Demo only: no newsletter backend yet. Wire a provider endpoint
    // to the form action and drop this preventDefault.
    e.preventDefault();
    form.reset();
    form.querySelector('[data-newsletter-ok]')?.removeAttribute('hidden');
  });
}

document.addEventListener('astro:page-load', () => {
  initMenu();
  initReveal();
  initNewsletter();
});
