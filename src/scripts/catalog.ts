/* ─────────────────────────────────────────────────────────────
   Catalog island (vanilla, no framework).
   The data is already in the DOM as data-* attributes on each card;
   this script only shows/hides/reorders. Without JS the full catalog
   is visible. Supports ?cat=<slug> deep links (kept shareable).
   ───────────────────────────────────────────────────────────── */

type SortMode = 'newest' | 'price-asc' | 'price-desc' | 'az';

function init(): void {
  const grid = document.querySelector<HTMLElement>('[data-catalog-grid]');
  const filters = document.querySelector<HTMLElement>('[data-catalog-filters]');
  const search = document.querySelector<HTMLInputElement>('[data-catalog-search]');
  const sortSel = document.querySelector<HTMLSelectElement>('[data-catalog-sort]');
  const countEl = document.querySelector<HTMLElement>('[data-catalog-count]');
  const emptyEl = document.querySelector<HTMLElement>('[data-catalog-empty]');
  if (!grid || !filters || !search || !sortSel || !countEl || !emptyEl) return;

  const cards = Array.from(grid.querySelectorAll<HTMLElement>('[data-card]'));
  const state = {
    cat: new URLSearchParams(location.search).get('cat') ?? 'all',
    query: '',
    sort: 'newest' as SortMode,
  };

  function apply(): void {
    let visible = 0;
    for (const card of cards) {
      const matchesCat = state.cat === 'all' || card.dataset.category === state.cat;
      const matchesQuery = !state.query || (card.dataset.search ?? '').includes(state.query);
      const show = matchesCat && matchesQuery;
      card.hidden = !show;
      if (show) visible++;
    }
    countEl!.textContent = String(visible);
    emptyEl!.hidden = visible > 0;

    const sorted = [...cards].sort((a, b) => {
      switch (state.sort) {
        case 'price-asc':
          return Number(a.dataset.price) - Number(b.dataset.price);
        case 'price-desc':
          return Number(b.dataset.price) - Number(a.dataset.price);
        case 'az':
          return (a.dataset.title ?? '').localeCompare(b.dataset.title ?? '', document.documentElement.lang);
        default:
          return Number(b.dataset.year) - Number(a.dataset.year);
      }
    });
    for (const card of sorted) grid!.append(card);
  }

  function selectCat(cat: string): void {
    state.cat = cat;
    filters!.querySelectorAll<HTMLButtonElement>('.filter-btn').forEach((btn) => {
      btn.setAttribute('aria-pressed', String(btn.dataset.cat === cat));
    });
    // Keep the URL shareable without reloading.
    const url = new URL(location.href);
    if (cat === 'all') url.searchParams.delete('cat');
    else url.searchParams.set('cat', cat);
    history.replaceState(null, '', url);
    apply();
  }

  filters.addEventListener('click', (e) => {
    const btn = (e.target as HTMLElement).closest<HTMLButtonElement>('.filter-btn');
    if (btn?.dataset.cat) selectCat(btn.dataset.cat);
  });

  search.addEventListener('input', () => {
    state.query = search.value.trim().toLowerCase();
    apply();
  });

  sortSel.addEventListener('change', () => {
    state.sort = sortSel.value as SortMode;
    apply();
  });

  if (state.cat !== 'all') selectCat(state.cat);
}

document.addEventListener('astro:page-load', init);

export {};
