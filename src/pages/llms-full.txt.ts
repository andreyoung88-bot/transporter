import type { APIRoute } from 'astro';
import { site } from '../config/site';
import { allRoutes } from '../lib/routes';
import { gbp } from '../lib/price';

/** Every route in full: facts, prices and answers, in plain text. */
export const GET: APIRoute = ({ site: s }) => {
  const base = (s?.toString() ?? '').replace(/\/$/, '');
  const out: string[] = [`# ${site.name}: every route from Norwich`, '', `> ${site.description}`, ''];
  for (const r of allRoutes()) {
    out.push(
      `## Norwich to ${r.d.name}`,
      '',
      `URL: ${base}/routes/${r.d.slug}`,
      `Type: ${r.d.type}. Region: ${r.d.region}. Distance: ${r.miles} road miles. Drive time: ${r.duration}. Roads: ${r.d.roads.join(', ')}.${r.d.ferry ? ` Ferry: ${r.d.ferry}.` : ''}`,
      `Prices, one way: ${r.prices.map((p) => `${p.name} from ${gbp(p.low)}`).join('; ')}.`,
      '',
      r.answer,
      '',
      r.d.blurb,
      '',
      ...r.faqs.flatMap((f) => [`Q: ${f.q}`, `A: ${f.a}`, '']),
    );
  }
  return new Response(out.join('\n'), { headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
};
