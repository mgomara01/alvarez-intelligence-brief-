/**
 * Small SEO helpers shared by layouts. The heavy on-page validation lives in
 * scripts/seo-audit.ts (run against built HTML); these are render-time utils.
 */
import { SITE } from '../site.config';

/** Build an absolute, canonical URL from a path. */
export function canonical(path: string): string {
  const clean = path.startsWith('/') ? path : `/${path}`;
  return `${SITE.url}${clean === '/' ? '' : clean.replace(/\/$/, '')}`;
}

/** Absolute URL for an OG image (accepts relative or absolute input). */
export function ogImageUrl(image?: string): string {
  if (!image) return `${SITE.url}${SITE.defaultOgImage}`;
  if (image.startsWith('http')) return image;
  return `${SITE.url}${image.startsWith('/') ? image : `/${image}`}`;
}

/** Truncate a description to a safe meta length without cutting mid-word. */
export function clampDescription(text: string, max = 160): string {
  if (text.length <= max) return text;
  const cut = text.slice(0, max);
  return `${cut.slice(0, cut.lastIndexOf(' '))}…`;
}

/**
 * Compose a title. Keeps brand suffix unless the page title already long
 * enough that adding it would blow past ~60 chars (Google truncation point).
 */
export function composeTitle(pageTitle: string, withBrand = true): string {
  if (!withBrand) return pageTitle;
  const suffix = ` | ${SITE.name}`;
  if (pageTitle.length + suffix.length > 60) return pageTitle;
  return `${pageTitle}${suffix}`;
}
