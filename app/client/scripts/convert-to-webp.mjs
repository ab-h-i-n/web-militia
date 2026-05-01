#!/usr/bin/env node
// Walk assets/images and convert every .png to .webp using sharp.
// Usage: node scripts/convert-to-webp.mjs [--delete-png] [--quality=85]

import { readdir, stat, unlink } from 'node:fs/promises';
import { join, extname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';
import sharp from 'sharp';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ASSETS_ROOT = resolve(__dirname, '../../../assets/images');

const args = process.argv.slice(2);
const DELETE_PNG = args.includes('--delete-png');
const QUALITY = Number(
  args.find((a) => a.startsWith('--quality='))?.split('=')[1] ?? 85,
);

async function* walk(dir) {
  const entries = await readdir(dir, { withFileTypes: true });
  for (const entry of entries) {
    if (entry.name.startsWith('.')) continue; // skip .DS_Store etc
    const full = join(dir, entry.name);
    if (entry.isDirectory()) yield* walk(full);
    else yield full;
  }
}

let converted = 0;
let skipped = 0;
let bytesIn = 0;
let bytesOut = 0;

console.log(`Converting PNGs under ${ASSETS_ROOT} (q=${QUALITY})`);

for await (const file of walk(ASSETS_ROOT)) {
  if (extname(file).toLowerCase() !== '.png') {
    skipped++;
    continue;
  }
  const out = file.replace(/\.png$/i, '.webp');
  const inSize = (await stat(file)).size;

  await sharp(file).webp({ quality: QUALITY, effort: 6 }).toFile(out);

  const outSize = (await stat(out)).size;
  bytesIn += inSize;
  bytesOut += outSize;
  converted++;

  const pct = ((1 - outSize / inSize) * 100).toFixed(1);
  console.log(
    `  ${file.replace(ASSETS_ROOT + '/', '')}  ${(inSize / 1024).toFixed(0)}KB → ${(outSize / 1024).toFixed(0)}KB  (-${pct}%)`,
  );

  if (DELETE_PNG) await unlink(file);
}

const totalPct = bytesIn === 0 ? 0 : ((1 - bytesOut / bytesIn) * 100).toFixed(1);
console.log(
  `\nDone. ${converted} converted, ${skipped} skipped. ` +
  `${(bytesIn / 1024 / 1024).toFixed(2)}MB → ${(bytesOut / 1024 / 1024).toFixed(2)}MB  (-${totalPct}%)`,
);
if (!DELETE_PNG) {
  console.log('Originals kept. Re-run with --delete-png to remove them.');
}
