/**
 * new-service.ts — scaffold a hand-tuned override for a service x city page.
 *
 * The pages already render automatically from site.config.ts. This is only for
 * when you want to OVERRIDE a high-value combo with custom copy/FAQs (e.g. your
 * best money keyword). It writes src/content/services/<service>-<city>.md.
 *
 * Usage:
 *   npm run new:service -- --service emergency-plumber --city toronto
 *   npm run new:service -- --service drain-cleaning            (hub page, no city)
 */
import { writeFileSync, existsSync } from 'node:fs';
import { resolve } from 'node:path';
import { ROOT } from './lib/env';
import { addToLedger } from './lib/published';
import { SERVICES, SERVICE_AREAS } from '../src/site.config';

function parseArgs(argv: string[]) {
  const args: Record<string, string> = {};
  for (let i = 0; i < argv.length; i++) {
    if (argv[i].startsWith('--')) (args[argv[i].slice(2)] = argv[i + 1]), i++;
  }
  return args;
}

const args = parseArgs(process.argv.slice(2));
const service = SERVICES.find((s) => s.slug === args.service);
if (!service) {
  console.error(`Unknown --service "${args.service}". Options: ${SERVICES.map((s) => s.slug).join(', ')}`);
  process.exit(1);
}
const area = args.city ? SERVICE_AREAS.find((a) => a.slug === args.city) : undefined;
if (args.city && !area) {
  console.error(`Unknown --city "${args.city}". Options: ${SERVICE_AREAS.map((a) => a.slug).join(', ')}`);
  process.exit(1);
}

const keyword = area ? `${service.name} ${area.city}` : service.name;
const fileSlug = area ? `${service.slug}-${area.slug}` : service.slug;
const filePath = resolve(ROOT, 'src', 'content', 'services', `${fileSlug}.md`);
if (existsSync(filePath)) { console.error(`File already exists: ${filePath}`); process.exit(1); }

const where = area ? `${area.city}, ${area.region}` : 'your area';
const today = new Date().toISOString().slice(0, 10);

const content = `---
serviceSlug: "${service.slug}"
${area ? `areaSlug: "${area.slug}"` : '# areaSlug omitted = the non-localized hub page'}
primaryKeyword: "${keyword.toLowerCase()}"
metaTitle: "${service.name}${area ? ` ${area.city}` : ''} | <hook>"
metaDescription: "Need ${service.name.toLowerCase()} in ${where}? <reason to call, 150-160 chars, primary keyword near the front>"
faqs:
  - question: "<money-page question, e.g. how fast can you come out?>"
    answer: "<reassuring, specific answer>"
  - question: "<how much does it cost?>"
    answer: "<flat-rate / upfront pricing answer>"
  - question: "<are you licensed/insured?>"
    answer: "<yes + trust details>"
  - question: "<do you do commercial too?>"
    answer: "<answer>"
---

Hook paragraph for ${service.name.toLowerCase()} in ${where} — lead with the benefit and the money keyword. Keep humor light here (3/10); these visitors are ready to buy.

## ${service.name} in ${where} — what we handle

- <bullet>
- <bullet>
- <bullet>

## Why ${where} customers choose us

- Upfront flat-rate pricing approved before work starts
- Licensed & insured, residential and commercial
- 24/7 emergency availability
`;

writeFileSync(filePath, content);
addToLedger({ keyword: keyword.toLowerCase(), slug: fileSlug, type: 'service', date: today });

console.log(`\n🧰 Created service override: src/content/services/${fileSlug}.md`);
console.log(`   page: /services/${service.slug}${area ? `/${area.slug}` : ''}`);
console.log(`   fill in the copy + FAQs, then run npm run seo:audit\n`);
