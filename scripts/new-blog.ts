/**
 * new-blog.ts — scaffold a new, SEO-complete blog post stub from a keyword.
 *
 * It writes the frontmatter (primary keyword, cluster, meta title/description,
 * 4 FAQ placeholders) and a structured H2 outline, marks it draft:true, and
 * records the keyword in the ledger so it's never reused. The /blog skill then
 * fills in the prose using the brand voice files and the SERP target.
 *
 * Usage:
 *   npm run new:blog -- --keyword "plumber for low water pressure"
 *   npm run new:blog                       (auto-picks the top unused cluster root)
 *   npm run new:blog -- --h2 6 --words 1400 (hint structure, e.g. from serp:analyze)
 */
import { writeFileSync, existsSync, readFileSync, readdirSync } from 'node:fs';
import { resolve } from 'node:path';
import { ROOT } from './lib/env';
import { addToLedger, isUsed } from './lib/published';

function parseArgs(argv: string[]) {
  const args: Record<string, string> = {};
  for (let i = 0; i < argv.length; i++) {
    if (argv[i].startsWith('--')) (args[argv[i].slice(2)] = argv[i + 1]), i++;
  }
  return args;
}

function slugify(s: string): string {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}
function titleCase(s: string): string {
  return s.replace(/\b\w/g, (c) => c.toUpperCase());
}

/** Find the highest-volume unused cluster root across any *.clusters.json. */
function pickFromClusters(): { keyword: string; cluster: string[] } | null {
  const dataDir = resolve(ROOT, 'data');
  if (!existsSync(dataDir)) return null;
  const files = readdirSync(dataDir).filter((f) => f.endsWith('.clusters.json'));
  let best: { root: string; volume: number; keywords: string[] } | null = null;
  for (const f of files) {
    const clusters = JSON.parse(readFileSync(resolve(dataDir, f), 'utf8'));
    for (const c of clusters) {
      if (isUsed(c.root)) continue;
      if (!best || c.volume > best.volume) best = c;
    }
  }
  return best ? { keyword: best.root, cluster: best.keywords } : null;
}

const args = parseArgs(process.argv.slice(2));
let keyword = args.keyword;
let cluster: string[] = [];

if (!keyword) {
  const picked = pickFromClusters();
  if (!picked) {
    console.error('No --keyword given and no unused clusters found. Run kw:filter + kw:cluster first.');
    process.exit(1);
  }
  keyword = picked.keyword;
  cluster = picked.cluster.slice(0, 6);
  console.error(`ℹ  Auto-picked top unused cluster: "${keyword}"`);
}

if (isUsed(keyword)) {
  console.error(`✋ "${keyword}" is already in the ledger — skipping to avoid duplicate content.`);
  process.exit(1);
}

const slug = slugify(keyword);
const filePath = resolve(ROOT, 'src', 'content', 'blog', `${slug}.md`);
if (existsSync(filePath)) { console.error(`File already exists: ${filePath}`); process.exit(1); }

const title = titleCase(keyword);
const today = new Date().toISOString().slice(0, 10);
const h2Count = Number(args.h2 ?? 5);
const wordTarget = args.words ?? '1200';

const outline = Array.from({ length: h2Count }, (_, i) =>
  `## Section ${i + 1} heading (replace with a real H2 that uses a cluster keyword where natural)\n\n<!-- Write the section here in our voice. See /brand for tone. -->\n`
).join('\n');

const clusterYaml = (cluster.length ? cluster : ['<secondary keyword>', '<secondary keyword>'])
  .map((k) => `  - "${k}"`).join('\n');

const content = `---
title: "${title}"
description: "<150-160 char summary with the primary keyword, written in our voice>"
pubDate: ${today}
author: "Northwind Team"
tags: ["Plumbing"]
draft: true
primaryKeyword: "${keyword}"
keywordCluster:
${clusterYaml}
metaTitle: "${title} | <hook>"
metaDescription: "<150-160 chars, primary keyword near the front, a reason to click>"
heroImageAlt: "<describe the hero image for accessibility + image SEO>"
faqs:
  - question: "<question using a cluster keyword>"
    answer: "<2-4 sentence answer, lead with the answer>"
  - question: "<question>"
    answer: "<answer>"
  - question: "<question>"
    answer: "<answer>"
  - question: "<question>"
    answer: "<answer>"
---

<!--
  WRITING BRIEF (delete before publishing):
  • Target length: ~${wordTarget} words (from serp:analyze if you ran it).
  • Open with HUMOR per /brand/humor.md — land a wink in the first ~50 words.
  • Put the PRIMARY KEYWORD "${keyword}" in the first 100 words.
  • Use our voice (/brand/voice.md), one opinion (/brand/opinions.md), and weave
    in ONE real story (/brand/stories.md) where it fits.
  • Internal links: 3-5 to /services/* and other /blog/* posts.
  • External links: 2-3 to authoritative, non-competitor sources.
  • Do NOT add an H1 here — the layout renders the title as the only H1.
  • When done: run "npm run seo:audit" then flip draft:false.
-->

Opening paragraph here — hook + humor + the primary keyword "${keyword}" within the first 100 words.

${outline}
`;

writeFileSync(filePath, content);
addToLedger({ keyword, slug, type: 'blog', date: today });

console.log(`\n📝 Created draft: src/content/blog/${slug}.md`);
console.log(`   primary keyword: ${keyword}`);
console.log(`   cluster: ${cluster.length ? cluster.join(', ') : '(add manually)'}`);
console.log(`   next: write the prose, add images (npm run img:fetch), run npm run seo:audit, then set draft:false\n`);
