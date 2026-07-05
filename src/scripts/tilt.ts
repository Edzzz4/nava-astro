/* ─────────────────────────────────────────────────────────────
   Product-cover tilt: the cover follows the pointer (max ~6°)
   with a light sheen. Desktop-only (hover + fine pointer), off
   with prefers-reduced-motion, rAF-throttled, transform/opacity
   only (compositor-friendly — no layout, no paint storms).
   Styles are set via CSSOM (element.style.*), which the strict
   CSP allows — only style="" attributes in markup are blocked.
   ───────────────────────────────────────────────────────────── */

const MAX_DEG = 6;

function init(): void {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  if (!window.matchMedia('(hover: hover) and (pointer: fine)').matches) return;

  const el = document.querySelector<HTMLElement>('[data-tilt]');
  if (!el) return;
  const sheen = el.querySelector<HTMLElement>('.sheen');

  let raf = 0;
  let px = 0;
  let py = 0;

  function apply(): void {
    raf = 0;
    const rx = (0.5 - py) * MAX_DEG * 2;
    const ry = (px - 0.5) * MAX_DEG * 2;
    el!.style.transform = `perspective(900px) rotateX(${rx.toFixed(2)}deg) rotateY(${ry.toFixed(2)}deg)`;
    if (sheen) {
      sheen.style.opacity = '1';
      sheen.style.transform = `translateX(${((px - 0.5) * 60).toFixed(1)}%)`;
    }
  }

  el.addEventListener('mousemove', (e) => {
    const rect = el.getBoundingClientRect();
    px = (e.clientX - rect.left) / rect.width;
    py = (e.clientY - rect.top) / rect.height;
    if (!raf) raf = requestAnimationFrame(apply);
  });

  el.addEventListener('mouseleave', () => {
    if (raf) cancelAnimationFrame(raf);
    raf = 0;
    el.style.transform = '';
    if (sheen) {
      sheen.style.opacity = '0';
      sheen.style.transform = '';
    }
  });
}

document.addEventListener('astro:page-load', init);

export {};
