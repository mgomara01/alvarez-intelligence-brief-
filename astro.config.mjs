// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import { SITE } from './src/site.config.ts';

// Static Site Generation (SSG) is the whole point: Google gets fully-rendered
// HTML on the first request — no client-side rendering, no waiting for JS.
// `output: 'static'` is Astro's default; we set it explicitly so it can never
// silently regress to on-demand rendering.
export default defineConfig({
  site: SITE.url,
  output: 'static',
  trailingSlash: 'ignore',
  build: {
    inlineStylesheets: 'auto',
  },
  integrations: [
    // Auto-generates sitemap-index.xml + sitemap-0.xml at build time from every
    // static page. This is the file you submit to Google Search Console.
    sitemap({
      changefreq: 'weekly',
      priority: 0.7,
      lastmod: new Date(),
    }),
  ],
});
