/**
 * ============================================================================
 *  SINGLE SOURCE OF TRUTH for the whole site.
 * ============================================================================
 *  Edit THIS file to make the site yours. Pages, schema (JSON-LD), the service
 *  x city "zipper", sitemap, meta tags, and the lead form all read from here.
 *
 *  Pre-filled for a residential + commercial HVAC & plumbing company. Replace
 *  the brand/contact/cities with your real data, then prune or add services.
 * ============================================================================
 */

export interface ServiceArea {
  /** City / municipality name as customers search it, e.g. "Toronto". */
  city: string;
  /** State/province abbreviation, e.g. "ON" or "TX". */
  region: string;
  /** Lowercase, hyphenated slug used in URLs, e.g. "toronto". */
  slug: string;
}

export interface Service {
  /** Display name, e.g. "Emergency HVAC Repair". */
  name: string;
  /** URL slug, e.g. "emergency-hvac-repair". */
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
  name: 'Northwind HVAC & Plumbing',
  /** Short tagline for the homepage hero. */
  tagline: 'Heating, cooling, and plumbing done right — homes and businesses.',
  /** Canonical URL (no trailing slash). Override with PUBLIC_SITE_URL in .env. */
  url: (import.meta.env?.PUBLIC_SITE_URL ?? process.env.PUBLIC_SITE_URL ?? 'https://example.com').replace(/\/$/, ''),
  /** Default social/OG share image, relative to /public. */
  defaultOgImage: '/images/og-default.jpg',
  /** Default meta description (homepage / fallback). */
  description:
    'Licensed HVAC and plumbing experts serving homes and businesses. Fast emergency service, upfront pricing, and work that actually lasts.',
  /** ISO language for <html lang>. */
  locale: 'en',
  /** Google Search Console HTML verification token (the content="..." value). */
  googleSiteVerification: '',
  /** Google Analytics 4 measurement ID, e.g. "G-XXXXXXXXXX". Empty = disabled. */
  ga4MeasurementId: '',
} as const;

export const BUSINESS = {
  legalName: 'Northwind Mechanical Services Inc.',
  phone: '+1-555-010-4357',
  phoneDisplay: '(555) 010-HELP',
  email: 'service@example.com',
  /** Physical address — powers LocalBusiness schema + footer NAP. */
  address: {
    street: '100 Industrial Pkwy',
    city: 'Toronto',
    region: 'ON',
    postalCode: 'M5V 2T6',
    country: 'CA',
  },
  /** Geo coordinates for LocalBusiness schema (helps local pack ranking). */
  geo: { lat: 43.6426, lng: -79.3871 },
  /** Hours in schema.org openingHours shorthand. */
  hours: ['Mo-Fr 07:00-19:00', 'Sa 08:00-16:00'],
  /** 24/7 emergency line copy used across service pages. */
  emergencyLine: '24/7 emergency service available',
  /** Trust stats — surface these in copy; the voice files expand on them. */
  yearsInBusiness: 18,
  jobsCompleted: '32,000+',
  rating: 4.9,
  reviewCount: 1180,
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
 * Be tasteful: the video warns against thousands of thin pages. Keep it to
 * the services you actually want to rank for, in the cities you actually serve.
 */
export const SERVICES: Service[] = [
  {
    name: 'Emergency HVAC Repair',
    slug: 'emergency-hvac-repair',
    category: 'hvac',
    segment: 'both',
    blurb: 'No heat or no AC? Same-day diagnosis and repair, any brand.',
    localize: true,
  },
  {
    name: 'Furnace Installation & Replacement',
    slug: 'furnace-installation',
    category: 'hvac',
    segment: 'residential',
    blurb: 'Right-sized, high-efficiency furnaces with honest load calculations.',
    localize: true,
  },
  {
    name: 'Air Conditioning Installation',
    slug: 'ac-installation',
    category: 'hvac',
    segment: 'residential',
    blurb: 'Quiet, efficient cooling sized for your home — not upsold.',
    localize: true,
  },
  {
    name: 'Commercial HVAC Service',
    slug: 'commercial-hvac',
    category: 'hvac',
    segment: 'commercial',
    blurb: 'Rooftop units, make-up air, and preventive maintenance contracts.',
    localize: true,
  },
  {
    name: 'Drain Cleaning & Hydro Jetting',
    slug: 'drain-cleaning',
    category: 'plumbing',
    segment: 'both',
    blurb: 'Clogs cleared fast, with a camera so you see the real problem.',
    localize: true,
  },
  {
    name: 'Water Heater Repair & Installation',
    slug: 'water-heater',
    category: 'plumbing',
    segment: 'both',
    blurb: 'Tank and tankless — repaired today or replaced right.',
    localize: true,
  },
  {
    name: 'Emergency Plumber',
    slug: 'emergency-plumber',
    category: 'plumbing',
    segment: 'both',
    blurb: 'Burst pipes and floods, 24/7. We answer the phone at 2am.',
    localize: true,
  },
  {
    name: 'Commercial Plumbing',
    slug: 'commercial-plumbing',
    category: 'plumbing',
    segment: 'commercial',
    blurb: 'Backflow, grease traps, and code work for businesses.',
    localize: true,
  },
];

/**
 * SERVICE AREAS — the other side of the "zipper".
 * The localized landing pages are: /services/{service}/{city}.
 */
export const SERVICE_AREAS: ServiceArea[] = [
  { city: 'Toronto', region: 'ON', slug: 'toronto' },
  { city: 'Mississauga', region: 'ON', slug: 'mississauga' },
  { city: 'Vaughan', region: 'ON', slug: 'vaughan' },
  { city: 'Markham', region: 'ON', slug: 'markham' },
  { city: 'Brampton', region: 'ON', slug: 'brampton' },
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
