# Nava — sito Astro

Sito statico multilingua (IT/EN) dell'editore Nava, costruito con [Astro](https://astro.build).
Output 100% statico in `dist/`, pensato per Netlify. Nessun framework client: solo
componenti `.astro` + piccole isole vanilla JS.

## Struttura

```
├── astro.config.mjs        # site, i18n (it/en), sitemap, no-inline CSS
├── netlify.toml            # build, redirect (/, www→apex, vecchi .html)
├── public/
│   ├── _headers            # CSP stretta + security headers Netlify
│   ├── robots.txt
│   ├── og-default.png      # immagine OG 1200×630 generata
│   ├── fonts/              # Fraunces + Inter self-hosted (woff2 variabili)
│   └── covers/             # copertine placeholder SVG (una per titolo)
└── src/
    ├── data/books.ts       # ★ catalogo tipizzato: prodotti + categorie
    ├── i18n/
    │   ├── it.ts           # ★ dizionario IT (fonte del tipo Dictionary)
    │   ├── en.ts           # ★ dizionario EN (chiave mancante = build error)
    │   └── index.ts        # t() type-safe + helper di routing
    ├── layouts/
    │   ├── Base.astro      # <head> SEO, nav, footer, view transitions
    │   └── Legal.astro     # wrapper pagine legali
    ├── components/         # SEO, Nav, Footer, BookCard, CategoryIcon
    ├── scripts/            # isole vanilla: site.ts, catalog.ts, contact.ts
    ├── styles/global.css   # ★ design tokens (palette, type scale, dark mode)
    └── pages/
        ├── index.astro     # fallback "/" (Netlify fa 301 → /it/)
        ├── 404.astro
        └── [lang]/         # ogni route esiste in /it/… e /en/…
            ├── index.astro         # home
            ├── catalogo/index.astro
            ├── catalogo/[id].astro # pagina prodotto (getStaticPaths)
            ├── chi-siamo.astro
            ├── contatti.astro
            └── legale/…            # privacy, cookie, termini, recesso, resi
```

★ = punti di estensione principali.

## Comandi

```sh
npm install        # prima volta
npm run dev        # dev server su http://localhost:4321
npm run build      # astro check è consigliato prima: npx astro check
npm run preview    # serve dist/ in locale
```

## Come aggiungere un prodotto

1. In `src/data/books.ts` copia un oggetto di `products` e cambia i campi.
   I tipi sono il guardrail: un campo mancante/malformato o una `category`
   inesistente **rompono la build** (`astro check` / `astro build`).
2. Aggiungi la copertina in `public/covers/<id>.svg` (o `.jpg`) e aggiorna `cover`.
3. `stripeLink`: lascia `STRIPE_LINK_TBD` finché non esiste il Payment Link reale.
4. La pagina prodotto (`/it/catalogo/<id>/` e `/en/catalogo/<id>/`), la sitemap,
   hreflang e JSON-LD si generano da soli alla build.

Campi opzionali: `pages/isbn/format` per i libri; `dimensioni/tecnica/tiratura`
per le stampe d'arte (già tipizzati, non ancora usati).

## Come aggiungere una categoria

1. Aggiungi `{ slug, it, en }` a `CATEGORIES` in `src/data/books.ts`.
2. Aggiungi l'icona per lo slug in `src/components/CategoryIcon.astro`.

## Come aggiungere una lingua

1. Crea `src/i18n/<lang>.ts` esportando un oggetto di tipo `Dictionary`
   (il compilatore elenca ogni chiave mancante).
2. Registra la lingua in `LANGUAGES` (`src/i18n/index.ts`) e in
   `i18n.locales` + `sitemap.i18n.locales` (`astro.config.mjs`).
3. Tutte le pagine `/xx/…` vengono generate automaticamente.

## Cose da completare prima del lancio

- [ ] `STRIPE_LINK_TBD` / `AMAZON_LINK_TBD` in `src/data/books.ts`
- [ ] `FORM_ENDPOINT_TBD` in `src/pages/[lang]/contatti.astro`
      (e aggiungere l'origin dell'endpoint a `form-action` in `public/_headers`)
- [ ] Segnaposto `[TODO: …]` nelle pagine legali (`src/pages/[lang]/legale/`)
      e nel footer (ragione sociale, P.IVA) — da rivedere con un consulente
- [ ] Se si aggiunge analytics o qualunque cookie non tecnico: serve un
      banner di consenso GDPR (vedi commenti in cookie-policy.astro)

## Deploy su Netlify

Il DNS di `navaeditore.com` è già configurato: **non toccarlo**.

**Variante A — Git (consigliata):**

```sh
cd nava-astro
git init && git add -A && git commit -m "Nava su Astro"
git remote add origin <repo-url> && git push -u origin main
```

Poi in Netlify: *Site configuration → Build & deploy → Link repository*
(o nuovo sito → *Import from Git*). Build command `npm run build`,
publish directory `dist` (già letti da `netlify.toml`). Ogni push su
`main` fa il deploy.

**Variante B — Netlify CLI:**

```sh
npm run build
npx netlify-cli deploy --prod --dir=dist   # con: npx netlify-cli login, poi link al sito
```

## Sicurezza

- CSP stretta in `public/_headers`: nessuno script/style inline
  (`build.inlineStylesheets: 'never'` + `assetsInlineLimit: 0` la garantiscono).
  I blocchi JSON-LD sono dati, non script eseguibili.
- Font e asset self-hosted: zero richieste a CDN esterni.
- Form contatti: honeypot + validazione client; nessun backend ancora.
