import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

/**
 * The frontmatter schema IS part of the SEO system: required fields here mean a
 * post literally cannot build without a primary keyword, a meta title within
 * length, a description, and an image. Garbage-in is rejected at build time.
 */
const seoFields = {
  /** The single primary keyword this page targets. */
  primaryKeyword: z.string().min(2),
  /** Secondary/tertiary keywords in the cluster (the video's "keyword cluster"). */
  keywordCluster: z.array(z.string()).default([]),
  /** <title> — keep ~50-60 chars. Falls back to title if omitted. */
  metaTitle: z.string().max(70).optional(),
  /** <meta name="description"> — keep ~150-160 chars. */
  metaDescription: z.string().min(50).max(170),
  /** Override canonical if this content is syndicated. */
  canonical: z.string().url().optional(),
  /** Set true to exclude from sitemap + add noindex (drafts). */
  draft: z.boolean().default(false),
};

const blog = defineCollection({
  loader: glob({ pattern: '**/*.{md,mdx}', base: './src/content/blog' }),
  schema: ({ image }) =>
    z.object({
      title: z.string(),
      description: z.string(),
      pubDate: z.coerce.date(),
      updatedDate: z.coerce.date().optional(),
      author: z.string().default('Northwind Team'),
      heroImage: image().optional(),
      heroImageAlt: z.string().default(''),
      heroImageCredit: z.string().optional(),
      tags: z.array(z.string()).default([]),
      /** FAQ block -> FAQPage schema. Video requires 4-8 questions. */
      faqs: z
        .array(z.object({ question: z.string(), answer: z.string() }))
        .default([]),
      ...seoFields,
    }),
});

/**
 * Optional per-page content overrides for service x city landing pages.
 * The pages render even without a file here (using site.config defaults), but
 * dropping a markdown file lets you hand-tune the highest-value combos.
 */
const services = defineCollection({
  loader: glob({ pattern: '**/*.{md,mdx}', base: './src/content/services' }),
  schema: ({ image }) =>
    z.object({
      /** Must match a service slug in site.config.ts. */
      serviceSlug: z.string(),
      /** Must match a service-area slug, or omit for the non-localized page. */
      areaSlug: z.string().optional(),
      heroImage: image().optional(),
      heroImageAlt: z.string().default(''),
      faqs: z
        .array(z.object({ question: z.string(), answer: z.string() }))
        .default([]),
      ...seoFields,
    }),
});

export const collections = { blog, services };
