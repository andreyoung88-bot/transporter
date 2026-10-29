import { describe, it, expect } from 'vitest';
import { estimate } from '../src/lib/price';
import { pricing } from '../src/config/pricing';

describe('estimate', () => {
  it('applies the minimum fare on short hops', () => {
    expect(estimate({ miles: 5, vehicle: 'executive' }).total).toBe(pricing.minimumFare);
  });
  it('charges per mile by vehicle class', () => {
    expect(estimate({ miles: 100, vehicle: 'executive' }).total).toBe(210);
    expect(estimate({ miles: 100, vehicle: 'luxury' }).total).toBe(290);
    expect(estimate({ miles: 100, vehicle: 'courier' }).total).toBe(160);
  });
  it('adds night uplift, meet and greet, waiting and ferry', () => {
    const q = estimate({ miles: 100, vehicle: 'executive', night: true, airport: true, waitingMinutes: 90, ferry: 'Cairnryan–Belfast' });
    // 210*1.2 = 252, +15, +30 (60 billable min), +210 ferry = 507 -> 505
    expect(q.total).toBe(505);
    expect(q.lines).toHaveLength(4);
  });
  it('discounts the return leg', () => {
    expect(estimate({ miles: 100, vehicle: 'executive', returnTrip: true }).total).toBe(400); // 210 + 189 = 399 -> 400
  });
  it('never adds meet and greet to courier jobs', () => {
    expect(estimate({ miles: 100, vehicle: 'courier', airport: true }).total).toBe(160);
  });
  it('returns a band around the total', () => {
    const q = estimate({ miles: 200, vehicle: 'executive' });
    expect(q.low).toBeLessThan(q.total);
    expect(q.high).toBeGreaterThan(q.total);
  });
});
