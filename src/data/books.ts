/* ─────────────────────────────────────────────────────────────
   Nava — single source of truth for the catalog (typed).

   EXTENSION POINT — add an edition (one record per language edition):
   copy an object in `products`, change the fields, drop a cover in
   public/covers/<id>.jpg (600 × 960), run `npm run og`, then
   `npm run stripe:setup` and `npm run books:upload` (see README).
   TypeScript is the guardrail: a missing or malformed field fails
   `astro check` / `astro build`.

   EXTENSION POINT — add a category:
   add an entry to CATEGORIES (slug + it/en labels) and an icon in
   src/components/CategoryIcon.astro. Products referencing a slug
   not listed here fail the type-check.
   ───────────────────────────────────────────────────────────── */

import type { Lang } from '../i18n';

export const CATEGORIES = [
  {
    slug: 'libri-per-bambini', it: 'Libri per bambini', en: "Children's books",
    desc: {
      it: 'Albi illustrati e primi libri, disegnati e stampati per resistere a mani piccole e letture infinite.',
      en: 'Picture books and first reads, designed and printed to survive small hands and endless rereading.',
    },
  },
  {
    slug: 'humor-e-regali', it: 'Humor e regali', en: 'Humor & gifts',
    desc: {
      it: 'Libri che fanno ridere sul serio: il regalo giusto quando non sai cosa regalare.',
      en: "Books that are seriously funny: the right gift when you don't know what to give.",
    },
  },
  {
    slug: 'informatica-web-digital', it: 'Informatica, Web e Digital', en: 'Computing, Web & Digital',
    desc: {
      it: 'Il digitale spiegato senza gergo: saggi limpidi su software, rete e vita connessa.',
      en: 'The digital world without the jargon: clear essays on software, the web and connected life.',
    },
  },
  {
    slug: 'affari-e-finanza', it: 'Affari e finanza', en: 'Business & finance',
    desc: {
      it: 'Soldi, imprese e lavoro raccontati con calma: niente scorciatoie, niente promesse.',
      en: 'Money, business and work told calmly: no shortcuts, no promises.',
    },
  },
  {
    slug: 'cookbook', it: 'Cookbook', en: 'Cookbooks',
    desc: {
      it: 'Ricettari veri, di case e di famiglie: cucina da fare, non solo da fotografare.',
      en: 'Real cookbooks from real kitchens: food to cook, not just to photograph.',
    },
  },
  {
    slug: 'fai-da-te', it: 'Fai da te', en: 'DIY',
    desc: {
      it: 'Riparare, costruire, rimettere a posto: manuali pratici per mani volenterose.',
      en: 'Repair, build, set right: practical manuals for willing hands.',
    },
  },
  {
    slug: 'graphic-novel-fumetti', it: 'Graphic novel e fumetti', en: 'Graphic novels & comics',
    desc: {
      it: 'Storie disegnate e stampate con cura: romanzi a fumetti e antologie da collezione.',
      en: 'Stories drawn and printed with care: graphic novels and anthologies worth collecting.',
    },
  },
  {
    slug: 'pillole-di', it: 'Pillole di…', en: 'In a nutshell…',
    desc: {
      it: 'Grandi idee in poche pagine: la collana tascabile per capire di cosa si parla.',
      en: 'Big ideas in a few pages: the pocket series for following the conversation.',
    },
  },
  {
    slug: 'tempo-libero-lifestyle', it: 'Tempo libero e Lifestyle', en: 'Leisure & Lifestyle',
    desc: {
      it: 'Viaggi lenti, weekend e buone abitudini: libri per il tempo che resta.',
      en: 'Slow travel, weekends and good habits: books for the time that remains.',
    },
  },
] as const satisfies readonly {
  slug: string;
  it: string;
  en: string;
  desc: { it: string; en: string };
}[];

export type CategorySlug = (typeof CATEGORIES)[number]['slug'];

