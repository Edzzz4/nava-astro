/* Delivery email via the Resend REST API (no SDK needed).
   MAIL_FROM: "Nava Editore <libri@navaeditore.com>" once the domain is
   verified on Resend; until then the test sender onboarding@resend.dev,
   which only delivers to the Resend account's own address.
   The email is also the "durable medium" confirmation of the buyer's
   consent to immediate delivery (Directive 2011/83/EU art. 8(7) and
   16(m)): keep the summary + consent + seller lines. */
import { COMPANY } from '../../src/data/company.ts';

const esc = (s) =>
  String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

const COPY = {
  it: {
    subject: (title) => `Il tuo ebook: ${title}`,
    hello: (title) => `Grazie per aver acquistato «${title}».`,
    cta: 'Scarica PDF ed EPUB',
    linkIntro: 'Scarica il libro da questa pagina:',
    rules: (date) =>
      `Il link vale 72 ore, fino al ${date}, e permette 5 download per ciascun file. Salva i file sul tuo dispositivo: dopo la scadenza il link non funziona più.`,
    help: 'Per qualsiasi problema rispondi a questa email o scrivi a info@navaeditore.com.',
    summary: (title, total) => `Riepilogo dell'ordine: ${title}, ebook PDF + EPUB, totale pagato ${total}.`,
    consent: (date) =>
      `Prima del pagamento hai chiesto la consegna immediata dell'ebook e hai riconosciuto che, iniziata la consegna, perdi il diritto di recesso di 14 giorni. Consenso registrato il ${date}.`,
    seller: 'Venditore',
    terms: 'Termini di vendita',
    ref: 'Riferimento ordine',
    locale: 'it-IT',
  },
  en: {
    subject: (title) => `Your ebook: ${title}`,
    hello: (title) => `Thank you for buying “${title}”.`,
    cta: 'Download PDF and EPUB',
    linkIntro: 'Download the book from this page:',
    rules: (date) =>
      `The link is valid for 72 hours, until ${date}, and allows 5 downloads of each file. Save the files on your device: after it expires the link stops working.`,
    help: 'If anything goes wrong, reply to this email or write to info@navaeditore.com.',
    summary: (title, total) => `Order summary: ${title}, ebook PDF + EPUB, total paid ${total}.`,
    consent: (date) =>
      `Before paying you asked for immediate delivery of the ebook and acknowledged that, once delivery has started, you lose your 14-day right of withdrawal. Consent recorded on ${date}.`,
    seller: 'Seller',
    terms: 'Terms of sale',
    ref: 'Order reference',
    locale: 'en-GB',
  },
};

export function deliveryEmail({ lang, title, link, expires, orderRef, amount, currency, consentAt, site }) {
  const c = COPY[lang] ?? COPY.en;
  // dateStyle/timeStyle can't be combined with timeZoneName: spell it out.
  const when = (iso) =>
    new Intl.DateTimeFormat(c.locale, {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      timeZone: 'Europe/Amsterdam',
      timeZoneName: 'short',
    }).format(new Date(iso));
  const date = when(expires);
  const total = new Intl.NumberFormat(c.locale, { style: 'currency', currency: currency.toUpperCase() }).format(amount / 100);
  const C = COMPANY;
  const seller = `${c.seller}: ${C.legalName}, ${C.address}, ${C.country[lang] ?? C.country.en} · KvK ${C.kvk} · BTW/VAT ${C.vat}`;
  const termsUrl = `${site}/${lang}/legale/termini-di-vendita/`;
  const text = [
    c.hello(title), '', c.linkIntro, link, '', c.rules(date), '', c.help, '',
    c.summary(title, total), c.consent(when(consentAt)), `${c.ref}: ${orderRef}`, '',
    seller, `${c.terms}: ${termsUrl}`,
  ].join('\n');
  const html = `<!doctype html><html lang="${lang}"><body style="margin:0;padding:24px;background:#faf8f4;color:#1a1a1a;font-family:Georgia,serif;font-size:17px;line-height:1.5">
<div style="max-width:560px;margin:0 auto">
<p>${esc(c.hello(title))}</p>
<p style="margin:28px 0"><a href="${esc(link)}" style="display:inline-block;background:#7b2d26;color:#ffffff;text-decoration:none;padding:12px 22px;border-radius:4px;font-family:Arial,sans-serif;font-size:16px">${esc(c.cta)}</a></p>
<p style="font-size:14px;color:#5b554c">${esc(c.linkIntro)}<br><a href="${esc(link)}" style="color:#7b2d26;word-break:break-all">${esc(link)}</a></p>
<p>${esc(c.rules(date))}</p>
<p>${esc(c.help)}</p>
<p style="font-size:14px;border-top:1px solid #e4dece;padding-top:16px">${esc(c.summary(title, total))}<br>${esc(c.consent(when(consentAt)))}<br>${esc(c.ref)}: ${esc(orderRef)}</p>
<p style="font-size:13px;color:#5b554c">${esc(seller)}<br><a href="${esc(termsUrl)}" style="color:#7b2d26">${esc(c.terms)}</a></p>
</div></body></html>`;
  return { subject: c.subject(title), text, html };
}

export async function sendEmail({ to, subject, text, html, idempotencyKey }) {
  const key = process.env.RESEND_API_KEY;
  if (!key) throw new Error('RESEND_API_KEY is not set');
  // No default sender in code: Netlify's secret scanning fails the build if
  // a secret env var's value (MAIL_FROM is stored as one) appears in a file.
  const from = process.env.MAIL_FROM;
  if (!from) throw new Error('MAIL_FROM is not set');
  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${key}`,
      'Content-Type': 'application/json',
      // Webhook retries must not send the same email twice.
      'Idempotency-Key': idempotencyKey,
    },
    body: JSON.stringify({
      from,
      to: [to],
      reply_to: 'info@navaeditore.com',
      subject,
      text,
      html,
    }),
  });
  if (!res.ok) throw new Error(`Resend ${res.status}: ${await res.text()}`);
  return res.json();
}
