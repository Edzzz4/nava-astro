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
  legalName: '[TODO: ragione sociale]',
  /** e.g. B.V., eenmanszaak. */
  legalForm: '[TODO: forma giuridica]',
  /** Street, number, postcode, city. */
  address: '[TODO: indirizzo]',
  country: { it: 'Paesi Bassi', en: 'the Netherlands' } satisfies Record<Lang, string>,
  /** Dutch Chamber of Commerce number (8 digits). */
  kvk: '[TODO: numero KvK]',
  /** BTW-id, NL…B.. */
  vat: '[TODO: partita IVA NL…B..]',
  email: 'info@navaeditore.com',
};

/** True while any company field is still a placeholder. */
export function companyIncomplete(): boolean {
  return JSON.stringify(COMPANY).includes('[TODO');
}
