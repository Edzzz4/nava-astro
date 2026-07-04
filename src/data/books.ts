/* ─────────────────────────────────────────────────────────────
   Nava — single source of truth for the catalog (typed).

   EXTENSION POINT — add a product:
   copy an object in `products`, change the fields, drop a cover in
   public/covers/<id>.svg. TypeScript is the guardrail: a missing or
   malformed field fails `astro check` / `astro build`.

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

/** A string localized in every supported language. */
export type Localized = Record<Lang, string>;

export interface Product {
  /** URL slug, identical in both languages (only the /it/ /en/ prefix changes). */
  id: string;
  title: Localized;
  subtitle?: Localized;
  author: string;
  category: CategorySlug;
  /** EUR. */
  price: number;
  /** Path under public/, e.g. "/covers/<id>.svg". */
  cover: string;
  /** Keep "STRIPE_LINK_TBD" until the real Stripe Payment Link exists. */
  stripeLink: string;
  amazonLink?: string;
  year: number;
  featured: boolean;
  description: Localized;
  /** Author bio shown on the product page. */
  bio?: Localized;

  /* Book-only fields */
  pages?: number;
  isbn?: string;
  format?: 'Paperback' | 'Hardcover';

  /* Print-only fields (stampe d'arte) — unused today, typed for the future */
  dimensioni?: string;
  tecnica?: Localized;
  tiratura?: number;
}