/** Currencies sold on the site. Each one is a separate Stripe Price. */
export const CURRENCIES = ['EUR', 'USD', 'GBP'] as const;
export type Currency = (typeof CURRENCIES)[number];

/** Currency preselected on the product page, by site language. */
export const DEFAULT_CURRENCY: Record<Lang, Currency> = { it: 'EUR', en: 'USD' };

/**
 * Stripe tax_behavior per currency: EUR and GBP prices include VAT,
 * USD prices are before tax (US convention). scripts/stripe-setup.mjs
 * creates the Prices with exactly these settings.
 */
export const TAX_INCLUSIVE: Record<Currency, boolean> = { EUR: true, USD: false, GBP: true };

/** Stripe Tax code: "Digital Books - downloaded - non subscription - with permanent rights". */
export const STRIPE_TAX_CODE = 'txcd_10302000';

/**
 * One record per EDITION: each language edition is a separate product,
 * with its own Stripe Product, prices and files. Its page exists only in
 * its own language (/it/catalogo/<id>/ or /en/catalogo/<id>/); `work`
 * links the editions of the same book (hreflang + language switch).
 */
export interface Product {
  /** URL slug = Stripe Product id = prefix of the file names. */
  id: string;
  /** Language of the edition (and of its page). */
  lang: Lang;
  /** Shared by the editions of the same book. */
  work: string;
  title: string;
  subtitle: string;
  series?: string;
  author: string;
  category: CategorySlug;
  /** Display prices. Must match the Stripe Prices (checked by checkout.js). */
  prices: Record<Currency, number>;
  /** Stripe Product id and Price lookup keys: identical in test and live mode. */
  stripe: { product: string; lookupKeys: Record<Currency, string> };
  /** Files delivered after purchase: keys in the private Netlify Blobs store "books". */
  files: { version: string; pdf: string; epub: string };
  /** Path under public/, e.g. "/covers/<id>.jpg" (600 × 960, ratio 1:1.6). */
  cover: string;
  /** Pages of the PDF edition (from the build report). */
  pages: number;
  year: number;
  featured: boolean;
  /** Product page copy, from the KDP listing (nava-libri/nava/kdp/). */
  lead: string;
  description: string[];
  highlights: string[];
  closing: string[];
  amazonLink?: string;
}

/** Stripe ids derived from the slug, so a record can't drift from its Prices. */
function stripeIds(id: string): Product['stripe'] {
  return {
    product: id,
    lookupKeys: { EUR: `${id}_eur`, USD: `${id}_usd`, GBP: `${id}_gbp` },
  };
}

function bookFiles(id: string, lang: Lang, version: string): Product['files'] {
  const base = `${id}_${lang.toUpperCase()}_${version}`;
  return { version, pdf: `${base}.pdf`, epub: `${base}.epub` };
}

/** GBP prices: still to be confirmed before live mode (see nava-libri/CLAUDE.md). */
const PRICES_DRITTE: Record<Currency, number> = { EUR: 7.9, USD: 8.9, GBP: 7.49 };
const PRICES_DETERSIVI: Record<Currency, number> = { EUR: 12.9, USD: 13.9, GBP: 10.99 };

