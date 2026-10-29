import type { APIRoute } from 'astro';
import { site } from '../config/site';
import { vehicles, pricing } from '../config/pricing';
import { allRoutes, REGION_ORDER } from '../lib/routes';
import { services } from '../data/services';
import { gbp } from '../lib/price';

/** llms.txt: a plain summary for answer engines (https://llmstxt.org). */
export const GET: APIRoute = ({ site: s }) => {
  const base = (s?.toString() ?? '').replace(/\/$/, '');
  const routes = allRoutes();
  const lines = [
    `# ${site.name}`,
    '',
    `> ${site.description}`,
    '',
    `${site.legalName} is a licensed private hire operator at ${site.address.street}, ${site.address.locality} ${site.address.postcode}, United Kingdom. Phone ${site.phoneDisplay}, email ${site.email}. Dispatch is open 24 hours, every day.`,
    '',
    '## Pricing',
    '',
    ...vehicles.map((v) => `- ${v.name} (${v.model}): £${v.perMile.toFixed(2)} per road mile${v.seats ? `, ${v.seats} passengers, ${v.bags} large cases` : ''}`),
    `- Minimum fare ${gbp(pricing.minimumFare)}. Night pickups (22:00 to 06:00) +${Math.round((pricing.nightMultiplier - 1) * 100)}%. Return leg ${Math.round(pricing.returnDiscount * 100)}% off. Waiting £${pricing.waitingPerHour}/hour after ${pricing.freeWaitingMinutes} free minutes (${pricing.airportFreeWaitingMinutes} at airports).`,
    '- Fares include fuel and tolls and are fixed in writing at booking.',
    '',
    '## Services',
    '',
    ...services.map((x) => `- [${x.name}](${base}/services/${x.slug}): ${x.description}`),
    '',
    '## Routes from Norwich',
    '',
    `Full data for every route: ${base}/llms-full.txt`,
    '',
    ...REGION_ORDER.flatMap((g) => {
      const rs = routes.filter((r) => r.d.region === g);
      return rs.length ? [`### ${g}`, '', ...rs.map((r) => `- [Norwich to ${r.d.name}](${base}/routes/${r.d.slug}): ${r.miles} mi, ${r.duration}, executive from ${gbp(r.from)}`), ''] : [];
    }),
    '## Pages',
    '',
    `- [Book or request a quote](${base}/contact)`,
    `- [Fleet](${base}/fleet)`,
    `- [The Terms (about)](${base}/about)`,
    `- [Terms of carriage](${base}/terms)`,
    '',
  ];
  return new Response(lines.join('\n'), { headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
};
