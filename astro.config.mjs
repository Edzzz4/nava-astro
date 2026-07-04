// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

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
      // The root "/" is only a 301 to /it/ — keep it out of the sitemap.
      filter: (page) => page !== 'https://navaeditore.com/',
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
