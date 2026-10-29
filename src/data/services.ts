export interface Service {
  slug: string;
  name: string;
  code: string;
  title: string;
  description: string;
  h1: string;
  /** Tokens like {slug.duration}, {slug.miles} or {slug.from} are filled from the route data. */
  answer: string;
  points: { h: string; p: string }[];
  routes: string[];
  faqs: { q: string; a: string }[];
}

export const services: Service[] = [
  {
    slug: 'chauffeur',
    name: 'Executive chauffeur',
    code: 'A',
    title: 'Executive Chauffeur in Norwich: Business and Events',
    description: 'Executive chauffeur from Norwich: vetted, discreet drivers in black Mercedes saloons and V-Class MPVs, by the journey, hour or day. Fixed fares, 24/7.',
    h1: 'Executive chauffeur, Norwich',
    answer: 'Wensum Black provides executive chauffeurs from Norwich to anywhere in the UK, by the journey, by the hour or by the day. Every driver is employed, DBS checked and bound by a confidentiality agreement. Cars are black Mercedes E-Class, S-Class and V-Class, and fares are fixed at booking.',
    points: [
      { h: 'By the journey or the day', p: 'Single runs, returns with waiting, or a car and driver on standby for a roadshow, a site visit or a wedding.' },
      { h: 'A working cabin', p: 'Quiet, clean, with Wi-Fi, charging, water and a driver who does not start conversations. Take calls in private.' },
      { h: 'Planned, then watched', p: 'Routes are planned the night before and dispatch watches the job live. If something changes, we have already rerouted.' },
      { h: 'Account billing', p: 'Monthly invoicing, cost codes and passenger reports for firms that move people often.' },
    ],
    routes: ['london', 'cambridge', 'birmingham', 'manchester', 'oxford', 'leeds'],
    faqs: [
      { q: 'Can I hire a chauffeur by the hour in Norwich?', a: 'Yes. As-directed hire starts at three hours and is quoted at a fixed hourly rate that includes the car, driver and fuel for local running. Longer distances are priced per mile.' },
      { q: 'Do your chauffeurs wear uniform?', a: 'Dark suit, no branding, by default. If you prefer the driver to look like a colleague rather than a chauffeur, tell us when you book.' },
      { q: 'Can you provide more than one car?', a: 'Yes. We coordinate multi-car movements for events, roadshows and visiting delegations, with one dispatcher looking after the whole group.' },
    ],
  },
  {
    slug: 'airport-transfers',
    name: 'Airport transfers',
    code: 'B',
    title: 'Airport Transfers from Norwich: Heathrow, Stansted, Gatwick',
    description: 'Fixed-price airport transfers from Norwich to Heathrow, Stansted, Gatwick, Luton and every UK airport. Flight tracking, meet and greet, 60 minutes free.',
    h1: 'Airport transfers from Norwich',
    answer: 'We drive from Norwich to every UK airport, from Stansted in about {stansted-airport.duration} to Heathrow in about {heathrow-airport.duration}. Flights are tracked live, arrivals include meet and greet with 60 minutes of free waiting, and the fare is fixed when you book, whatever happens on the M25.',
    points: [
      { h: 'Flight tracked', p: 'Give us the flight number and we follow it. Early, late or diverted, the driver is there when you walk out.' },
      { h: 'Meet and greet', p: 'Your driver waits in arrivals with a discreet name board, helps with the bags and walks you to the car.' },
      { h: 'Departure buffers', p: 'We plan backwards from bag drop, not from take-off, and allow for the M11 and M25 at that hour.' },
      { h: 'Room for luggage', p: 'Saloons take two large cases. The V-Class takes seven people and six cases, so skis and golf bags fit too.' },
    ],
    routes: ['heathrow-airport', 'stansted-airport', 'gatwick-airport', 'luton-airport', 'london-city-airport', 'birmingham-airport'],
    faqs: [
      { q: 'How early will you collect me for a Heathrow flight?', a: 'For a long-haul departure from Norwich we usually collect four and a half to five hours before take-off. That covers the drive, a traffic margin and the airline’s bag-drop cutoff.' },
      { q: 'What if my flight is delayed?', a: 'Nothing changes for you. We track the flight and adjust the pickup at no cost, and waiting is free for the first 60 minutes after the actual landing time.' },
      { q: 'Do you charge for airport parking?', a: 'Short-stay parking for meet and greet is included in the quote. Drop-off charges at Heathrow, Stansted, Gatwick and Luton are also included.' },
    ],
  },
  {
    slug: 'secure-courier',
    name: 'Secure courier',
    code: 'C',
    title: 'Same-Day Secure Courier from Norwich, Hand to Hand',
    description: 'Same-day secure courier from Norwich to anywhere in the UK. One consignment per car, driven direct, live tracking, signature and photo proof of delivery.',
    h1: 'Secure courier, same day',
    answer: 'Our secure courier service collects in Norwich within about an hour and drives your consignment directly to any UK address. There are no depots, no other drops and no handovers. Live tracking, a named driver, signature on delivery and photo proof are standard on every job.',
    points: [
      { h: 'One car, one consignment', p: 'Your item is the only thing in the car. It never sits in a depot or passes through another person’s hands.' },
      { h: 'Chain of custody', p: 'Timed collection and delivery, photo at both ends, named signatory, and a written record you can file.' },
      { h: 'Built for the awkward items', p: 'Legal bundles, contracts for signature, medical samples, prototypes, artwork, jewellery and IT hardware.' },
      { h: 'Wait and return', p: 'Need the signed contract back today? The driver waits and brings it straight back to Norwich.' },
    ],
    routes: ['london', 'cambridge', 'birmingham', 'manchester', 'edinburgh', 'bristol'],
    faqs: [
      { q: 'How fast can a courier collect in Norwich?', a: 'Usually within 60 minutes inside the Norwich ring road, and within 90 minutes elsewhere in Norfolk, at any time of day or night.' },
      { q: 'Is the courier insured?', a: 'Yes. Goods in transit cover is included as standard. Higher-value consignments can be covered on request when you book.' },
      { q: 'Can you deliver documents for signature and bring them back?', a: 'Yes. Book it as a wait-and-return. The driver waits while the documents are signed, then drives them straight back.' },
    ],
  },
  {
    slug: 'long-distance',
    name: 'Long-distance runs',
    code: 'D',
    title: 'Long-Distance Private Driver from Norwich, UK Wide',
    description: 'Long-distance private driver from Norwich to Scotland, Wales, Cornwall and Northern Ireland. Planned breaks, a second driver for non-stop runs, fixed fares.',
    h1: 'Long-distance runs',
    answer: 'For journeys over 200 miles we plan the route, breaks and arrival time in advance, and can provide a second driver so the car never has to stop for long. Norwich to Edinburgh takes about {edinburgh.duration}, Penzance about {penzance.duration}, and Belfast about {belfast.duration} including the Cairnryan crossing.',
    points: [
      { h: 'Planned breaks', p: 'A rest stop at least every four and a half hours, chosen in advance at services with proper facilities.' },
      { h: 'Two-driver option', p: 'For overnight or non-stop runs we put two drivers in the car and they swap at set points.' },
      { h: 'Car and ferry', p: 'Northern Ireland, the Isle of Wight and the Scottish islands are covered. You stay in the same car for the whole journey.' },
      { h: 'Comfort over hours', p: 'For long runs we recommend the S-Class or V-Class: more legroom, reclining rear seats and blinds.' },
    ],
    routes: ['edinburgh', 'glasgow', 'cardiff', 'penzance', 'belfast', 'inverness'],
    faqs: [
      { q: 'Is a private driver cheaper than flying from Norwich to Edinburgh?', a: 'For two or more people with luggage it is often similar once airport transfers, parking and fares are added, and it is door to door. For one traveller on a budget, flying is usually cheaper.' },
      { q: 'Do you stay overnight at the destination?', a: 'If you need the car the next day, the driver stays nearby. We quote the accommodation at cost, or you can book the return separately.' },
      { q: 'Can I take pets on a long-distance run?', a: 'Yes, in the MPV, by arrangement. Tell us when you book so we can fit a cargo liner and plan extra stops.' },
    ],
  },
];
