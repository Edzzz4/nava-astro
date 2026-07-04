/* ─────────────────────────────────────────────────────────────
   Generates the social/share images (committed to the repo, NOT
   built on Netlify — the build image lacks the right fonts):

   - public/og/<id>.png          1200×630 card per product
   - public/apple-touch-icon.png 180×180 (iOS ignores SVG icons)

   Run locally after adding/renaming a product:
     npm run og
   Uses Georgia (present on macOS) to match public/og-default.png.
   ───────────────────────────────────────────────────────────── */

import { mkdir } from 'node:fs/promises';
import sharp from 'sharp';
import { products } from '../src/data/books.ts';

const OUT = new URL('../public/og/', import.meta.url);
await mkdir(OUT, { recursive: true });

const esc = (s) =>
  s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

/** Greedy word-wrap; returns at most `maxLines` lines (last one ellipsized). */
function wrap(text, maxChars, maxLines) {
  const words = text.split(' ');
  const lines = [];
  let line = '';
  for (const word of words) {
    if (line && (line + ' ' + word).length > maxChars) {
      lines.push(line);
      line = word;
    } else {
      line = line ? line + ' ' + word : word;
    }
  }
  if (line) lines.push(line);
  if (lines.length > maxLines) {
    lines.length = maxLines;
    lines[maxLines - 1] = lines[maxLines - 1].replace(/\s*\S*$/, '…');
  }
  return lines;
}

for (const product of products) {
  const coverPng = await sharp(new URL(`../public${product.cover}`, import.meta.url).pathname)
    .resize({ height: 518 })
    .png()
    .toBuffer();

  const titleLines = wrap(product.title.it, 20, 3);
  const titleSize = titleLines.length === 3 ? 52 : 60;
  const titleY = 250;
  const lineH = titleSize * 1.12;
  const titleSvg = titleLines
    .map(
      (line, i) =>
        `<text x="520" y="${titleY + i * lineH}" font-family="Georgia, serif" font-size="${titleSize}" font-weight="600" fill="#1A1A1A">${esc(line)}</text>`
    )
    .join('');
  const afterTitle = titleY + (titleLines.length - 1) * lineH;

  const bg = `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630">
    <rect width="1200" height="630" fill="#FAF8F4"/>
    <rect x="28" y="28" width="1144" height="574" fill="none" stroke="#E4DECE" stroke-width="2"/>
    <text x="520" y="130" font-family="Georgia, serif" font-size="20" letter-spacing="5" fill="#5B554C">NAVA · EDITORE INDIPENDENTE</text>
    ${titleSvg}
    <rect x="520" y="${afterTitle + 36}" width="150" height="7" fill="#7B2D26"/>
    <text x="520" y="${afterTitle + 96}" font-family="Georgia, serif" font-style="italic" font-size="32" fill="#5B554C">${esc(product.author)}</text>
    <text x="520" y="540" font-family="Georgia, serif" font-size="24" fill="#7B2D26">navaeditore.com</text>
  </svg>`;

  await sharp(Buffer.from(bg))
    .composite([{ input: coverPng, left: 56, top: 56 }])
    .png()
    .toFile(new URL(`${product.id}.png`, OUT).pathname);
  console.log(`og/${product.id}.png`);
}

/* apple-touch-icon: full-bleed square, iOS applies its own mask */
const icon = `<svg xmlns="http://www.w3.org/2000/svg" width="180" height="180" viewBox="0 0 180 180">
  <rect width="180" height="180" fill="#1A1A1A"/>
  <text x="90" y="124" text-anchor="middle" font-family="Georgia, serif" font-size="112" font-weight="600" fill="#FAF8F4">N</text>
  <rect x="52" y="138" width="76" height="9" rx="4.5" fill="#7B2D26"/>
</svg>`;
await sharp(Buffer.from(icon))
  .png()
  .toFile(new URL('../public/apple-touch-icon.png', import.meta.url).pathname);
console.log('apple-touch-icon.png');
