/**
 * fetch-images.ts — pull royalty-free images from Pexels for a blog/service page.
 *
 * Needs PEXELS_API_KEY in .env. Without it, the script exits cleanly and tells
 * the generators to use a local placeholder instead (so builds never break).
 *
 * Usage:
 *   npm run img:fetch -- "low water pressure plumbing" --count 2 --slug plumber-for-low-water-pressure
 *
 * Saves images to src/assets/pexels/<slug>/ and prints JSON metadata (path +
 * required Pexels attribution) that the generator embeds in frontmatter.
 */
import { mkdirSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { ROOT, loadEnv } from './lib/env';

loadEnv();

interface PexelsPhoto {
  id: number;
  alt: string;
  photographer: string;
  photographer_url: string;
  src: { large2x: string; large: string; original: string };
}

function parseArgs(argv: string[]) {
  const args: Record<string, string> = {};
  const positional: string[] = [];
  for (let i = 0; i < argv.length; i++) {
    if (argv[i].startsWith('--')) (args[argv[i].slice(2)] = argv[i + 1]), i++;
    else positional.push(argv[i]);
  }
  return { args, positional };
}

async function main() {
  const { args, positional } = parseArgs(process.argv.slice(2));
  const query = positional.join(' ').trim();
  const count = Number(args.count ?? 2);
  const slug = args.slug ?? query.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

  if (!query) {
    console.error('Usage: npm run img:fetch -- "<query>" --count 2 --slug <slug>');
    process.exit(1);
  }

  const key = process.env.PEXELS_API_KEY;
  if (!key) {
    console.log(JSON.stringify({ ok: false, reason: 'no_pexels_key', images: [] }));
    console.error('⚠  No PEXELS_API_KEY in .env — generator will use a placeholder image.');
    return;
  }

  const url = `https://api.pexels.com/v1/search?query=${encodeURIComponent(query)}&per_page=${count}&orientation=landscape`;
  const res = await fetch(url, { headers: { Authorization: key } });
  if (!res.ok) {
    console.error(`Pexels API error ${res.status}: ${await res.text()}`);
    process.exit(1);
  }
  const data = (await res.json()) as { photos: PexelsPhoto[] };

  const dir = resolve(ROOT, 'src', 'assets', 'pexels', slug);
  mkdirSync(dir, { recursive: true });

  const images = [];
  for (const [i, photo] of data.photos.entries()) {
    const imgRes = await fetch(photo.src.large2x);
    const buf = Buffer.from(await imgRes.arrayBuffer());
    const filename = `${slug}-${i + 1}.jpg`;
    writeFileSync(resolve(dir, filename), buf);
    images.push({
      // Path is relative to the blog markdown file (src/content/blog/...).
      relPath: `../../assets/pexels/${slug}/${filename}`,
      alt: photo.alt || query,
      credit: `Photo by ${photo.photographer} on Pexels`,
      creditUrl: photo.photographer_url,
    });
    console.error(`   ✓ saved ${filename}  (${photo.alt || query})`);
  }

  // Machine-readable result on stdout for the generator/skill to consume.
  console.log(JSON.stringify({ ok: true, slug, images }, null, 2));
}

main().catch((e) => { console.error(e); process.exit(1); });
