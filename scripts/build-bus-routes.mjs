// Builds app/assets/data/bus-routes.json from the TfNSW static bus GTFS.
// Usage: TFNSW_API_KEY=xxxx node scripts/build-bus-routes.mjs
// Needs Node 20+ and the `unzipper` package (npm i -D unzipper in repo root or run via npx).
import { createWriteStream, writeFileSync } from 'node:fs';
import { pipeline } from 'node:stream/promises';
import { Readable } from 'node:stream';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

const key = process.env.TFNSW_API_KEY;
if (!key) throw new Error('Set TFNSW_API_KEY');

const zipPath = join(tmpdir(), 'buses-gtfs.zip');
const res = await fetch('https://api.transport.nsw.gov.au/v1/gtfs/schedule/buses', { headers: { Authorization: `apikey ${key}` } });
if (!res.ok) throw new Error(`Download failed: ${res.status}`);
await pipeline(Readable.fromWeb(res.body), createWriteStream(zipPath));

const { default: unzipper } = await import('unzipper');
const dir = await unzipper.Open.file(zipPath);
const entry = dir.files.find((f) => f.path === 'routes.txt');
if (!entry) throw new Error('routes.txt not found in GTFS');
const text = (await entry.buffer()).toString('utf8');

const [head, ...lines] = text.trim().split(/\r?\n/);
const cols = head.split(',').map((c) => c.replace(/"/g, ''));
const iShort = cols.indexOf('route_short_name');
const iLong = cols.indexOf('route_long_name');
const parse = (l) => l.match(/("([^"]|"")*"|[^,]*)(,|$)/g).map((c) => c.replace(/,$/, '').replace(/^"|"$/g, '').replace(/""/g, '"'));

const seen = new Map();
for (const l of lines) {
  const c = parse(l);
  const number = c[iShort]?.trim();
  if (number && !seen.has(number)) seen.set(number, (c[iLong] ?? '').trim());
}
const out = [...seen].map(([number, name]) => ({ number, name })).sort((a, b) => a.number.localeCompare(b.number, 'en', { numeric: true }));
writeFileSync(new URL('../app/assets/data/bus-routes.json', import.meta.url), JSON.stringify(out, null, 1));
console.log(`Wrote ${out.length} routes`);
