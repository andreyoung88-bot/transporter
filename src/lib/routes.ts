import { destinations, type Destination, type Region } from '../data/destinations';
import { ORIGIN } from '../config/site';
import { vehicles, pricing } from '../config/pricing';
import { modelRoadMiles, driveMinutes, formatDuration, haversineMiles, bearing, compass } from './geo';
import { estimate, gbp } from './price';

export interface RouteInfo {
  d: Destination;
  miles: number;
  minutes: number;
  duration: string;
  direction: string;
  prices: { id: string; name: string; total: number; low: number; high: number }[];
  from: number;
  courierFrom: number;
  nearby: Destination[];
  answer: string;
  faqs: { q: string; a: string }[];
  title: string;
  description: string;
  h1: string;
}

/** Trust the researched road distance unless it disagrees wildly with the geometry. */
export function roadMiles(d: Destination): number {
  const model = modelRoadMiles(d);
  if (!d.roadMiles) return Math.round(model);
  const ratio = d.roadMiles / model;
  return Math.round(ratio > 0.75 && ratio < 1.3 ? d.roadMiles : model);
}

/** Small stable hash, so copy variants are fixed per page between builds. */
const pick = <T,>(slug: string, salt: number, arr: T[]): T => {
  let h = salt;
  for (const c of slug) h = (h * 31 + c.charCodeAt(0)) >>> 0;
  return arr[h % arr.length];
};

const list = (xs: string[]) => (xs.length < 2 ? xs.join('') : `${xs.slice(0, -1).join(', ')} and ${xs[xs.length - 1]}`);

export function routeInfo(d: Destination): RouteInfo {
  const miles = roadMiles(d);
  const minutes = driveMinutes(miles, { london: d.region === 'London', ferry: d.ferry });
  const duration = formatDuration(minutes);
  const airport = d.type === 'airport';
  const prices = vehicles.map((v) => {
    const q = estimate({ miles, vehicle: v.id, ferry: d.ferry, airport });
    return { id: v.id, name: v.name, total: q.total, low: q.low, high: q.high };
  });
  const exec = prices.find((p) => p.id === 'executive')!;
  const courier = prices.find((p) => p.id === 'courier')!;
  const direction = compass(bearing(ORIGIN, d));
  const roads = d.roads.join(', ');
  const via = d.ferry ? `the ${roads} and the ${d.ferry} crossing` : `the ${roads}`;
  const wait = airport ? `${pricing.airportFreeWaitingMinutes} minutes of free waiting after landing` : `${pricing.freeWaitingMinutes} minutes of free waiting`;

  const nearby = destinations
    .filter((x) => x.slug !== d.slug)
    .map((x) => ({ x, km: haversineMiles(d, x) }))
    .sort((a, b) => a.km - b.km)
    .slice(0, 6)
    .map((n) => n.x);

  const answer = pick(d.slug, 7, [
    `A private executive car from Norwich to ${d.name} costs from ${gbp(exec.low)} one way. The ${miles}-mile run takes about ${duration} via ${via}. Secure same-day courier starts at ${gbp(courier.low)}. Every quote is fixed at booking and includes fuel, tolls and ${wait}.`,
    `Expect to pay from ${gbp(exec.low)} for an executive saloon from Norwich to ${d.name}, about ${miles} miles and ${duration} on ${via}. A same-day secure courier on the same route is from ${gbp(courier.low)}. The price you are quoted is the price you pay, with fuel, tolls and ${wait} included.`,
    `Norwich to ${d.name} is roughly ${miles} road miles, or ${duration} door to door by ${via}. Our executive saloon fare starts at ${gbp(exec.low)}, and hand-to-hand courier from ${gbp(courier.low)}. Fares are fixed once booked, with fuel, tolls and ${wait} built in.`,
  ]);

  const typeQ: Record<Destination['type'], { q: string; a: string }> = {
    airport: {
      q: `What happens if my flight into ${d.name} is delayed?`,
      a: `We track your flight number live and adjust the pickup to the actual landing time at no charge. Your driver waits in arrivals with a name board, and the first ${pricing.airportFreeWaitingMinutes} minutes after landing are free. Departures are planned with a buffer for check-in and security.`,
    },
    port: {
      q: `Is there room for cruise or ferry luggage to ${d.name}?`,
      a: `An executive saloon takes two large cases. For cruise luggage or a group, book the Executive MPV: seven seats and room for six large cases. We time arrival to your check-in window, not just the sailing time.`,
    },
    city: {
      q: `Can the driver wait in ${d.name} and bring me back to Norwich?`,
      a: `Yes. Book it as a return and the return leg is ${Math.round(pricing.returnDiscount * 100)}% cheaper. Waiting is free for the first ${pricing.freeWaitingMinutes} minutes, then ${gbp(pricing.waitingPerHour)} an hour, so a day of meetings in ${d.name} is usually cheaper as a wait-and-return than as two singles.`,
    },
    town: {
      q: `Can the driver wait in ${d.name} and bring me back to Norwich?`,
      a: `Yes. Book it as a return and the return leg is ${Math.round(pricing.returnDiscount * 100)}% cheaper. The first ${pricing.freeWaitingMinutes} minutes of waiting are free, then ${gbp(pricing.waitingPerHour)} an hour.`,
    },
  };

  const faqs = [
    {
      q: `How much is a private driver from Norwich to ${d.name}?`,
      a: `${list(prices.filter((p) => p.id !== 'courier').map((p) => `${p.name} from ${gbp(p.low)}`))}, one way. Night journeys between 22:00 and 06:00 add ${Math.round((pricing.nightMultiplier - 1) * 100)}%. The fare is fixed when you book and includes fuel and tolls.`,
    },
    {
      q: `How long does it take to drive from Norwich to ${d.name}?`,
      a: `Allow about ${duration} for the ${miles} miles, heading ${direction} on ${via}. That figure includes a margin for traffic${minutes > 270 ? ' and a rest break, which we take on any run over four and a half hours' : ''}. Your driver monitors traffic live and reroutes if needed.`,
    },
    {
      q: `Can you courier documents or valuables from Norwich to ${d.name} today?`,
      a: `Yes. A dedicated secure courier from Norwich to ${d.name} is from ${gbp(courier.low)}, collected within about 60 minutes in Norwich and driven straight there with no other drops. Live tracking, signature on delivery and photo proof are standard.`,
    },
    typeQ[d.type],
    {
      q: 'Is the quoted price fixed?',
      a: 'Yes. The estimate on this page is a guide. When you book we confirm a fixed fare in writing, and it does not change for traffic or diversions. Only extra stops or extra waiting you ask for are added.',
    },
  ];

  const h1 = airport ? `Norwich to ${d.name} transfers` : d.type === 'port' ? `Norwich to ${d.name}` : `Norwich to ${d.name} private driver`;
  const title = airport
    ? `Norwich to ${d.name} Transfer: from ${gbp(exec.low)}, Fixed Price`
    : `Norwich to ${d.name} Chauffeur and Courier: from ${gbp(exec.low)}`;
  const description = `Private car from Norwich to ${d.name}: ${miles} miles, about ${duration}. Executive from ${gbp(exec.low)}, MPV and same-day secure courier. Fixed price, 24/7, vetted drivers.`;

  return { d, miles, minutes, duration, direction, prices, from: exec.low, courierFrom: courier.low, nearby, answer, faqs, title, description, h1 };
}

