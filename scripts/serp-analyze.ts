/**
 * serp-analyze.ts — the "steal the average" step from the masterclass.
 *
 * Fetches the top-ranking pages for your keyword, strips the chrome, and
 * computes the AVERAGE word count, H2 count, and image count. That average is
 * your target structure: match (or slightly beat) what's already winning.
 *
 * Two modes:
 *   MANUAL (no key):  paste the 3 URLs yourself.
 *     npm run serp:analyze -- "how much does a plumber cost" --urls https://a.com,https://b.com,https://c.com
 *   AUTO (SERPER_API_KEY in .env): pulls the top organic results for you.
 *     npm run serp:analyze -- "how much does a plumber cost"
 *
 * Output: prints a target spec (and writes data/serp/<slug>.json).
 */
import { mkdirSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { ROOT, loadEnv } from './lib/env';

loadEnv();

interface PageStats { url: string; words: number; h2: number; images: number; title: string; }

function parseArgs(argv: string[]) {
  const args: Record<string, string> = {};
  const positional: string[] = [];
  for (let i = 0; i < argv.length; i++) {
    if (argv[i].startsWith('--')) (args[argv[i].slice(2)] = argv[i + 1]), i++;
    else positional.push(argv[i]);
  }
  return { args, positional };
}

/** Strip tags/scripts and count visible words + structural elements. */
function analyzeHtml(html: string, url: string): PageStats {
  const title = (html.match(/<title[^>]*>([^<]*)<\/title>/i)?.[1] ?? '').trim();
  const h2 = (html.match(/<h2[\s>]/gi) ?? []).length;
  const images = (html.match(/<img[\s>]/gi) ?? []).length;
  const body = html
    .replace(/<script[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style[\s\S]*?<\/style>/gi, ' ')
    .replace(/<nav[\s\S]*?<\/nav>/gi, ' ')
    .replace(/<footer[\s\S]*?<\/footer>/gi, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&[a-z]+;/gi, ' ')
    .replace(/\s+/g, ' ')
    .trim();
  const words = body ? body.split(' ').length : 0;
  return { url, words, h2, images, title };
}

async function serperTopUrls(query: string, key: string): Promise<string[]> {
  const res = await fetch('https://google.serper.dev/search', {
    method: 'POST',
    headers: { 'X-API-KEY': key, 'Content-Type': 'application/json' },
    body: JSON.stringify({ q: query, num: 10 }),
  });
  if (!res.ok) throw new Error(`Serper error ${res.status}: ${await res.text()}`);
  const data = (await res.json()) as { organic?: Array<{ link: string }> };
  // Skip aggregators/forums the video says to avoid (Reddit, Quora, etc.).
  const skip = /reddit\.com|quora\.com|pinterest\.|youtube\.com|facebook\.com/i;
  return (data.organic ?? []).map((o) => o.link).filter((u) => !skip.test(u)).slice(0, 3);
}

async function main() {
  const { args, positional } = parseArgs(process.argv.slice(2));
  const query = positional.join(' ').trim();
  if (!query) { console.error('Usage: npm run serp:analyze -- "<keyword>" [--urls a,b,c]'); process.exit(1); }

  let urls: string[] = [];
  if (args.urls) urls = args.urls.split(',').map((u) => u.trim()).filter(Boolean);
  else if (process.env.SERPER_API_KEY) urls = await serperTopUrls(query, process.env.SERPER_API_KEY);
  else {
    console.error('⚠  No --urls and no SERPER_API_KEY. Paste the top 3 ranking URLs:');
    console.error('   npm run serp:analyze -- "' + query + '" --urls https://a,https://b,https://c');
    process.exit(1);
  }

  const stats: PageStats[] = [];
  for (const url of urls) {
    try {
      const res = await fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0 (SEO research bot)' } });
      stats.push(analyzeHtml(await res.text(), url));
      console.error(`   ✓ analyzed ${url}`);
    } catch (e) {
      console.error(`   ✗ failed ${url}: ${(e as Error).message}`);
    }
  }
  if (stats.length === 0) { console.error('No pages analyzed.'); process.exit(1); }

  const avg = (sel: (s: PageStats) => number) =>
    Math.round(stats.reduce((sum, s) => sum + sel(s), 0) / stats.length);

  // Target = the average, nudged up ~10% on word count to "slightly beat" them.
  const target = {
    keyword: query,
    analyzedUrls: stats.map((s) => s.url),
    targetWordCount: Math.round(avg((s) => s.words) * 1.1),
    targetH2Count: Math.max(avg((s) => s.h2), 4),
    targetImageCount: Math.max(avg((s) => s.images), 2),
    perPage: stats,
  };

  const slug = query.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
  const dir = resolve(ROOT, 'data', 'serp');
  mkdirSync(dir, { recursive: true });
  writeFileSync(resolve(dir, `${slug}.json`), JSON.stringify(target, null, 2) + '\n');

  console.log(`\n🎯 SERP target for "${query}"`);
  console.log(`   word count : ${target.targetWordCount} (avg of top ${stats.length}, +10%)`);
  console.log(`   H2 sections: ${target.targetH2Count}`);
  console.log(`   images     : ${target.targetImageCount}`);
  console.log(`   → wrote data/serp/${slug}.json\n`);
  // Also emit machine-readable JSON for the skill.
  console.log(JSON.stringify(target));
}

main().catch((e) => { console.error(e); process.exit(1); });
