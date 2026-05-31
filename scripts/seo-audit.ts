/**
 * seo-audit.ts — automated on-page SEO checklist (the video's "80+ signals",
 * implemented as the high-impact subset that actually moves rankings).
 *
 * Two passes:
 *   A) SOURCE pass  — reads src/content/**.md for content rules a human writes:
 *      primary keyword in first 100 words, keyword cluster present, 4-8 FAQs,
 *      3-5 internal links, 2-3 external links, meta length, no leftover TODOs,
 *      and "no H1 in body" (the layout owns the single H1).
 *   B) BUILD pass   — if dist/ exists (after `npm run build`), reads the rendered
 *      HTML for: exactly one <h1>, title/description length, canonical, OG tags,
 *      JSON-LD present, every <img> has alt, viewport + lang, H2 present.
 *
 * Exit code is non-zero if any ERROR-level check fails (good for CI / pre-deploy).
 *
 * Usage:  npm run seo:audit            (source pass; build pass if dist exists)
 *         npm run build && npm run seo:audit
 */
import { readFileSync, existsSync, readdirSync, statSync } from 'node:fs';
import { resolve, join, relative } from 'node:path';
import { ROOT } from './lib/env';

type Level = 'error' | 'warn';
interface Finding { level: Level; rule: string; msg: string; }

let totalErrors = 0;
let totalWarns = 0;

function walk(dir: string, ext: string): string[] {
  if (!existsSync(dir)) return [];
  const out: string[] = [];
  for (const name of readdirSync(dir)) {
    const p = join(dir, name);
    if (statSync(p).isDirectory()) out.push(...walk(p, ext));
    else if (p.endsWith(ext)) out.push(p);
  }
  return out;
}

function report(file: string, findings: Finding[]) {
  if (findings.length === 0) {
    console.log(`✅ ${relative(ROOT, file)}`);
    return;
  }
  console.log(`\n📄 ${relative(ROOT, file)}`);
  for (const f of findings) {
    const icon = f.level === 'error' ? '❌' : '⚠️ ';
    console.log(`   ${icon} [${f.rule}] ${f.msg}`);
    if (f.level === 'error') totalErrors++; else totalWarns++;
  }
}

