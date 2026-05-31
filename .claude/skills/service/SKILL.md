---
name: service
description: >-
  Generate an SEO-optimized, conversion-focused service (or service x city)
  landing page targeting a money keyword. Runs the masterclass service-page
  pipeline: pick the service + city, write upfront-pricing/trust copy in brand
  voice, enforce on-page SEO, and audit. Use when the user says "service page",
  "landing page", or "/service [service] [city]".
---

# /service — money-keyword landing page generator

You build **service landing pages** for **Northwind HVAC & Plumbing** (edit per
`src/site.config.ts`). These target transactional "service + city" keywords and
exist to convert visitors into leads via the form. Different goal from blogs:
**lower humor (3/10), higher trust + clarity + urgency.**

## Step 0 — Load the brand
Read `brand/voice.md`, `brand/stats.md`, `brand/stories.md`, `brand/opinions.md`.
Humor is a light touch here (`brand/humor.md` says 3/10 for money pages).

## Step 1 — Pick the target
- The service must be a slug in `SERVICES` (site.config.ts). The city must be a
  slug in `SERVICE_AREAS` (or omit for the non-localized hub page).
- For new money keywords, have the user export a SEMrush list sorted by CPC
  (the "service, city" patterns), then run
  `npm run kw:filter -- data/service-keywords.csv --intent commercial`.
- Be tasteful about volume: the video warns against thousands of thin pages.
  Only create combos you actually serve and want to rank for.

## Step 2 — Scaffold
Run `npm run new:service -- --service <slug> --city <slug>` (omit `--city` for the
hub page). This writes an override stub in `src/content/services/` and updates the
ledger. (Pages also render automatically from config even without an override —
only create overrides for combos worth hand-tuning.)

## Step 3 — Write the page
Replace the stub. Requirements:
- **One H1** with the money keyword (the layout renders it from `h1`/title — do
  not add an H1 in the markdown body; start at `##`).
- **Primary keyword early**, plus the city named naturally several times.
- Lead with the **benefit + reassurance** (fast arrival, upfront pricing, 24/7).
- Sections: what we handle, why choose us, our process, service area.
- Weave in a relevant **real story** from `stories.md` and **real stats**.
- **4 FAQs** answering money-page objections: how fast, how much, licensed?,
  commercial too? (answer-first, specific).
- `metaTitle` (~55 chars incl. city) and `metaDescription` (150-160 chars).
- 2-4 **internal links** to related services and a relevant blog post.

## Step 4 — Conversion
The page already includes the `LeadForm`. Make the copy push toward it:
clear CTA language, phone number prominent, urgency for emergencies. Remind the
user to set the real Formspree/endpoint in `src/components/LeadForm.astro` and to
A/B test landing-page variants (the video hit a 20% conversion rate by testing).

## Step 5 — Audit + finalize
Run `npm run seo:audit`, fix ❌ errors, then `npm run build` to confirm it
compiles. Report the page URL and what money keyword it targets.
