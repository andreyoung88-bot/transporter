import { ORIGIN } from '../config/site';

export interface LatLon { lat: number; lon: number }

const R_MILES = 3958.8;
const rad = (d: number) => (d * Math.PI) / 180;

/** Great-circle distance in miles. */
export function haversineMiles(a: LatLon, b: LatLon): number {
  const dLat = rad(b.lat - a.lat);
  const dLon = rad(b.lon - a.lon);
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(rad(a.lat)) * Math.cos(rad(b.lat)) * Math.sin(dLon / 2) ** 2;
  return 2 * R_MILES * Math.asin(Math.sqrt(h));
}

/**
 * Road miles estimated from straight-line distance. Norfolk has no
 * motorway, so short hops wind more than long motorway runs.
 */
export function modelRoadMiles(to: LatLon, from: LatLon = ORIGIN): number {
  const crow = haversineMiles(from, to);
  const circuity = 1.18 + 0.14 * Math.exp(-crow / 90);
  return crow * circuity;
}

export const FERRY_MINUTES: Record<string, number> = {
  'Cairnryan–Belfast': 135 + 60,
  'Holyhead–Dublin': 195 + 60,
  'Liverpool–Belfast': 480 + 60,
};

/**
 * Door-to-door drive time in minutes. Average speed rises with distance
 * as the share of A11/M11/A1(M) running grows; London adds traffic.
 */
export function driveMinutes(miles: number, opts: { london?: boolean; ferry?: string } = {}): number {
  const speed = 46 + 10 * (1 - Math.exp(-miles / 150));
  let mins = (miles / speed) * 60 + 10;
  if (opts.london) mins += 25;
  // Statutory-style breaks on long runs: 20 min every 4.5h of driving.
  mins += Math.floor(mins / 270) * 20;
  if (opts.ferry) mins += FERRY_MINUTES[opts.ferry] ?? 0;
  return Math.round(mins / 5) * 5;
}

export function formatDuration(mins: number): string {
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  if (h === 0) return `${m} min`;
  return m === 0 ? `${h} h` : `${h} h ${String(m).padStart(2, '0')} min`;
}

/** Initial compass bearing, used for copy ("heads south-west on the A11"). */
export function bearing(a: LatLon, b: LatLon): number {
  const y = Math.sin(rad(b.lon - a.lon)) * Math.cos(rad(b.lat));
  const x = Math.cos(rad(a.lat)) * Math.sin(rad(b.lat)) - Math.sin(rad(a.lat)) * Math.cos(rad(b.lat)) * Math.cos(rad(b.lon - a.lon));
  return ((Math.atan2(y, x) * 180) / Math.PI + 360) % 360;
}

const POINTS = ['north', 'north-east', 'east', 'south-east', 'south', 'south-west', 'west', 'north-west'];
export const compass = (deg: number) => POINTS[Math.round(deg / 45) % 8];
