/**
 * ============================================================================
 *  SINGLE SOURCE OF TRUTH for the whole site.
 * ============================================================================
 *  Edit THIS file to change the business. Pages, schema (JSON-LD), the
 *  service x city "zipper", sitemap, meta tags, and the lead form all read here.
 *
 *  Configured for Alvarez Plumbing & Air Conditioning (Tampa, FL).
 * ============================================================================
 */

export interface ServiceArea {
  /** City / municipality name as customers search it, e.g. "Tampa". */
  city: string;
  /** State/province abbreviation, e.g. "FL". */
  region: string;
  /** Lowercase, hyphenated slug used in URLs, e.g. "tampa". */
  slug: string;
}

export interface Service {
  /** Display name, e.g. "AC Repair & HVAC Service". */
  name: string;
  /** URL slug, e.g. "ac-repair". */
  slug: string;
  /** "hvac" | "plumbing" — used for grouping + schema. */
  category: 'hvac' | 'plumbing';
  /** "residential" | "commercial" | "both". */
  segment: 'residential' | 'commercial' | 'both';
  /** One-line summary used in cards, meta descriptions, and hero copy. */
  blurb: string;
  /** Whether to generate one landing page per service-area (the "zipper"). */
  localize: boolean;
}

export const SITE = {
  /** Brand name shown in header, footer, schema, titles. */
  name: 'Alvarez Plumbing & Air Conditioning',
  /** Short tagline for the homepage hero. */
  tagline: 'Tampa Bay plumbing and air conditioning, done right since day one.',
  /** Canonical URL (no trailing slash). Override with PUBLIC_SITE_URL in .env. */
  url: (import.meta.env?.PUBLIC_SITE_URL ?? process.env.PUBLIC_SITE_URL ?? 'https://www.alvarezplumbing.com').replace(/\/$/, ''),
  /** Default social/OG share image, relative to /public. */
  defaultOgImage: '/images/og-default.jpg',
  /** Default meta description (homepage / fallback). */
  description:
    'Licensed plumbing and air conditioning for homes and businesses across Tampa Bay. Repairs, installations, backflow testing, and water treatment — fast, upfront, and done right.',
  /** ISO language for <html lang>. */
  locale: 'en',
  /** Google Search Console HTML verification token (the content="..." value). */
  googleSiteVerification: '',
  /** Google Analytics 4 measurement ID, e.g. "G-XXXXXXXXXX". Empty = disabled. */
  ga4MeasurementId: '',
} as const;

export const BUSINESS = {
  legalName: 'Alvarez Plumbing Co.',
  /** "doing business as" — shown in schema as an alternate name. */
  dba: 'Alvarez Plumbing and Air Conditioning',
  phone: '+1-813-655-7520',
  phoneDisplay: '(813) 655-7520',
  email: 'm.omara@alvarezplumbing.com',
  /** Physical address — powers LocalBusiness schema + footer NAP. */
  address: {
    street: '1623 51st St',
    city: 'Tampa',
    region: 'FL',
    postalCode: '33619',
    country: 'US',
  },
  /** Geo coordinates for LocalBusiness schema. TODO: verify exact lat/lng. */
  geo: { lat: 27.9626, lng: -82.3982 },
  /** Hours in schema.org openingHours shorthand. TODO: set your real hours. */
  hours: ['Mo-Fr 08:00-17:00'],
  /** 24/7 emergency availability copy used across service pages. */
  emergencyLine: '24/7 emergency service available',
  /**
   * Trust stats — real, confirmed figures for Alvarez. When set, they appear in
   * copy + structured data automatically; when blank/0, they're hidden.
   */
  yearsInBusiness: 0,        // derived from foundedYear below; leave 0
  foundedYear: '1976',       // shows as "Serving Tampa Bay since 1976"
  rating: 4.8,               // real Google rating
  reviewCount: 2661,         // real Google review count
  /** Last-year operational figures (labeled as such in copy, not all-time). */
  jobsLastYear: '15,550',
  hoursLastYear: '27,150',
  socials: {
    facebook: '',
    instagram: '',
    linkedin: '',
    google: '',
  },
} as const;

/**
 * SERVICES — one side of the "zipper".
 * Set localize:true to generate a page per service-area (service x city).
 * Be tasteful: keep it to services you actually want to rank for.
 */
export const SERVICES: Service[] = [
  {
    name: 'Plumbing Repair & Service',
    slug: 'plumbing-services',
    category: 'plumbing',
    segment: 'both',
    blurb: 'Leaks, drains, water heaters, and repipes for homes and businesses across Tampa Bay.',
    localize: true,
  },
  {
    name: 'Commercial Plumbing & Projects',
    slug: 'commercial-plumbing',
    category: 'plumbing',
    segment: 'commercial',
    blurb: 'Plumbing for restaurants, offices, and multi-unit properties — built to code, on schedule.',
    localize: true,
  },
  {
    name: 'Backflow Preventer Testing & Service',
    slug: 'backflow-testing',
    category: 'plumbing',
    segment: 'both',
    blurb: 'Certified backflow testing, repair, and the annual reporting your county requires.',
    localize: true,
  },
  {
    name: 'Water Optimization & Filtration',
    slug: 'water-optimization',
    category: 'plumbing',
    segment: 'both',
    blurb: "Whole-home filtration and softening built for Florida's hard water.",
    localize: true,
  },
  {
    name: 'Plumbing Light Construction',
    slug: 'plumbing-light-construction',
    category: 'plumbing',
    segment: 'commercial',
    blurb: 'Tenant build-outs, remodels, and new-fixture rough-ins done clean and to code.',
    localize: false,
  },
  {
    name: 'AC Repair & HVAC Service',
    slug: 'ac-repair',
    category: 'hvac',
    segment: 'both',
    blurb: "Fast AC repair and HVAC service for when the Florida heat won't quit.",
    localize: true,
  },
  {
    name: 'AC & HVAC Installation',
    slug: 'hvac-installation',
    category: 'hvac',
    segment: 'both',
    blurb: 'Right-sized, high-efficiency AC and HVAC systems, installed clean.',
    localize: true,
  },
];

/**
 * SERVICE AREAS — the other side of the "zipper" (Greater Tampa Bay / Tampa MSA).
 * The localized landing pages are: /services/{service}/{city}.
 */
export const SERVICE_AREAS: ServiceArea[] = [
  { city: 'Tampa', region: 'FL', slug: 'tampa' },
  { city: 'St. Petersburg', region: 'FL', slug: 'st-petersburg' },
  { city: 'Clearwater', region: 'FL', slug: 'clearwater' },
  { city: 'Brandon', region: 'FL', slug: 'brandon' },
  { city: 'Riverview', region: 'FL', slug: 'riverview' },
  { city: 'Wesley Chapel', region: 'FL', slug: 'wesley-chapel' },
];

/** Primary nav. */
export const NAV = [
  { label: 'Services', href: '/services' },
  { label: 'Blog', href: '/blog' },
  { label: 'About', href: '/#about' },
  { label: 'Contact', href: '/#contact' },
] as const;

/** Helper: every localized service x city combination (the zipped pairs). */
export function getLocalizedPairs(): Array<{ service: Service; area: ServiceArea }> {
  const pairs: Array<{ service: Service; area: ServiceArea }> = [];
  for (const service of SERVICES) {
    if (!service.localize) continue;
    for (const area of SERVICE_AREAS) {
      pairs.push({ service, area });
    }
  }
  return pairs;
}

/** Helper: the first localized service (used for footer city links). */
export function firstLocalizedService(): Service {
  return SERVICES.find((s) => s.localize) ?? SERVICES[0];
}
