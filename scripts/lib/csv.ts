/**
 * Tiny dependency-free CSV reader/writer. Handles quoted fields, embedded
 * commas/newlines, and auto-detects comma vs semicolon delimiters (SEMrush
 * exports vary by locale).
 */
import { readFileSync } from 'node:fs';

export type Row = Record<string, string>;

function detectDelimiter(headerLine: string): string {
  const comma = (headerLine.match(/,/g) ?? []).length;
  const semi = (headerLine.match(/;/g) ?? []).length;
  const tab = (headerLine.match(/\t/g) ?? []).length;
  if (tab > comma && tab > semi) return '\t';
  return semi > comma ? ';' : ',';
}

/** Parse CSV text into an array of objects keyed by header. */
export function parseCsv(text: string): Row[] {
  const clean = text.replace(/^﻿/, ''); // strip BOM
  const firstLine = clean.slice(0, clean.indexOf('\n'));
  const delim = detectDelimiter(firstLine);

  const records: string[][] = [];
  let field = '';
  let record: string[] = [];
  let inQuotes = false;

  for (let i = 0; i < clean.length; i++) {
    const ch = clean[i];
    if (inQuotes) {
      if (ch === '"') {
        if (clean[i + 1] === '"') { field += '"'; i++; }
        else inQuotes = false;
      } else field += ch;
    } else if (ch === '"') {
      inQuotes = true;
    } else if (ch === delim) {
      record.push(field); field = '';
    } else if (ch === '\n') {
      record.push(field); field = '';
      records.push(record); record = [];
    } else if (ch !== '\r') {
      field += ch;
    }
  }
  if (field.length > 0 || record.length > 0) { record.push(field); records.push(record); }

  const [header, ...rows] = records.filter((r) => r.some((c) => c.trim() !== ''));
  if (!header) return [];
  return rows.map((cols) => {
    const obj: Row = {};
    header.forEach((h, idx) => { obj[h.trim()] = (cols[idx] ?? '').trim(); });
    return obj;
  });
}

export function readCsv(path: string): Row[] {
  return parseCsv(readFileSync(path, 'utf8'));
}

/**
 * Find a column value by trying several possible header names (SEMrush column
 * labels differ between tools/exports). Case-insensitive.
 */
export function pick(row: Row, candidates: string[]): string | undefined {
  const keys = Object.keys(row);
  for (const cand of candidates) {
    const match = keys.find((k) => k.toLowerCase() === cand.toLowerCase());
    if (match) return row[match];
  }
  return undefined;
}
