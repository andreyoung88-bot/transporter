import { destinations } from '../src/data/destinations';
import { modelRoadMiles, haversineMiles } from '../src/lib/geo';
import { roadMiles } from '../src/lib/routes';
import { ORIGIN } from '../src/config/site';

const slugs = new Set<string>();
let bad = 0;
for (const d of destinations) {
  if (slugs.has(d.slug)) { console.log('DUP', d.slug); bad++; }
  slugs.add(d.slug);
  if (d.lat < 49.8 || d.lat > 60.9 || d.lon < -8.2 || d.lon > 1.8) { console.log('BOUNDS', d.slug, d.lat, d.lon); bad++; }
  const m = modelRoadMiles(d);
  const ratio = d.roadMiles / m;
  if (ratio < 0.8 || ratio > 1.25) console.log('MILES', d.slug.padEnd(28), 'given', d.roadMiles, 'model', Math.round(m), 'crow', Math.round(haversineMiles(ORIGIN, d)), 'used', roadMiles(d), d.ferry ?? '');
  const words = d.blurb.split(/\s+/).length;
  if (words < 35 || words > 90) console.log('BLURB', d.slug, words);
  if (/hidden gem|bustling|vibrant|nestled|something for everyone|!/i.test(d.blurb)) console.log('CLICHE', d.slug);
  if (d.region === 'Northern Ireland' && !d.ferry) console.log('NOFERRY', d.slug);
}
const byType = destinations.reduce((a, d) => ({ ...a, [d.type]: (a[d.type] ?? 0) + 1 }), {} as Record<string, number>);
const byRegion = destinations.reduce((a, d) => ({ ...a, [d.region]: (a[d.region] ?? 0) + 1 }), {} as Record<string, number>);
console.log('count', destinations.length, byType, byRegion, 'bad', bad);
// Spot checks against known coordinates (approx).
const known: Record<string, [number, number]> = { london: [51.507, -0.128], 'heathrow-airport': [51.47, -0.454], 'stansted-airport': [51.885, 0.235], edinburgh: [55.953, -3.188], cardiff: [51.481, -3.179], belfast: [54.597, -5.93], cambridge: [52.205, 0.119], 'port-of-dover': [51.126, 1.33], 'gatwick-airport': [51.153, -0.182], manchester: [53.48, -2.242], inverness: [57.478, -4.224], penzance: [50.118, -5.537], york: [53.96, -1.082], 'harwich-international-port': [51.947, 1.255], aberdeen: [57.149, -2.094] };
for (const [s, [la, lo]] of Object.entries(known)) {
  const d = destinations.find((x) => x.slug === s);
  if (!d) { console.log('MISSING known slug', s); continue; }
  const err = haversineMiles(d, { lat: la, lon: lo });
  console.log('spot', s.padEnd(28), err.toFixed(1), 'mi off', 'road', roadMiles(d));
}