export const allRoutes = () => destinations.map(routeInfo);

export const REGION_ORDER: Region[] = [
  'East of England', 'London', 'South East', 'South West', 'East Midlands', 'West Midlands',
  'Yorkshire and the Humber', 'North West', 'North East', 'Wales', 'Scotland', 'Northern Ireland',
];

export const regionSlug = (r: string) => r.toLowerCase().replace(/[^a-z]+/g, '-');

/** One paragraph per region, used on hubs and route pages. */
export const REGION_NOTES: Record<Region, string> = {
  'East of England':
    'Our home ground. Most of these runs stay on the A11, A47 and A140, roads our drivers know down to the speed cameras. Short notice is normal here: an hour is usually enough.',
  London:
    'The A11 and M11 put central London about two and a half hours away. We plan around congestion-charge hours, and drivers use the quieter approaches through the north-east to reach the City, the West End and Canary Wharf.',
  'South East':
    'Most of the South East means the M11 and M25, so timing matters more than distance. We schedule Dartford and the western M25 around the peaks, and every quote includes the crossing charges.',
  'South West':
    'A long run, usually on the M25 and M4, or the A303 for Dorset and Devon. Over four and a half hours we build in a proper break, and for Cornwall we can stage the trip overnight.',
  'East Midlands':
    'Across country on the A47 and A1, or the A14 for Northamptonshire. These runs go round the motorway bottlenecks, which makes them some of the most predictable we drive.',
  'West Midlands':
    'The A14 to the M6, or the A47 and A1 for the north side of the region. Typical runs are Birmingham business days, NEC exhibitions and Birmingham Airport departures.',
  'Yorkshire and the Humber':
    'Up the A17 or the A1, with the Humber Bridge for Hull. Drivers know the quickest ways into Leeds and Sheffield city centres at rush hour.',
  'North West':
    'The A1 and M62 across the Pennines, or the A14 and M6. Manchester and Liverpool are long day trips. For the Lake District we can arrange an overnight driver stay.',
  'North East':
    'Straight up the A1(M). It is one of the cleanest long-distance runs in the country, so arrival times in Newcastle, Durham and Sunderland are reliable.',
  Wales:
    'The M4 for Cardiff and Swansea, the A5 and A55 for the north. Holyhead runs are timed to the Irish Sea sailings.',
  Scotland:
    'Our longest regular runs, usually up the A1 through Northumberland. Anything past Edinburgh is a planned operation with set break points, and two drivers are available for non-stop journeys.',
  'Northern Ireland':
    'We drive you and the car across. The Cairnryan to Belfast crossing is our usual route, and the vehicle fare is shown in the price. You stay in one car, with one driver, the whole way.',
};
