/**
 * JSON-LD (schema.org) builders. Structured data is one of the strongest
 * "I am a real, trustworthy local business" signals you can hand Google — and
 * it's what powers rich results (stars, FAQs, breadcrumbs) in the SERP.
 */
import { SITE, BUSINESS } from '../site.config';

type Json = Record<string, unknown>;

/** LocalBusiness — emit once site-wide (in the base layout). */
export function localBusinessSchema(): Json {
  return {
    '@context': 'https://schema.org',
    '@type': ['Plumber', 'HVACBusiness', 'LocalBusiness'],
    '@id': `${SITE.url}/#business`,
    name: SITE.name,
    legalName: BUSINESS.legalName,
    // dba surfaced as an alternate name so searches for either spelling match.
    alternateName: BUSINESS.dba || undefined,
    url: SITE.url,
    telephone: BUSINESS.phone,
    email: BUSINESS.email,
    image: `${SITE.url}${SITE.defaultOgImage}`,
    priceRange: '$$',
    foundingDate: BUSINESS.foundedYear || undefined,
    address: {
      '@type': 'PostalAddress',
      streetAddress: BUSINESS.address.street,
      addressLocality: BUSINESS.address.city,
      addressRegion: BUSINESS.address.region,
      postalCode: BUSINESS.address.postalCode,
      addressCountry: BUSINESS.address.country,
    },
    geo: {
      '@type': 'GeoCoordinates',
      latitude: BUSINESS.geo.lat,
      longitude: BUSINESS.geo.lng,
    },
    areaServed: { '@type': 'AdministrativeArea', name: 'Greater Tampa Bay, FL' },
    openingHours: BUSINESS.hours,
    // Only emit aggregateRating when real review data exists. Inventing it
    // violates Google's structured-data policy and risks a manual penalty.
    aggregateRating:
      BUSINESS.rating > 0 && BUSINESS.reviewCount > 0
        ? {
            '@type': 'AggregateRating',
            ratingValue: BUSINESS.rating,
            reviewCount: BUSINESS.reviewCount,
          }
        : undefined,
    sameAs: Object.values(BUSINESS.socials).filter(Boolean),
  };
}

/** Article — emit on each blog post. */
export function articleSchema(opts: {
  title: string;
  description: string;
  url: string;
  image?: string;
  datePublished: Date;
  dateModified?: Date;
  author: string;
}): Json {
  return {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: opts.title,
    description: opts.description,
    image: opts.image ? [opts.image] : undefined,
    datePublished: opts.datePublished.toISOString(),
    dateModified: (opts.dateModified ?? opts.datePublished).toISOString(),
    author: { '@type': 'Organization', name: opts.author, url: SITE.url },
    publisher: {
      '@type': 'Organization',
      name: SITE.name,
      logo: { '@type': 'ImageObject', url: `${SITE.url}/images/logo.png` },
    },
    mainEntityOfPage: { '@type': 'WebPage', '@id': opts.url },
  };
}

/** Service — emit on each service / service-area landing page. */
export function serviceSchema(opts: {
  serviceName: string;
  description: string;
  url: string;
  areaServed?: string;
}): Json {
  return {
    '@context': 'https://schema.org',
    '@type': 'Service',
    serviceType: opts.serviceName,
    description: opts.description,
    url: opts.url,
    provider: { '@id': `${SITE.url}/#business` },
    areaServed: opts.areaServed
      ? { '@type': 'City', name: opts.areaServed }
      : undefined,
  };
}

/** FAQPage — emit when a page has >= 2 FAQs (eligible for FAQ rich results). */
export function faqSchema(faqs: Array<{ question: string; answer: string }>): Json | null {
  if (!faqs || faqs.length < 2) return null;
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map((f) => ({
      '@type': 'Question',
      name: f.question,
      acceptedAnswer: { '@type': 'Answer', text: f.answer },
    })),
  };
}

/** BreadcrumbList — emit on nested pages for breadcrumb rich results. */
export function breadcrumbSchema(crumbs: Array<{ name: string; url: string }>): Json {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: crumbs.map((c, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: c.name,
      item: c.url,
    })),
  };
}

/** Strip undefined keys so JSON-LD stays clean. */
export function stringifyLd(obj: Json): string {
  return JSON.stringify(obj, (_k, v) => (v === undefined ? undefined : v));
}
