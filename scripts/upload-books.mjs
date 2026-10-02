/* ─────────────────────────────────────────────────────────────
   Uploads the ebook files of every edition in src/data/books.ts to
   the PRIVATE Netlify Blobs store "books" of the linked site.
   Files are read from the production folder, never from this repo
   (the repo is public and .gitignore blocks *.pdf / *.epub).

     node scripts/upload-books.mjs           # check files, show the plan
     node scripts/upload-books.mjs --apply   # upload (needs `netlify link`)

   BOOKS_DIR defaults to ~/Desktop/nava-libri/releases. The Netlify CLI
   command defaults to `npx netlify-cli`; override with NETLIFY_BIN.
   Note: `netlify dev` uses a separate local store, seeded by the
   git-ignored netlify/functions/dev-seed-books.js.
   ───────────────────────────────────────────────────────────── */

import { spawnSync } from 'node:child_process';
import { existsSync, statSync } from 'node:fs';
import { homedir } from 'node:os';
import { join } from 'node:path';
import { products } from '../src/data/books.ts';

const apply = process.argv.includes('--apply');
const root = process.env.BOOKS_DIR ?? join(homedir(), 'Desktop', 'nava-libri', 'releases');
const [bin, ...binArgs] = (process.env.NETLIFY_BIN ?? 'npx netlify-cli').split(' ');

const files = products.flatMap((p) =>
  [p.files.pdf, p.files.epub].map((name) => ({ name, path: join(root, p.files.version, name) }))
);

let missing = 0;
for (const f of files) {
  if (!existsSync(f.path)) {
    console.error(`missing  ${f.path}`);
    missing++;
  } else {
    console.log(`${apply ? 'upload' : 'ok    '}  ${f.name}  (${(statSync(f.path).size / 1e6).toFixed(2)} MB)`);
  }
}
if (missing) process.exit(1);
if (!apply) {
  console.log('\nDry run. Add --apply to upload to the "books" store of the linked Netlify site.');
  process.exit(0);
}

for (const f of files) {
  const r = spawnSync(bin, [...binArgs, 'blobs:set', 'books', f.name, '--input', f.path, '--force'], { stdio: 'inherit' });
  if (r.status !== 0) {
    console.error(`failed: ${f.name}`);
    process.exit(r.status ?? 1);
  }
}
console.log(`\n${files.length} files uploaded to the "books" store.`);
