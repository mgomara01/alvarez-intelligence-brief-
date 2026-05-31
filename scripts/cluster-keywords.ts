/**
 * cluster-keywords.ts — group winning keywords into CLUSTERS so each page can
 * rank for a root keyword PLUS a handful of secondary/tertiary variants (the
 * video's "keyword cluster" concept — one page, many keywords).
 *
 * Algorithm (intentionally simple + explainable): keywords are grouped by their
 * shared "head noun" tokens (after removing stopwords). The highest-volume
 * keyword in a group becomes the root; the rest become the cluster.
 *
 * Usage:  npm run kw:cluster -- data/keywords.winners.json
 * Output: data/<name>.clusters.json
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { resolve, basename } from 'node:path';
import { ROOT } from './lib/env';

interface Keyword { keyword: string; volume: number; kd: number; cpc: number; intent: string; }
interface Cluster { root: string; volume: number; kd: number; keywords: string[]; }

const STOP = new Set([
  'a', 'an', 'the', 'to', 'for', 'of', 'in', 'on', 'and', 'or', 'my', 'your',
  'is', 'are', 'how', 'what', 'why', 'when', 'do', 'does', 'with', 'near', 'me',
  'i', 'it', 'best', 'cost', 'price', 'cheap',
]);

function tokens(kw: string): string[] {
  return kw.toLowerCase().replace(/[^a-z0-9 ]/g, ' ').split(/\s+/).filter((t) => t && !STOP.has(t));
}

/** Signature = the two most "content-bearing" tokens, sorted, joined. */
function signature(kw: string): string {
  const t = tokens(kw);
  if (t.length === 0) return kw.toLowerCase();
  // Use the longest tokens (proxy for the topical nouns).
  return t.sort((a, b) => b.length - a.length).slice(0, 2).sort().join('|');
}

const input = process.argv[2] ?? 'data/keywords.winners.json';
const keywords: Keyword[] = JSON.parse(readFileSync(resolve(ROOT, input), 'utf8'));

const groups = new Map<string, Keyword[]>();
for (const kw of keywords) {
  const sig = signature(kw.keyword);
  if (!groups.has(sig)) groups.set(sig, []);
  groups.get(sig)!.push(kw);
}

const clusters: Cluster[] = [...groups.values()].map((members) => {
  const sorted = members.sort((a, b) => b.volume - a.volume);
  const root = sorted[0];
  return {
    root: root.keyword,
    volume: sorted.reduce((sum, k) => sum + k.volume, 0),
    kd: root.kd,
    keywords: sorted.slice(1).map((k) => k.keyword),
  };
}).sort((a, b) => b.volume - a.volume);

const outName = basename(input).replace(/\.winners\.json$|\.json$/i, '') + '.clusters.json';
writeFileSync(resolve(ROOT, 'data', outName), JSON.stringify(clusters, null, 2) + '\n');

console.log(`\n🧩 Built ${clusters.length} clusters from ${keywords.length} keywords → ${outName}\n`);
for (const c of clusters.slice(0, 10)) {
  console.log(`   ◆ ${c.root}  (total vol ${c.volume}, KD ${c.kd})`);
  for (const k of c.keywords.slice(0, 5)) console.log(`       └ ${k}`);
}
console.log('');