export const products: Product[] = [
  {
    id: 'le-dritte-in-cucina',
    lang: 'it',
    work: 'le-dritte-1',
    title: 'Le Dritte. In cucina',
    subtitle: '100 cose che nessuno ti dice ai fornelli',
    series: 'Le Dritte, 1',
    author: 'Nava Editore',
    category: 'cookbook',
    prices: PRICES_DRITTE,
    stripe: stripeIds('le-dritte-in-cucina'),
    files: bookFiles('le-dritte-in-cucina', 'it', 'v1.0'),
    cover: '/covers/le-dritte-in-cucina.jpg',
    pages: 119,
    year: 2026,
    featured: true,
    lead: "Perché il sale va messo quando l'acqua bolle? E perché non per il motivo che pensi?",
    description: [
      'Cento dritte brevi per capire cosa succede davvero ai fornelli. Ognuna spiega il perché in poche righe e chiude con cosa fare, con grammi, gradi e minuti precisi.',
    ],
    highlights: [
      'Pasta, riso e acqua di cottura',
      "Frittura: quando l'extravergine va bene, a che temperatura, quante volte si riusa l'olio",
      "Carne e pesce: perché la bistecca al sangue è sicura e l'hamburger no, 96 ore di congelatore per il pesce crudo",
      'Uova, verdure, legumi, pane e dolci',
      'Frigo, congelatore, avanzi e scadenze',
      'Coltelli, padelle, forno e induzione',
    ],
    closing: [
      'Con gli schemi delle temperature al cuore della carne e della frittura, e un indice per parola chiave. Si legge in ordine o aprendo a caso.',
      'Il primo volume della collana Le Dritte di Nava Editore.',
    ],
  },
  {
    id: 'le-dritte-in-the-kitchen',
    lang: 'en',
    work: 'le-dritte-1',
    title: 'Le Dritte. In the Kitchen',
    subtitle: '100 Things Nobody Tells You at the Stove',
    series: 'Le Dritte, 1',
    author: 'Nava Editore',
    category: 'cookbook',
    prices: PRICES_DRITTE,
    stripe: stripeIds('le-dritte-in-the-kitchen'),
    files: bookFiles('le-dritte-in-the-kitchen', 'en', 'v1.0'),
    cover: '/covers/le-dritte-in-the-kitchen.jpg',
    pages: 119,
    year: 2026,
    featured: true,
    lead: 'Why do you salt pasta water only once it boils? And why not for the reason you think?',
    description: [
      'One hundred short tips on what really happens at the stove. Each one explains the why in a few lines and ends with what to do, with precise temperatures, weights and times.',
    ],
    highlights: [
      'Pasta, rice and pasta water',
      'Frying: when extra virgin olive oil works, at what temperature, how often to reuse the oil',
      "Meat and fish: why a rare steak is safe and a rare burger isn't, and how to freeze fish for raw dishes",
      'Eggs, vegetables, beans, bread and baking',
      'Fridge, freezer, leftovers and date labels',
      'Knives, pans, ovens and induction',
    ],
    closing: [
      'Temperatures in Fahrenheit and Celsius, charts for safe internal temperatures and frying, and a keyword index. Read it in order or open it anywhere.',
      'The first volume in the Le Dritte series from Nava Editore. Le dritte is Italian for tips.',
    ],
  },
  {
    id: 'detersivi-fatti-in-casa',
    lang: 'it',
    work: 'detersivi',
    title: 'Detersivi fatti in casa',
    subtitle: '80 ricette naturali per bucato, cucina, bagno e ogni superficie',
    author: 'Nava Editore',
    category: 'fai-da-te',
    prices: PRICES_DETERSIVI,
    stripe: stripeIds('detersivi-fatti-in-casa'),
    files: bookFiles('detersivi-fatti-in-casa', 'it', 'v1.0'),
    cover: '/covers/detersivi-fatti-in-casa.jpg',
    pages: 105,
    year: 2026,
    featured: true,
    lead: 'Ottanta ricette per pulire tutta la casa con dieci ingredienti.',
    description: [
      'Acido citrico, bicarbonato, percarbonato, soda Solvay, sapone di Marsiglia: sai cosa usi, quanto e dove.',
      "Ogni ricetta ha dosi in grammi, passaggi numerati, l'elenco delle superfici su cui usarla e di quelle da evitare, e le avvertenze di sicurezza.",
    ],
    highlights: [
      'Bucato: detersivi, ammorbidente, smacchiatori per sangue, vino, erba e aloni gialli',
      'Cucina: sgrassatori, forno, cappa, bollitore, taglieri',
      'Piatti e lavastoviglie, con il test per capire se i bicchieri opachi hanno calcare o corrosione',
      'Bagno: anticalcare, fughe, muffa sul silicone, scarichi',
      'Pavimenti, vetri, legno, metalli e profumi per la casa',
    ],
    closing: [
      "Con le regole che nessuno ti spiega: la tabella di cosa non mescolare mai, perché aceto e bicarbonato insieme non puliscono, perché in questo libro non c'è il borace e quando un prodotto commerciale lavora meglio.",
    ],
  },
  {
    id: 'homemade-cleaning-products',
    lang: 'en',
    work: 'detersivi',
    title: 'Homemade Cleaning Products',
    subtitle: '80 Natural Recipes for Laundry, Kitchen, Bathroom and Every Surface',
    author: 'Nava Editore',
    category: 'fai-da-te',
    prices: PRICES_DETERSIVI,
    stripe: stripeIds('homemade-cleaning-products'),
    files: bookFiles('homemade-cleaning-products', 'en', 'v1.0'),
    cover: '/covers/homemade-cleaning-products.jpg',
    pages: 105,
    year: 2026,
    featured: true,
    lead: 'Eighty recipes to clean your whole home with ten ingredients.',
    description: [
      'Citric acid, baking soda, washing soda, sodium percarbonate, castile soap: you know what you use, how much and where.',
      'Every recipe has doses in grams, numbered steps, the surfaces to use it on and the ones to avoid, and the safety cautions. Written for US and UK readers, including the difference between washing soda and UK soda crystals.',
    ],
    highlights: [
      'Laundry: detergents, fabric softener, stain removers for blood, wine, grass and yellow underarm stains',
      'Kitchen: degreasers, oven, range hood, kettle, cutting boards',
      'Dishes and dishwasher, with the test that tells you whether cloudy glasses have limescale or etching',
      'Bathroom: limescale, grout, mold on silicone, slow drains',
      'Floors, glass, wood, metals and home fragrance',
    ],
    closing: [
      "With the rules nobody explains: the chart of what never to mix, why vinegar and baking soda together don't clean, why this book has no borax, and when a store-bought product works better.",
    ],
  },
];

