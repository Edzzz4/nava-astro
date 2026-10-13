/* ─────────────────────────────────────────────────────────────
   Nava — legal identity of the seller (single source of truth).
   Used by the footer, the legal pages and the delivery email.

   Empty fields are not shown on the site. While any of legalName,
   address, kvk or vat is empty (or still a "[TODO"), EU consumer law
   is not met and netlify/functions/checkout.js refuses live sales in
   the Production context (companyIncomplete()).
   ───────────────────────────────────────────────────────────── */

import type { Lang } from '../i18n';

export const COMPANY = {
  /** Exact name as registered with the KvK. Empty = not shown yet. */
  legalName: '',
  /** e.g. B.V., eenmanszaak. */
  legalForm: 'eenmanszaak',
  /** Brand used on the site; not a registered company name. */
  brand: 'Nava Editore',
  /** Street, number, postcode, city. Empty = not shown yet. */
  address: '',
  country: { it: 'Paesi Bassi', en: 'the Netherlands' } satisfies Record<Lang, string>,
  /** Dutch Chamber of Commerce number (8 digits). Empty = not shown yet. */
  kvk: '',
  /** BTW-id, NL…B.. Empty = not shown yet. */
  vat: '',
  email: 'info@navaeditore.com',
};

/** True while a field required to sell is empty or still a placeholder. */
export function companyIncomplete(): boolean {
  const { legalName, address, kvk, vat } = COMPANY;
  return JSON.stringify(COMPANY).includes('[TODO') || [legalName, address, kvk, vat].some((v) => !v.trim());
}

/** Registered name, or the brand while the name is not shown. */
export function sellerName(): string {
  return COMPANY.legalName || COMPANY.brand;
}

/** "Address, Country", or just the country while the address is empty. */
export function companyPlace(lang: Lang): string {
  const country = COMPANY.country[lang];
  return COMPANY.address ? `${COMPANY.address}, ${country}` : country;
}
