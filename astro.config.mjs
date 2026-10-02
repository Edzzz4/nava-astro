// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import { products } from './src/data/books.ts';

const SITE = 'https://navaeditore.com';
/** @param {import('./src/data/books.ts').Product} p */
const productUrl = (p) => `${SITE}/${p.lang}/catalogo/${p.id}/`;

// Nava — static multilingual site (IT default, EN).
// Output is 100% static (dist/), deployed on Netlify.
export default defineConfig({
  site: 'https://navaeditore.com',
  output: 'static',
  trailingSlash: 'always',

  // EXTENSION POINT — add a language:
  // 1. add the locale here, 2. create src/i18n/<lang>.ts (the Dictionary
  //    type will force every key), 3. add it to `dictionaries` in src/i18n/index.ts.
  i18n: {
    defaultLocale: 'it',
    locales: ['it', 'en'],
    routing: {
      prefixDefaultLocale: true,
      redirectToDefaultLocale: false,
    },
  },

  integrations: [
    sitemap({
      // Adds xhtml:link hreflang alternates (it/en) to every sitemap entry.
      i18n: {
        defaultLocale: 'it',
        locales: { it: 'it', en: 'en' },
      },
      // The root "/" is only a 301 to /it/; thank-you and download pages
      // are noindex — keep them all out of the sitemap.
      filter: (page) => page !== `${SITE}/` && !/\/(grazie|download)\/$/.test(page),
      // Ebook editions have a different slug per language: pair them by
      // `work` (the i18n option above only pairs identical paths).
      serialize(item) {
        const product = products.find((p) => productUrl(p) === item.url);
        if (product) {
          item.links = products
            .filter((p) => p.work === product.work)
            .map((p) => ({ lang: p.lang, url: productUrl(p) }));
        }
        return item;
      },
    }),
  ],

  build: {
    // Never inline stylesheets: the CSP has no 'unsafe-inline'.
    inlineStylesheets: 'never',
  },
  vite: {
    build: {
      // Never inline assets as data: URIs inside inline scripts/styles.
      assetsInlineLimit: 0,
    },
  },
});
