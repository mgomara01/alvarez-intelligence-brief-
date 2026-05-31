# Northwind — SEO Site + Content Engine (HVAC & Plumbing)

A **static, SEO-first website** plus a **content engine** that turns the
"Claude Code + SEO masterclass" into real, runnable code. Built for a
residential & commercial **HVAC and plumbing** business, but fully reusable for
any local-service company — change one config file.

It implements the video's whole playbook:

| Masterclass recommendation | Where it lives |
| --- | --- |
| Static Site Generation (SSG) so Google crawls instantly | Astro, `output: 'static'` |
| Homepage + **blog index** + **service index** | `src/pages/` |
| Find **winning keywords** (KD ≤ 30, vol ≥ 100, informational) | `scripts/filter-keywords.ts` |
| **Keyword clusters** (rank for many keywords per page) | `scripts/cluster-keywords.ts` |
| **Steal-the-average** from the top 3 SERP results | `scripts/serp-analyze.ts` |
| **Pexels images**, royalty-free | `scripts/fetch-images.ts` |
| **Brand voice** (anti-AI-slop: voice/humor/opinions/stats/stories) | `brand/*.md` |
| **On-page SEO** checklist (one H1, kw in first 100 words, FAQs, links, meta) | `scripts/seo-audit.ts` + layouts |
| **Service pages** via the service × city "zipper" | `src/pages/services/[service]/[city].astro` |
| **Technical SEO**: sitemap, robots.txt, fast/Lighthouse | `@astrojs/sitemap`, `public/robots.txt`, `vercel.json` |
| Structured data (LocalBusiness, Article, Service, FAQ, Breadcrumb) | `src/lib/schema.ts` |
| **Claude Code Skills** (`/blog`, `/service`) | `.claude/skills/` |
| Deploy (GitHub → Vercel) + GSC/GA/GBP | this README + `src/site.config.ts` |

## Quick start

```bash
npm install
npm run dev          # http://localhost:4321
npm run build        # static output -> dist/
npm run preview      # serve the built site
```

## Make it yours (5 minutes)

1. **Edit `src/site.config.ts`** — brand name, phone/address (NAP), email,
   services, service areas (cities), social links. Everything reads from here.
2. **Edit `brand/*.md`** — paste real samples of how you write, real stats, real
   stories. This is what stops the content reading like generic AI.
3. **Copy `.env.example` → `.env`** and add keys when you have them (all optional):
   - `PEXELS_API_KEY` — free images ([pexels.com/api](https://www.pexels.com/api/))
   - `SERPER_API_KEY` — auto SERP analysis ([serper.dev](https://serper.dev)); optional, you can paste URLs instead
   - `PUBLIC_SITE_URL` — your real domain (used for canonical/sitemap/OG)
4. **Set the lead-form endpoint** in `src/components/LeadForm.astro` (Formspree by default).

## The content workflow

### Where keywords come from
- **SEMrush** (Keyword Magic Tool → filter KD ≤ 30, vol ≥ 100, informational →
  Export CSV). Also the *Questions* tab and competitor *Organic Research*.
- **Your own site** once live: **Google Search Console → Performance → Queries →
  Export** (keywords you already rank 5–20 for — the cheapest wins).
Drop any of these CSVs in `data/` and the pipeline normalizes them.

### Generate a blog post
```bash
# 1. Filter a raw export into winners, then cluster them
npm run kw:filter  -- data/keywords.csv
npm run kw:cluster -- data/keywords.winners.json

# 2. (optional) get the target structure from the current top 3
npm run serp:analyze -- "plumber for low water pressure"
#   no SERP key? paste URLs:  ... --urls https://a,https://b,https://c

# 3. Scaffold a draft (auto-picks the top unused cluster if no --keyword)
npm run new:blog -- --keyword "plumber for low water pressure"

# 4. (optional) fetch images
npm run img:fetch -- "low water pressure plumbing" --slug plumber-for-low-water-pressure

# 5. Write the prose (do it yourself, or run the /blog skill in Claude Code),
#    then audit and publish
npm run seo:audit          # fix every ❌, then set draft:false in the .md
```

**Easiest path:** in Claude Code just type **`/blog`** (or `/service`) — the
skills in `.claude/skills/` run this entire pipeline for you, including writing
in the brand voice and enforcing the checklist.

### Generate a service page
Pages for every `service × city` render automatically from `site.config.ts`. To
hand-tune a high-value money keyword:
```bash
npm run new:service -- --service emergency-plumber --city toronto
```

## Deployment (GitHub → Vercel)

1. Push this repo to GitHub (private is fine).
2. In Vercel: **New Project → import the repo**. Framework preset auto-detects
   **Astro**; output is `dist`. Deploy.
3. Add your domain in Vercel (or buy/import from Namecheap).
4. Set `PUBLIC_SITE_URL` (Vercel env var) to your final URL and redeploy.
5. Update the `Sitemap:` host in `public/robots.txt`.

### After deploy — the four post-launch steps
1. **Google Business Profile** — create/claim your free listing (huge for local).
2. **Google Search Console** — verify (paste the token into
   `SITE.googleSiteVerification` in `site.config.ts`, redeploy), then submit
   `sitemap-index.xml`. Use **URL Inspection → Request Indexing** for new pages
   to get indexed in ~a day instead of weeks.
3. **Google Analytics 4** — set `SITE.ga4MeasurementId` to track behavior.
4. **A/B test landing pages** — find the highest-converting layout, then reuse it.

## Project layout
```
src/
  site.config.ts        ← single source of truth (edit me)
  content.config.ts     ← collection schemas (enforce SEO fields at build)
  content/blog/         ← blog posts (markdown)
  content/services/     ← optional per-page service overrides
  components/  layouts/  pages/  lib/  styles/
brand/                  ← voice/humor/opinions/stats/stories (edit me)
scripts/                ← keyword + image + SERP + scaffold + audit tools
.claude/skills/         ← /blog and /service Claude Code skills
data/                   ← CSV inputs, derived JSON, the published-ledger
```

## Notes / honest caveats
- **Off-page SEO (backlinks) is deliberately not automated.** The masterclass
  (rightly) warns that cheap link-building / PBNs get sites penalized. Earn links
  the slow, safe way (guest posts, HARO/journalist queries, broken-link swaps).
- The SERP analyzer respects sites' ToS — it analyzes pages you point it at (or
  the top results from a proper SERP API), it does not scrape Google directly.
- Generated drafts ship as `draft:true` so nothing goes live unreviewed.