export const products: Product[] = [
  {
    id: 'piccolo-atlante-mostri',
    title:    { it: 'Piccolo Atlante dei Mostri Gentili', en: 'A Little Atlas of Gentle Monsters' },
    subtitle: { it: 'Creature da non temere', en: 'Creatures not to fear' },
    author: 'Sara Conti',
    category: 'libri-per-bambini',
    price: 19.0,
    cover: '/covers/piccolo-atlante-mostri.svg',
    stripeLink: 'STRIPE_LINK_TBD',
    amazonLink: 'AMAZON_LINK_TBD',
    pages: 64, isbn: 'TBD', format: 'Hardcover', year: 2024, featured: true,
    description: {
      it: 'Un bestiario illustrato per i più piccoli, dove ogni mostro nasconde una piccola gentilezza. Trentatré creature, trentatré modi di guardare la paura negli occhi e scoprire che sorride.\n\nUn albo da leggere ad alta voce, prima di dormire, quando le ombre sembrano più grandi del solito.',
      en: 'An illustrated bestiary for little ones, where every monster hides a small kindness. Thirty-three creatures, thirty-three ways to look fear in the eye and find it smiling.\n\nA picture book to read aloud at bedtime, when the shadows seem larger than usual.',
    },
    bio: {
      it: 'Sara Conti illustra e scrive libri per bambini da oltre dieci anni. Vive in Liguria con due gatti e troppe matite.',
      en: "Sara Conti has been writing and illustrating children's books for over ten years. She lives in Liguria with two cats and too many pencils.",
    },
  },
  {
    id: 'abc-degli-animali',
    title:    { it: 'ABC degli Animali', en: 'An Animal ABC' },
    subtitle: { it: 'Un alfabeto da sfogliare', en: 'An alphabet to leaf through' },
    author: 'Marta Lenzi',
    category: 'libri-per-bambini',
    price: 16.0,
    cover: '/covers/abc-degli-animali.svg',
    stripeLink: 'STRIPE_LINK_TBD',
    amazonLink: 'AMAZON_LINK_TBD',
    pages: 48, isbn: 'TBD', format: 'Hardcover', year: 2023, featured: false,
    description: {
      it: 'Dalla A di Aquila alla Z di Zebra: ventisei animali, ventisei tavole a piena pagina per imparare le lettere e i versi del mondo.',
      en: 'From A for Aquila to Z for Zebra: twenty-six animals, twenty-six full-page plates to learn letters and the sounds of the world.',
    },
    bio: {
      it: 'Marta Lenzi è grafica e autrice. ABC degli Animali è il suo secondo albo per Nava.',
      en: 'Marta Lenzi is a designer and author. An Animal ABC is her second picture book for Nava.',
    },
  },
  {
    id: 'ridere-sul-serio',
    title:    { it: 'Ridere sul Serio', en: 'Serious Laughs' },
    subtitle: { it: "Piccolo manuale dell'umorismo", en: 'A small manual of humor' },
    author: 'Gianni Po',
    category: 'humor-e-regali',
    price: 14.9,
    cover: '/covers/ridere-sul-serio.svg',
    stripeLink: 'STRIPE_LINK_TBD',
    amazonLink: 'AMAZON_LINK_TBD',
    pages: 160, isbn: 'TBD', format: 'Paperback', year: 2024, featured: true,
    description: {
      it: 'Una raccolta di pezzi brevi sul perché ridiamo, e di cosa. Il regalo giusto per chi prende tutto troppo sul serio — o per chi non lo prende abbastanza.',
      en: "A collection of short pieces on why we laugh, and at what. The right gift for someone who takes everything too seriously — or not seriously enough.",
    },
    bio: {
      it: 'Gianni Po scrive di comicità per giornali e radio. È meno divertente di persona, dice lui.',
      en: "Gianni Po writes about comedy for newspapers and radio. He's less funny in person, he says.",
    },
  },
  {
    id: 'codice-e-caos',
    title:    { it: 'Codice e Caos', en: 'Code & Chaos' },
    subtitle: { it: 'Vivere (bene) con il software', en: 'Living (well) with software' },
    author: 'Marco Ferretti',
    category: 'informatica-web-digital',
    price: 29.0,
    cover: '/covers/codice-e-caos.svg',
    stripeLink: 'STRIPE_LINK_TBD',
    amazonLink: 'AMAZON_LINK_TBD',
    pages: 288, isbn: 'TBD', format: 'Paperback', year: 2025, featured: true,
    description: {
      it: "Perché il software ci sembra sempre sul punto di rompersi? Un saggio limpido sull'entropia digitale, scritto per chi programma e per chi deve solo conviverci.\n\nDodici capitoli, nessuna formula spaventosa.",
      en: 'Why does software always feel one step from breaking? A clear essay on digital entropy, written for those who code and those who just have to live with it.\n\nTwelve chapters, no scary formulas.',
    },
    bio: {
      it: "Marco Ferretti è ingegnere del software e divulgatore. Ha lavorato vent'anni in sistemi che non dovevano mai cadere.",
      en: 'Marco Ferretti is a software engineer and writer. He spent twenty years on systems that were never supposed to go down.',
    },
  },
  {
    id: 'il-denaro-lento',
    title:    { it: 'Il Denaro Lento', en: 'Slow Money' },
    subtitle: { it: 'Una finanza che ha pazienza', en: 'Finance that has patience' },
    author: 'Anna Greco',
    category: 'affari-e-finanza',
    price: 24.0,
    cover: '/covers/il-denaro-lento.svg',
    stripeLink: 'STRIPE_LINK_TBD',
    amazonLink: 'AMAZON_LINK_TBD',
    pages: 224, isbn: 'TBD', format: 'Paperback', year: 2024, featured: true,
    description: {
      it: 'Contro la fretta dei mercati, un elogio del tempo lungo. Come pensano gli investitori che non hanno fretta — e perché spesso hanno ragione.',
      en: "Against the rush of the markets, a praise of the long horizon. How investors who aren't in a hurry think — and why they're often right.",
    },
    bio: {
      it: 'Anna Greco è analista finanziaria e columnist. Scrive di soldi senza promettere scorciatoie.',
      en: 'Anna Greco is a financial analyst and columnist. She writes about money without promising shortcuts.',
    },
  },
  {
    id: 'startup-da-cucina',
    title:    { it: 'Startup da Cucina', en: 'Kitchen-Table Startup' },
    subtitle: { it: 'Costruire in piccolo, durare a lungo', en: 'Build small, last long' },
    author: 'Paolo Mari',
    category: 'affari-e-finanza',
    price: 27.0,
    cover: '/covers/startup-da-cucina.svg',
    stripeLink: 'STRIPE_LINK_TBD',
    amazonLink: 'AMAZON_LINK_TBD',
    pages: 240, isbn: 'TBD', format: 'Paperback', year: 2023, featured: false,
    description: {
      it: 'Non tutte le imprese hanno bisogno di milioni e di un garage in California. Storie di aziende nate al tavolo di cucina e cresciute con i piedi per terra.',
      en: 'Not every company needs millions and a garage in California. Stories of businesses born at the kitchen table and grown with both feet on the ground.',
    },
    bio: {
      it: 'Paolo Mari ha fondato due piccole imprese e venduto solo la seconda. Insegna imprenditorialità.',
      en: 'Paolo Mari founded two small companies and sold only the second. He teaches entrepreneurship.',
    },
  },
  {
    id: 'cucina-nonna-elide',
    title:    { it: 'La Cucina di Nonna Elide', en: "Grandma Elide's Kitchen" },
    subtitle: { it: 'Ottanta ricette di casa', en: 'Eighty home recipes' },
    author: 'Elide Bianchi',
    category: 'cookbook',
    price: 32.0,
    cover: '/covers/cucina-nonna-elide.svg',
    stripeLink: 'STRIPE_LINK_TBD',
    amazonLink: 'AMAZON_LINK_TBD',
    pages: 256, isbn: 'TBD', format: 'Hardcover', year: 2024, featured: true,
    description: {
      it: "Ottanta ricette raccolte in una cucina di campagna emiliana, con le dosi 'a occhio' tradotte per chi a occhio non ci riesce. Fotografie di stagione e qualche storia di famiglia tra una pagina e l'altra.",
      en: "Eighty recipes gathered in an Emilian country kitchen, with the 'eyeball it' measures translated for those who can't. Seasonal photography and a few family stories between the pages.",
    },
    bio: {
      it: 'Elide Bianchi ha cucinato per tre generazioni. Questo è il suo primo, e dice ultimo, libro.',
      en: 'Elide Bianchi has cooked for three generations. This is her first, and she says last, book.',
    },
  },
  {
    id: 'mani-in-pasta',
    title:    { it: 'Mani in Pasta', en: 'Hands On' },
    subtitle: { it: 'Riparare, costruire, rimettere a posto', en: 'Repair, build, set right' },
    author: 'Luca Verdi',
    category: 'fai-da-te',
    price: 22.0,
    cover: '/covers/mani-in-pasta.svg',
    stripeLink: 'STRIPE_LINK_TBD',
    amazonLink: 'AMAZON_LINK_TBD',
    pages: 192, isbn: 'TBD', format: 'Paperback', year: 2023, featured: false,
    description: {
      it: 'Quaranta progetti per la casa, dal più semplice al quasi-impegnativo. Strumenti, materiali e il coraggio di aprire quel cassetto rotto da anni.',
      en: "Forty projects for the home, from the simplest to the almost-demanding. Tools, materials, and the courage to open that drawer that's been broken for years.",
    },
    bio: {
      it: 'Luca Verdi è falegname e youtuber del fai-da-te. Ha più cacciaviti che amici, e va bene così.',
      en: "Luca Verdi is a carpenter and DIY youtuber. He has more screwdrivers than friends, and that's fine.",
    },
  },
  {
    id: 'note-di-margine',
    title:    { it: 'Note di Margine', en: 'Margin Notes' },
    subtitle: { it: 'Graphic novel', en: 'A graphic novel' },
    author: 'Davide Riva',
    category: 'graphic-novel-fumetti',
    price: 26.0,
    cover: '/covers/note-di-margine.svg',
    stripeLink: 'STRIPE_LINK_TBD',
    amazonLink: 'AMAZON_LINK_TBD',
    pages: 208, isbn: 'TBD', format: 'Paperback', year: 2025, featured: true,
    description: {
      it: 'Un libraio antiquario trova messaggi scritti ai margini dei libri usati e comincia a rispondere. Un romanzo a fumetti sulla solitudine e sulle parole che restano.',
      en: 'An antiquarian bookseller finds messages written in the margins of used books and starts to reply. A graphic novel about loneliness and the words that stay behind.',
    },
    bio: {
      it: 'Davide Riva è fumettista. Disegna a inchiostro e scrive a matita, mai il contrario.',
      en: 'Davide Riva is a cartoonist. He draws in ink and writes in pencil, never the other way around.',
    },
  },
  {
    id: 'fumetti-di-mezzanotte',
    title:    { it: 'Fumetti di Mezzanotte', en: 'Midnight Comics' },
    subtitle: { it: 'Otto storie brevi', en: 'Eight short stories' },
    author: 'Iris Galli',
    category: 'graphic-novel-fumetti',
    price: 23.0,
    cover: '/covers/fumetti-di-mezzanotte.svg',
    stripeLink: 'STRIPE_LINK_TBD',
    amazonLink: 'AMAZON_LINK_TBD',
    pages: 176, isbn: 'TBD', format: 'Paperback', year: 2024, featured: false,
    description: {
      it: 'Otto racconti a fumetti che accadono tutti dopo la mezzanotte, quando le città cambiano regole. Antologia in bianco, nero e un solo rosso.',
      en: 'Eight comic stories that all happen after midnight, when cities change their rules. An anthology in black, white, and a single red.',
    },
    bio: {
      it: 'Iris Galli è autrice e serigrafa. Lavora solo di notte, per coerenza.',
      en: 'Iris Galli is an author and screen-printer. She works only at night, for consistency.',
    },
  },
  {
    id: 'pillole-di-filosofia',
    title:    { it: 'Pillole di Filosofia', en: 'Philosophy in a Nutshell' },
    subtitle: { it: 'Grandi idee in poche pagine', en: 'Big ideas in a few pages' },
    author: 'Elena Russo',
    category: 'pillole-di',
    price: 12.0,
    cover: '/covers/pillole-di-filosofia.svg',
    stripeLink: 'STRIPE_LINK_TBD',
    amazonLink: 'AMAZON_LINK_TBD',
    pages: 96, isbn: 'TBD', format: 'Paperback', year: 2025, featured: false,
    description: {
      it: 'Venti filosofi, venti idee, due pagine ciascuno. Per chi vuole capire di cosa si parla senza iscriversi a un corso triennale.',
      en: 'Twenty philosophers, twenty ideas, two pages each. For anyone who wants to follow the conversation without signing up for a three-year degree.',
    },
    bio: {
      it: 'Elena Russo insegna storia della filosofia e detesta le semplificazioni — tranne quando funzionano.',
      en: 'Elena Russo teaches the history of philosophy and hates oversimplification — except when it works.',
    },
  },
  {
    id: 'weekend-lenti',
    title:    { it: 'Weekend Lenti', en: 'Slow Weekends' },
    subtitle: { it: 'Microavventure a due passi da casa', en: 'Microadventures close to home' },
    author: 'Chiara Sole',
    category: 'tempo-libero-lifestyle',
    price: 21.0,
    cover: '/covers/weekend-lenti.svg',
    stripeLink: 'STRIPE_LINK_TBD',
    amazonLink: 'AMAZON_LINK_TBD',
    pages: 184, isbn: 'TBD', format: 'Paperback', year: 2024, featured: true,
    description: {
      it: 'Cinquanta idee per fermarsi senza andare lontano: sentieri, borghi, terme, librerie di paese. Il lusso, qui, è il tempo.',
      en: 'Fifty ideas for slowing down without going far: trails, villages, hot springs, small-town bookshops. The luxury here is time.',
    },
    bio: {
      it: 'Chiara Sole scrive di viaggi lenti e cammini. Possiede una sola valigia, piccola.',
      en: 'Chiara Sole writes about slow travel and walking routes. She owns a single, small suitcase.',
    },
  },
];

/** Localized category label. */
export function categoryLabel(slug: CategorySlug, lang: Lang): string {
  const cat = CATEGORIES.find((c) => c.slug === slug);
  return cat ? cat[lang] : slug;
}

/** "€ 19,00" — same formatting in both languages (EUR, Italian style). */
export function formatPrice(price: number): string {
  return '€ ' + price.toFixed(2).replace('.', ',');
}

/** Products of a category, newest first. */
export function byCategory(slug: CategorySlug): Product[] {
  return products.filter((p) => p.category === slug);
}

/** Related products: same category first, then the rest (newest first). */
export function related(product: Product, count = 3): Product[] {
  const same = products.filter((p) => p.category === product.category && p.id !== product.id);
  const rest = products.filter((p) => p.category !== product.category && p.id !== product.id);
  return [...same, ...rest].slice(0, count);
}
