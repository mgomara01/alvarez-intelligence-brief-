/**
 * Default copy generators for service pages. Hand-written markdown overrides in
 * src/content/services/ always win; these are the sensible fallback so every
 * service x city page ships with real, non-empty, SEO-complete content.
 */
import type { Service, ServiceArea } from '../site.config';
import { SITE, BUSINESS } from '../site.config';

/** Money-keyword H1: "Emergency HVAC Repair in Toronto, ON". */
export function serviceH1(service: Service, area?: ServiceArea): string {
  return area ? `${service.name} in ${area.city}, ${area.region}` : service.name;
}

/** Meta title kept under ~60 chars; the " | suffix" is dropped when it wouldn't fit. */
export function serviceMetaTitle(service: Service, area?: ServiceArea): string {
  const base = area ? `${service.name} ${area.city}` : service.name;
  const suffix = area ? ' | Fast & Upfront' : ' | Licensed & Insured';
  return (base + suffix).length <= 60 ? base + suffix : base;
}

export function serviceMetaDescription(service: Service, area?: ServiceArea): string {
  const where = area ? `${area.city}, ${area.region}` : 'your area';
  // Kept short so even long service names + city stay within ~155 chars.
  return `Need ${service.name.toLowerCase()} in ${where}? Upfront flat-rate pricing, ${BUSINESS.yearsInBusiness}+ years, licensed & insured. Call ${BUSINESS.phoneDisplay}.`;
}

/** 4 default FAQs (meets the on-page "4-8 questions" rule + FAQPage schema). */
export function defaultServiceFaqs(
  service: Service,
  area?: ServiceArea
): Array<{ question: string; answer: string }> {
  const where = area ? `${area.city} and nearby` : 'the areas we serve';
  const svc = service.name.toLowerCase();
  return [
    {
      question: `How fast can you come out for ${svc} in ${area?.city ?? 'my area'}?`,
      answer: `For urgent issues we offer same-day service across ${where}, and our emergency line is open 24/7. Call ${BUSINESS.phoneDisplay} and we'll give you a real arrival window.`,
    },
    {
      question: `How much does ${svc} cost?`,
      answer: `We quote ${svc} flat-rate and upfront — you approve the price before any work starts. Cost depends on the specific issue, so the honest answer is: we diagnose it first, then tell you the number, with no surprises after.`,
    },
    {
      question: `Are you licensed and insured?`,
      answer: `Yes. ${SITE.name} is fully licensed and insured for both residential and commercial ${service.category.toUpperCase()} work, and every technician is background-checked and trained.`,
    },
    {
      question: `Do you handle commercial jobs too?`,
      answer:
        service.segment === 'commercial'
          ? `Commercial is our specialty for this service — we handle everything from single units to multi-site contracts.`
          : `Yes — alongside homes, we serve property managers, retail, restaurants, and offices. Ask about preventive maintenance plans.`,
    },
  ];
}
