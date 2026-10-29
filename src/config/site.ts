/**
 * Single source of truth for brand and contact details.
 * Replace the placeholder NAP data before going live; it feeds the
 * header, footer, JSON-LD and llms.txt.
 */
export const site = {
  name: 'Wensum Black',
  legalName: 'Wensum Black Ltd',
  tagline: 'Private drivers and secure courier. Norwich to anywhere in the UK.',
  description:
    'Discreet executive chauffeur, airport transfer and secure courier service from Norwich to every UK city, airport and port. Fixed prices, vetted drivers, 24/7.',
  phone: '+44 1603 000000',
  phoneDisplay: '01603 000 000',
  whatsapp: '441603000000',
  email: 'dispatch@wensumblack.co.uk',
  address: {
    street: 'Tombland',
    locality: 'Norwich',
    region: 'Norfolk',
    postcode: 'NR3 1HF',
    country: 'GB',
  },
  geo: { lat: 52.6305, lon: 1.2993 },
  hours: 'Mo-Su 00:00-23:59',
  founded: '2026',
  /** GA4 measurement ID. Analytics only loads after the visitor consents. */
  ga4Id: 'G-XXXXXXXXXX',
  social: [] as string[],
  locale: 'en_GB',
} as const;

/** Norwich city centre: origin of every route. */
export const ORIGIN = { name: 'Norwich', lat: 52.6286, lon: 1.2924 } as const;
