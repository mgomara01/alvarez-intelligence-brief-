# CLAUDE.md — operating procedures for this repo

This is a **static, SEO-first website + content engine** for a residential &
commercial **HVAC and plumbing** company. Treat this file as your standing
instructions (the "employee handbook"). The two growth tactics are: **(1) blog
posts at scale** and **(2) service landing pages**.

## Golden rules (do not violate)
1. **Static Site Generation only.** This is Astro with `output: 'static'`. Every
   page must pre-render to HTML. Never introduce on-demand/server rendering or an
   adapter — Google must get complete HTML on the first request.
2. **One H1 per page.** Layouts render the single H1 from frontmatter/props.
   Markdown bodies start at `##`. Never put `#` in content bodies.
3. **No duplicate keywords.** Check `data/published.json` before creating a page.
   The generators do this automatically; respect it.
4. **Content is king.** Optimize for SEO, but never at the cost of being useful
   and enjoyable. Keep the brand voice (`/brand`) intact in every edit.
5. **Don't mass-publish.** Ramp cadence slowly (a few posts ramping up over days,
   not hundreds at once) or Google flags the spike. Posts default to `draft:true`.
6. **Secrets stay in `.env`.** Never commit real keys. `.env.example` documents them.

## The configuration lives in one place
`src/site.config.ts` — brand, contact (NAP), services, service areas, nav,
verification tokens. Editing this updates pages, schema, the service×city
"zipper", footer, and sitemap. Change the business here, not in components.

## Brand voice (anti-AI-slop)
Before writing ANY content, read `/brand/*.md` (voice, humor, opinions, stats,
stories). Output must sound like those files. First ~50 words of a blog post need
a wink/joke; money pages keep humor light.

## The content pipeline (commands)
```
npm run kw:filter   -- data/keywords.csv          # SEMrush/GSC CSV -> winners (KD<=30, vol>=100, informational)
npm run kw:cluster  -- data/keywords.winners.json # group winners into clusters
npm run serp:analyze-- "<keyword>" [--urls a,b,c] # steal-the-average target structure
npm run img:fetch   -- "<query>" --slug <slug>    # Pexels images (needs key, else placeholder)
npm run new:blog    -- --keyword "<kw>"           # scaffold a blog draft (+ledger)
npm run new:service -- --service <slug> --city <slug>  # scaffold a service override (+ledger)
npm run seo:audit                                 # on-page checklist (source + built HTML)
npm run build                                     # static build -> dist/ (+ sitemap)
```

## Skills (preferred entry points)
- **/blog** — full blog pipeline from a keyword. See `.claude/skills/blog`.
- **/service** — full service-page pipeline. See `.claude/skills/service`.
Prefer these over running steps by hand; they encode the whole flow.

## On-page SEO checklist (enforced by `scripts/seo-audit.ts`)
Primary keyword in first 100 words · exactly one H1 · 4+ H2s · 4–8 FAQs (FAQPage
schema) · 3–5 internal links · 2–3 external links · meta title ≤60 · meta
description 150–160 · keyword cluster · every image has alt · canonical + OG +
JSON-LD present. Run the audit and clear all ❌ before flipping `draft:false`.

## Technical SEO (already wired)
- `@astrojs/sitemap` builds `sitemap-index.xml` at build (submit to Search Console).
- `public/robots.txt` allows all + points to the sitemap (update the host!).
- JSON-LD: LocalBusiness (site-wide) + Article/Service/FAQPage/Breadcrumb per page.
- GA4 + Google Search Console verification: set IDs/token in `src/site.config.ts`.

## Deploy
GitHub → Vercel (framework preset: **Astro**, output `dist`). After deploy:
set `PUBLIC_SITE_URL`, update `robots.txt` host, submit sitemap in Search
Console, request indexing for new pages, set up Google Business Profile + GA4.
See `README.md` → Deployment.