/** Localized category label. */
export function categoryLabel(slug: CategorySlug, lang: Lang): string {
  const cat = CATEGORIES.find((c) => c.slug === slug);
  return cat ? cat[lang] : slug;
}

/** "7,90 €" (it) · "$8.90" / "£7.49" (en). */
export function formatPrice(amount: number, currency: Currency, lang: Lang): string {
  return new Intl.NumberFormat(lang === 'it' ? 'it-IT' : 'en-US', { style: 'currency', currency }).format(amount);
}

/** Editions sold on the pages of a language. */
export function productsFor(lang: Lang): Product[] {
  return products.filter((p) => p.lang === lang);
}

/** Lookup by slug (used by the Netlify Functions). */
export function productById(id: string): Product | undefined {
  return products.find((p) => p.id === id);
}

/** The edition of the same book in another language, if it exists. */
export function sibling(product: Product, lang: Lang): Product | undefined {
  return products.find((p) => p.work === product.work && p.lang === lang);
}

/** Categories with at least one edition: empty ones are hidden from the site. */
export function activeCategories(lang: Lang) {
  const used = new Set(productsFor(lang).map((p) => p.category));
  return CATEGORIES.filter((c) => used.has(c.slug));
}

/** Editions of a category in a language, newest first. */
export function byCategory(slug: CategorySlug, lang: Lang): Product[] {
  return productsFor(lang).filter((p) => p.category === slug);
}

/** Related editions in the same language: same category first. */
export function related(product: Product, count = 3): Product[] {
  const pool = productsFor(product.lang).filter((p) => p.id !== product.id);
  const same = pool.filter((p) => p.category === product.category);
  const rest = pool.filter((p) => p.category !== product.category);
  return [...same, ...rest].slice(0, count);
}
