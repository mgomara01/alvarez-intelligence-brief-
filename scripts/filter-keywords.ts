/**
 * filter-keywords.ts — turn a raw SEMrush (or Search Console) CSV export into a
 * shortlist of WINNING keywords, using the masterclass's criteria:
 *
 *   • Keyword Difficulty (KD) <= 30   (winnable for a newer site)
 *   • Search Volume       >= 100      (worth ranking for)
 *   • Intent = informational          (blog intent, not transactional)
 *
 * Commercial/transactional keywords are routed to a separate "money" list —
 * those become SERVICE pages, not blog posts (the video's two tactics).
 *
 * Usage:
 *   npm run kw:filter -- data/keywords.csv
 *   npm run kw:filter -- data/keywords.csv --maxKd 30 --minVol 100
 *   npm run kw:filter -- data/keywords.csv --intent commercial   (for service pages)
 *
 * Output: data/<name>.winners.json  +  a printed summary.
 */
import { writeFileSync } from 'node:fs';
import { resolve, basename } from 'node:path';
import { readCsv, pick, type Row } from './lib/csv';
import { ROOT } from './lib/env';
import { isUsed } from './lib/published';

interface Keyword {
  keyword: string;
  volume: number;
  kd: number;
  cpc: number;
  intent: string;
}

function num(v: string | undefined): number {
  if (!v) return 0;
  const n = parseFloat(v.replace(/[^0-9.\-]/g, ''));
  return Number.isFinite(n) ? n : 0;
}

function normalizeRow(row: Row): Keyword {
  return {
    keyword: pick(row, ['Keyword', 'Query', 'keyword']) ?? '',
    volume: num(pick(row, ['Volume', 'Search Volume', 'Impressions'])),
    kd: num(pick(row, ['Keyword Difficulty', 'KD', 'KD %', 'Difficulty'])),
    cpc: num(pick(row, ['CPC', 'CPC (USD)', 'Cost Per Click'])),
    intent: (pick(row, ['Intent', 'Intent Type']) ?? '').toLowerCase(),
  };
}

function parseArgs(argv: string[]) {
  const args: Record<string, string> = {};
  const positional: string[] = [];
  for (let i = 0; i < argv.length; i++) {
    if (argv[i].startsWith('--')) args[argv[i].slice(2)] = argv[i + 1], i++;
    else positional.push(argv[i]);
  }
  return { args, positional };
}

const { args, positional } = parseArgs(process.argv.slice(2));
const input = positional[0] ?? 'data/keywords.csv';
const maxKd = Number(args.maxKd ?? 30);
const minVol = Number(args.minVol ?? 100);
const wantIntent = (args.intent ?? 'informational').toLowerCase();

const inputPath = resolve(ROOT, input);
const rows = readCsv(inputPath).map(normalizeRow).filter((k) => k.keyword);

// Intent matching is fuzzy: SEMrush sometimes lists multiple intents in one
// cell ("informational, commercial"). For the money list we accept commercial
// OR transactional. If a CSV has no intent column, we keep everything and just
// flag it so you can eyeball the list.
const hasIntentData = rows.some((k) => k.intent);
function intentMatches(k: Keyword): boolean {
  if (!hasIntentData) return true;
  if (wantIntent === 'commercial')
    return k.intent.includes('commercial') || k.intent.includes('transactional');
  return k.intent.includes(wantIntent);
}

const winners = rows
  .filter((k) => k.kd <= maxKd && k.volume >= minVol && intentMatches(k))
  .filter((k) => !isUsed(k.keyword))
  // Best opportunities first: high volume, low difficulty.
  .sort((a, b) => b.volume - a.volume || a.kd - b.kd);

const outName = basename(input).replace(/\.csv$/i, '') + '.winners.json';
const outPath = resolve(ROOT, 'data', outName);
writeFileSync(outPath, JSON.stringify(winners, null, 2) + '\n');

console.log(`\n📊 Keyword filter — ${input}`);
console.log(`   rows in: ${rows.length}   winners out: ${winners.length}`);
console.log(`   criteria: KD <= ${maxKd}, volume >= ${minVol}, intent ~ "${wantIntent}"${hasIntentData ? '' : ' (no intent column — kept all)'}`);
console.log(`   already-published keywords were skipped via the ledger.`);
console.log(`\n   Top 15 opportunities:`);
for (const k of winners.slice(0, 15)) {
  console.log(`   • ${k.keyword.padEnd(42)} vol ${String(k.volume).padStart(6)}  KD ${String(k.kd).padStart(3)}  $${k.cpc.toFixed(2)}`);
}
console.log(`\n   → wrote ${outName}\n`);
