/** Every rate lives here. Prices in GBP. Change them and rebuild. */
export interface VehicleClass {
  id: 'executive' | 'luxury' | 'mpv' | 'courier';
  name: string;
  model: string;
  perMile: number;
  seats: number;
  bags: number;
  summary: string;
}

export const vehicles: VehicleClass[] = [
  {
    id: 'executive',
    name: 'Executive saloon',
    model: 'Mercedes E-Class or similar',
    perMile: 2.1,
    seats: 3,
    bags: 2,
    summary: 'The default. Quiet cabin, Wi-Fi, charging, bottled water.',
  },
  {
    id: 'luxury',
    name: 'Luxury saloon',
    model: 'Mercedes S-Class or BMW 7 Series',
    perMile: 2.9,
    seats: 3,
    bags: 2,
    summary: 'Rear-seat comfort for long runs and first impressions.',
  },
  {
    id: 'mpv',
    name: 'Executive MPV',
    model: 'Mercedes V-Class',
    perMile: 2.5,
    seats: 7,
    bags: 6,
    summary: 'Teams, families and luggage, without a second car.',
  },
  {
    id: 'courier',
    name: 'Secure courier',
    model: 'Unmarked estate, tracked',
    perMile: 1.6,
    seats: 0,
    bags: 0,
    summary: 'Same-day, hand-to-hand delivery of documents and high-value items.',
  },
];

export const pricing = {
  minimumFare: 65,
  /** 22:00 to 06:00 */
  nightMultiplier: 1.2,
  airportMeetGreet: 15,
  /** Per hour, after the free allowance below. */
  waitingPerHour: 30,
  freeWaitingMinutes: 30,
  airportFreeWaitingMinutes: 60,
  /** Return journeys booked together save this fraction on the return leg. */
  returnDiscount: 0.1,
  /** Vehicle and driver fare for a ferry crossing, per direction. */
  ferryCrossing: { 'Cairnryan–Belfast': 210, 'Holyhead–Dublin': 230, 'Liverpool–Belfast': 260 } as Record<string, number>,
  /** The "from" price is the estimate minus this; the upper band is plus it. */
  band: 0.08,
} as const;
