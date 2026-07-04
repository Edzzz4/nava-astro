/* ─────────────────────────────────────────────────────────────
   Nava i18n — type-safe lookup + routing helpers.

   Usage in a page/component:
     const t = useTranslations(lang);
     t('hero_kicker')          // typo or missing key = build error

   EXTENSION POINT — add a language:
   create src/i18n/<lang>.ts exporting a `Dictionary`, add it to
   `dictionaries` and `LANGUAGES` below, and register the locale in
   astro.config.mjs. Every page is generated automatically.
   ───────────────────────────────────────────────────────────── */

import { it, type Dictionary } from './it';
import { en } from './en';

export type { Dictionary };

export const LANGUAGES = ['it', 'en'] as const;
export type Lang = (typeof LANGUAGES)[number];
export const DEFAULT_LANG: Lang = 'it';

const dictionaries: Record<Lang, Dictionary> = { it, en };

export type TranslationKey = keyof Dictionary;

/** Returns a t() bound to a language. Keys are checked at compile time. */
export function useTranslations(lang: Lang) {
  const dict = dictionaries[lang];
  return function t(key: TranslationKey): string {
    return dict[key];
  };
}

export function isLang(value: string): value is Lang {
  return (LANGUAGES as readonly string[]).includes(value);
}

/** "/it/catalogo/" for path "catalogo/". Root: localePath('it') → "/it/". */
export function localePath(lang: Lang, path = ''): string {
  const clean = path.replace(/^\/+/, '');
  return `/${lang}/${clean}`;
}

/**
 * Same page in another language: slugs are identical across languages,
 * only the prefix changes. "/it/catalogo/x/" → "/en/catalogo/x/".
 * Paths outside the localized tree (e.g. /404/) fall back to the home.
 */
export function switchLangPath(pathname: string, target: Lang): string {
  const match = pathname.match(/^\/(it|en)(\/|$)/);
  if (!match) return localePath(target);
  return localePath(target, pathname.slice(match[0].length));
}
