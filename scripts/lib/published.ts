/**
 * The "what have we already written" ledger. The video stresses NOT reusing the
 * same keyword twice and NOT dumping pages all at once. This tracks used
 * keywords/slugs so the generators (and the /blog skill) can pick fresh ones.
 */
import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { resolve } from 'node:path';
import { ROOT } from './env';

const LEDGER = resolve(ROOT, 'data', 'published.json');

export interface PublishedRecord {
  keyword: string;
  slug: string;
  type: 'blog' | 'service';
  date: string;
}

export function readLedger(): PublishedRecord[] {
  if (!existsSync(LEDGER)) return [];
  try {
    return JSON.parse(readFileSync(LEDGER, 'utf8'));
  } catch {
    return [];
  }
}

export function addToLedger(rec: PublishedRecord): void {
  const all = readLedger();
  all.push(rec);
  writeFileSync(LEDGER, JSON.stringify(all, null, 2) + '\n');
}

export function isUsed(keyword: string): boolean {
  const norm = keyword.trim().toLowerCase();
  return readLedger().some((r) => r.keyword.trim().toLowerCase() === norm);
}
