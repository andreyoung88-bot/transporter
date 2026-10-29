import { site } from '../config/site';

export const abs = (base: URL | string, path = '/') => new URL(path, base).toString().replace(/\/$/, '') || String(base);

export function organization(base: string) {
  const id = `${base}/#business`;
  return {
    '@type': ['LocalBusiness', 'TaxiService'],
    '@id': id,
    name: site.name,
    legalName: site.legalName,
    description: site.description,
    url: base + '/',
    telephone: site.phone,
    email: site.email,
    image: `${base}/og/default.jpg`,
    logo: `${base}/favicon.svg`,
    priceRange: '££',
    foundingDate: site.founded,
    address: {
      '@type': 'PostalAddress',
      streetAddress: site.address.street,
      addressLocality: site.address.locality,
      addressRegion: site.address.region,
      postalCode: site.address.postcode,
      addressCountry: site.address.country,
    },
    geo: { '@type': 'GeoCoordinates', latitude: site.geo.lat, longitude: site.geo.lon },
    openingHoursSpecification: {
      '@type': 'OpeningHoursSpecification',
      dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
      opens: '00:00',
      closes: '23:59',
    },
    areaServed: { '@type': 'Country', name: 'United Kingdom' },
    ...(site.social.length ? { sameAs: site.social } : {}),
  };
}

export function website(base: string) {
  return { '@type': 'WebSite', '@id': `${base}/#website`, url: base + '/', name: site.name, inLanguage: 'en-GB', publisher: { '@id': `${base}/#business` } };
}

export function breadcrumbs(base: string, items: { name: string; path: string }[]) {
  return {
    '@type': 'BreadcrumbList',
    itemListElement: items.map((it, i) => ({ '@type': 'ListItem', position: i + 1, name: it.name, item: base + it.path })),
  };
}

export function faq(items: { q: string; a: string }[]) {
  return {
    '@type': 'FAQPage',
    mainEntity: items.map((it) => ({ '@type': 'Question', name: it.q, acceptedAnswer: { '@type': 'Answer', text: it.a } })),
  };
}

export function routeService(base: string, o: { path: string; name: string; description: string; destination: string; low: number; high: number }) {
  return {
    '@type': 'Service',
    '@id': `${base}${o.path}#service`,
    name: o.name,
    description: o.description,
    serviceType: 'Private hire chauffeur and secure courier',
    provider: { '@id': `${base}/#business` },
    areaServed: [{ '@type': 'City', name: 'Norwich' }, { '@type': 'Place', name: o.destination }],
    offers: {
      '@type': 'AggregateOffer',
      priceCurrency: 'GBP',
      lowPrice: o.low,
      highPrice: o.high,
      availability: 'https://schema.org/InStock',
      url: base + o.path,
    },
  };
}

export const graph = (...nodes: object[]) => JSON.stringify({ '@context': 'https://schema.org', '@graph': nodes });