// --------------------------------------------------------------------------
// PASS A — source markdown content rules
// --------------------------------------------------------------------------
function parseFrontmatter(raw: string): { fm: Record<string, string>; fmRaw: string; body: string } {
  const m = raw.match(/^---\n([\s\S]*?)\n---\n?([\s\S]*)$/);
  if (!m) return { fm: {}, fmRaw: '', body: raw };
  const fm: Record<string, string> = {};
  for (const line of m[1].split('\n')) {
    const km = line.match(/^([a-zA-Z0-9_]+):\s*(.*)$/);
    if (km) fm[km[1]] = km[2].replace(/^["']|["']$/g, '').trim();
  }
  return { fm, fmRaw: m[1], body: m[2] };
}

function auditMarkdown(file: string, kind: 'blog' | 'services') {
  const raw = readFileSync(file, 'utf8');
  const { fm, fmRaw, body } = parseFrontmatter(raw);
  const findings: Finding[] = [];
  const push = (level: Level, rule: string, msg: string) => findings.push({ level, rule, msg });

  const isDraft = fm.draft === 'true';

  // Primary keyword present
  const primary = fm.primaryKeyword?.toLowerCase();
  if (!primary) push('error', 'primary-keyword', 'missing primaryKeyword in frontmatter');

  // Meta description length 50-160
  const desc = fm.metaDescription ?? '';
  if (!desc) push('error', 'meta-description', 'missing metaDescription');
  else if (desc.length < 50 || desc.length > 165)
    push('warn', 'meta-description', `length ${desc.length} (aim 150-160)`);

  // Meta title length
  const mt = fm.metaTitle ?? fm.title ?? '';
  if (mt.length > 60) push('warn', 'meta-title', `title ${mt.length} chars (Google truncates ~60)`);

  // Keyword cluster present (frontmatter block)
  if (kind === 'blog' && !/keywordCluster:/.test(fmRaw))
    push('warn', 'keyword-cluster', 'no keywordCluster — you\'re leaving secondary rankings on the table');

  // FAQs: count question: lines
  const faqCount = (fmRaw.match(/-\s*question:/g) ?? []).length;
  if (faqCount < 4) push(kind === 'blog' ? 'error' : 'warn', 'faqs', `${faqCount} FAQs (need 4-8 for FAQPage richness)`);
  if (faqCount > 8) push('warn', 'faqs', `${faqCount} FAQs (>8 dilutes; trim to the best)`);

  // Body checks (skip if draft stub still has placeholders we already flag below)
  const bodyText = body.replace(/<!--[\s\S]*?-->/g, ' '); // drop HTML comments/briefs
  const first100 = bodyText.replace(/[#>*_`\-]/g, ' ').split(/\s+/).filter(Boolean).slice(0, 100).join(' ').toLowerCase();
  if (primary) {
    // Token-based, not exact-phrase: natural phrasing ("emergency plumber in
    // Toronto") should pass without forcing awkward exact-match stuffing.
    const kwTokens = primary.split(/\s+/).filter((t) => t.length > 2);
    const missing = kwTokens.filter((t) => !first100.includes(t));
    if (missing.length)
      push(isDraft ? 'warn' : 'error', 'keyword-first-100', `primary keyword terms not in first 100 words: ${missing.join(', ')}`);
  }

  // No H1 in body (layout owns the single H1)
  if (/^#\s+/m.test(bodyText)) push('error', 'single-h1', 'body contains an H1 (# ) — use H2 (##) and below');

  // H2 count
  const h2 = (bodyText.match(/^##\s+/gm) ?? []).length;
  if (h2 < 3) push('warn', 'h2-count', `${h2} H2 sections (aim 4+ for depth/scannability)`);

  // Internal links (relative or same-site)
  const internal = (bodyText.match(/\]\(\/[a-z]/gi) ?? []).length;
  if (internal < 3) push('warn', 'internal-links', `${internal} internal links (aim 3-5 to /services & /blog)`);

  // External links
  const external = (bodyText.match(/\]\(https?:\/\//gi) ?? []).length;
  if (kind === 'blog' && external < 2) push('warn', 'external-links', `${external} external links (aim 2-3 authoritative, non-competitor)`);

  // Leftover placeholders / TODO
  if (/<[a-z][^>]*>|TODO|replace with|WRITING BRIEF|Section \d+ heading/i.test(bodyText) && !isDraft)
    push('error', 'placeholders', 'leftover template placeholders/TODOs in a non-draft page');

  report(file, findings);
}

// --------------------------------------------------------------------------
// PASS B — built HTML rendered rules
// --------------------------------------------------------------------------
function auditHtml(file: string) {
  const html = readFileSync(file, 'utf8');
  const findings: Finding[] = [];
  const push = (level: Level, rule: string, msg: string) => findings.push({ level, rule, msg });

  // noindex pages (404, drafts) are exempt from most checks
  if (/<meta\s+name=["']robots["']\s+content=["'][^"']*noindex/i.test(html)) {
    report(file, []);
    return;
  }

  const h1s = (html.match(/<h1[\s>]/gi) ?? []).length;
  if (h1s !== 1) push('error', 'single-h1', `found ${h1s} <h1> (must be exactly 1)`);

  // Decode common HTML entities so length reflects what Google actually counts
  // ("&amp;" is 1 character to a user, not 5).
  const decode = (s: string) =>
    s.replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>')
      .replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&#x27;/gi, "'");

  const title = decode(html.match(/<title[^>]*>([^<]*)<\/title>/i)?.[1] ?? '');
  if (!title) push('error', 'title', 'missing <title>');
  else if (title.length > 65) push('warn', 'title', `title ${title.length} chars`);

  const desc = decode(html.match(/<meta\s+name=["']description["']\s+content=["']([^"']*)["']/i)?.[1] ?? '');
  if (!desc) push('error', 'meta-description', 'missing meta description');
  else if (desc.length < 50 || desc.length > 165) push('warn', 'meta-description', `length ${desc.length}`);

  if (!/<link\s+rel=["']canonical["']/i.test(html)) push('error', 'canonical', 'missing canonical link');
  if (!/property=["']og:title["']/i.test(html)) push('warn', 'open-graph', 'missing og:title');
  if (!/property=["']og:image["']/i.test(html)) push('warn', 'open-graph', 'missing og:image');
  if (!/application\/ld\+json/i.test(html)) push('warn', 'structured-data', 'no JSON-LD structured data');
  if (!/<h2[\s>]/i.test(html)) push('warn', 'h2', 'no <h2> on page');
  if (!/name=["']viewport["']/i.test(html)) push('error', 'viewport', 'missing viewport meta');
  if (!/<html[^>]+lang=/i.test(html)) push('warn', 'lang', 'missing <html lang>');

  // Every <img> must have a non-empty alt
  const imgs = html.match(/<img\b[^>]*>/gi) ?? [];
  const missingAlt = imgs.filter((tag) => !/\balt=["'][^"']+["']/i.test(tag)).length;
  if (missingAlt > 0) push('error', 'img-alt', `${missingAlt}/${imgs.length} images missing alt text`);

  report(file, findings);
}

// --------------------------------------------------------------------------
console.log('\n🔎 SEO AUDIT — PASS A (source content)\n');
const blogFiles = walk(resolve(ROOT, 'src/content/blog'), '.md');
const serviceFiles = walk(resolve(ROOT, 'src/content/services'), '.md');
blogFiles.forEach((f) => auditMarkdown(f, 'blog'));
serviceFiles.forEach((f) => auditMarkdown(f, 'services'));

const distDir = resolve(ROOT, 'dist');
if (existsSync(distDir)) {
  console.log('\n🔎 SEO AUDIT — PASS B (built HTML in dist/)\n');
  walk(distDir, '.html').forEach(auditHtml);
} else {
  console.log('\nℹ  No dist/ yet — run `npm run build` first to also audit rendered HTML.');
}

console.log(`\n────────────────────────────────────────`);
console.log(`Summary: ${totalErrors} error(s), ${totalWarns} warning(s).`);
console.log(`────────────────────────────────────────\n`);
process.exit(totalErrors > 0 ? 1 : 0);
