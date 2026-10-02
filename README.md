# Nava — sito Astro

Sito statico multilingua (IT/EN) dell'editore Nava, costruito con [Astro](https://astro.build).
Output 100% statico in `dist/`, pensato per Netlify. Nessun framework client: solo
componenti `.astro` + piccole isole vanilla JS.

## Struttura

```
├── astro.config.mjs        # site, i18n (it/en), sitemap, no-inline CSS
├── netlify.toml            # build, redirect (/, www→apex, vecchi .html)
├── netlify/
│   ├── functions/          # checkout, stripe-webhook, download
│   └── lib/                # token HMAC, store Blobs, email, Stripe
├── public/
│   ├── _headers            # CSP stretta + security headers Netlify
│   ├── robots.txt
│   ├── og-default.png      # immagine OG 1200×630 generata
│   ├── fonts/              # Fraunces + Inter self-hosted (woff2 variabili)
│   └── covers/             # copertine JPG 600×960 (una per edizione)
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

## Come aggiungere un'edizione (ebook)

Ogni edizione linguistica è un prodotto a sé: un record in `src/data/books.ts`,
una pagina solo nella sua lingua, un Product Stripe, i suoi file.

1. In `src/data/books.ts` copia un record di `products` e cambia i campi.
   `work` collega le edizioni dello stesso libro (hreflang, cambio lingua,
   "Disponibile anche in…"). I tipi rompono la build se manca un campo.
2. Copertina in `public/covers/<id>.jpg`, 600 × 960 (rapporto 1:1,6).
3. `npm run og` per la card social `public/og/<id>.png` (in locale, poi commit).
4. `npm run stripe:setup` (dry run) e poi `npm run stripe:setup -- --apply`:
   crea Product e Price (EUR, USD, GBP) con le chiavi di `.env`.
5. `npm run books:upload` e poi `npm run books:upload -- --apply`: carica PDF
   ed EPUB da `~/Desktop/nava-libri/releases/<versione>/` nello store privato
   Netlify Blobs `books`. **I file non entrano mai nel repo** (è pubblico).

Le categorie senza edizioni restano in `CATEGORIES` ma non compaiono sul sito.

## Vendita ebook (Stripe + Netlify Functions + Resend)

```
pagina prodotto → checkout.js → Stripe Checkout → stripe-webhook.js
  → ordine nello store "orders" + email Resend con /<lang>/download/#t=<token>
  → download.js (HMAC, 72 ore, 5 download per file) → file dallo store "books"
```

- `netlify/functions/checkout.js`: sessione Checkout; prezzo risolto per
  lookup key (`<slug>_eur` …) e confrontato con `books.ts`; casella di consenso
  obbligatoria (consegna immediata + perdita del recesso), Stripe Tax.
- `netlify/functions/stripe-webhook.js`: verifica la firma, salva l'ordine
  (senza dati personali), copia il consenso nei metadati del pagamento, invia
  l'email. Idempotente.
- `netlify/functions/download.js`: GET = stato per la pagina di download,
  POST = file. Solo il POST conta, così gli antivirus delle email che aprono
  il link non consumano i download.
- Controllo in sola lettura dell'account Stripe (prodotti, prezzi, Tax, webhook):
  `npm run stripe:check` (sandbox, `.env`) o `npm run stripe:check:live`
  (chiave live ristretta in `.env.live`, git-ignored).
- Variabili: vedi `.env.example`. In Netlify vanno impostate per contesto
  (Deploy Previews = test, Production = live).
- Prova in locale (modalità test):

  ```sh
  npx netlify-cli dev                      # porta 8888
  stripe listen --events checkout.session.completed,checkout.session.async_payment_succeeded,checkout.session.async_payment_failed \
    --forward-to localhost:8888/.netlify/functions/stripe-webhook
  curl -X POST http://localhost:8888/.netlify/functions/dev-seed-books   # store locale
  ```

  `dev-seed-books.js` è solo locale (git-ignored): `netlify dev` usa uno store
  Blobs separato e vuoto. `npm run download-link -- <cs_…> --hours -1` crea un
  link già scaduto per il test.

## Come aggiungere una categoria

1. Aggiungi `{ slug, it, en, desc: { it, en } }` a `CATEGORIES` in `src/data/books.ts`
   (`desc` diventa la meta description della pagina categoria).
2. Aggiungi l'icona per lo slug in `src/components/CategoryIcon.astro`.
3. La pagina `/it/categoria/<slug>/` (+ EN) si genera da sola alla build.

## Come aggiungere una lingua

1. Crea `src/i18n/<lang>.ts` esportando un oggetto di tipo `Dictionary`
   (il compilatore elenca ogni chiave mancante).
2. Registra la lingua in `LANGUAGES` (`src/i18n/index.ts`) e in
   `i18n.locales` + `sitemap.i18n.locales` (`astro.config.mjs`).
3. Tutte le pagine `/xx/…` vengono generate automaticamente.

## Cose da completare prima del lancio

- [ ] Stripe live: prodotti e prezzi (`npm run stripe:setup -- --live --apply`), chiavi nel contesto Production
- [ ] Dominio verificato su Resend e `MAIL_FROM` su `@navaeditore.com`
- [ ] Netlify Forms: attivare una volta il rilevamento in
      *Project configuration → Forms → Enable form detection*
      (i messaggi del form contatti arrivano lì; notifiche email
      configurabili in *Forms → Notifications*)
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
