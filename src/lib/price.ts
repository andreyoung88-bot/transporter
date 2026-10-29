import { pricing, vehicles, type VehicleClass } from '../config/pricing';

export interface QuoteInput {
  miles: number;
  vehicle: VehicleClass['id'];
  night?: boolean;
  returnTrip?: boolean;
  airport?: boolean;
  ferry?: string;
  waitingMinutes?: number;
}

export interface Quote {
  total: number;
  low: number;
  high: number;
  lines: { label: string; amount: number }[];
}

const round5 = (n: number) => Math.round(n / 5) * 5;

/** Pure and shared by the server-rendered pages and the browser estimator. */
export function estimate(q: QuoteInput): Quote {
  const v = vehicles.find((x) => x.id === q.vehicle) ?? vehicles[0];
  const lines: Quote['lines'] = [];

  let leg = Math.max(pricing.minimumFare, q.miles * v.perMile);
  if (q.night) leg *= pricing.nightMultiplier;
  lines.push({ label: `${v.name}, ${Math.round(q.miles)} mi${q.night ? ', night rate' : ''}`, amount: leg });

  let total = leg;
  if (q.ferry) {
    const f = pricing.ferryCrossing[q.ferry] ?? 0;
    lines.push({ label: `Ferry, ${q.ferry}`, amount: f });
    total += f;
  }
  if (q.airport && v.id !== 'courier') {
    lines.push({ label: 'Meet and greet', amount: pricing.airportMeetGreet });
    total += pricing.airportMeetGreet;
  }
  const billableWait = Math.max(0, (q.waitingMinutes ?? 0) - pricing.freeWaitingMinutes);
  if (billableWait > 0) {
    const w = (billableWait / 60) * pricing.waitingPerHour;
    lines.push({ label: `Waiting, ${billableWait} min`, amount: w });
    total += w;
  }
  if (q.returnTrip) {
    const back = total * (1 - pricing.returnDiscount);
    lines.push({ label: `Return leg, ${Math.round(pricing.returnDiscount * 100)}% off`, amount: back });
    total += back;
  }

  total = round5(total);
  return {
    total,
    low: round5(total * (1 - pricing.band)),
    high: round5(total * (1 + pricing.band)),
    lines: lines.map((l) => ({ ...l, amount: Math.round(l.amount) })),
  };
}

export const gbp = (n: number) => '£' + n.toLocaleString('en-GB', { maximumFractionDigits: 0 });
