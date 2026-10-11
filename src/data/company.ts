/* ─────────────────────────────────────────────────────────────
   Nava — legal identity of the seller (single source of truth).
   Used by the footer, the legal pages and the delivery email.

   Fill every "[TODO: …]" before selling: while any is left,
   netlify/functions/checkout.js refuses live sales in the
   Production context (companyIncomplete()).
   ───────────────────────────────────────────────────────────── */

import type { Lang } from '../i18n';

export const COMPANY = {
  /** Exact name as registered with the KvK. */
  legalName: 'Edoardo Vacca',
  /** e.g. B.V., eenmanszaak. */
  legalForm: 'eenmanszaak',
  /** Brand used on the site; not a registered company name. */
  brand: 'Nava Editore',
  /** Street, number, postcode, city. Empty = not shown yet (sales stay
   *  disabled: EU consumer law requires a geographic address). */
  address: '',
  country: { it: 'Paesi Bassi', en: 'the Netherlands' } satisfies Record<Lang, string>,
  /** Dutch Chamber of Commerce number (8 digits). */
  kvk: '85763055',
  /** BTW-id, NL…B.. */
  vat: '[TODO: partita IVA NL…B..]',
  email: 'info@navaeditore.com',
};

/** True while any company field is still a placeholder or the address is empty. */
export function companyIncomplete(): boolean {
  return JSON.stringify(COMPANY).includes('[TODO') || !COMPANY.address.trim();
}

/** "Address, Country", or just the country while the address is empty. */
export function companyPlace(lang: Lang): string {
  const country = COMPANY.country[lang];
  return COMPANY.address ? `${COMPANY.address}, ${country}` : country;
}
