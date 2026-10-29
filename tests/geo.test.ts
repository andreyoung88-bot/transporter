import { describe, it, expect } from 'vitest';
import { haversineMiles, modelRoadMiles, driveMinutes, formatDuration, compass, bearing } from '../src/lib/geo';
import { ORIGIN } from '../src/config/site';

const LONDON = { lat: 51.5074, lon: -0.1278 };
const EDINBURGH = { lat: 55.9533, lon: -3.1883 };

describe('geo', () => {
  it('measures great-circle distance', () => {
    expect(haversineMiles(ORIGIN, LONDON)).toBeGreaterThan(97);
    expect(haversineMiles(ORIGIN, LONDON)).toBeLessThan(102);
  });
  it('models road distance within 10% of known values', () => {
    expect(Math.abs(modelRoadMiles(LONDON) - 118) / 118).toBeLessThan(0.1);
    expect(Math.abs(modelRoadMiles(EDINBURGH) - 365) / 365).toBeLessThan(0.1);
  });
  it('produces sensible drive times', () => {
    const t = driveMinutes(118, { london: true });
    expect(t).toBeGreaterThan(140);
    expect(t).toBeLessThan(190);
    expect(driveMinutes(365)).toBeGreaterThan(380);
  });
  it('formats durations', () => {
    expect(formatDuration(45)).toBe('45 min');
    expect(formatDuration(120)).toBe('2 h');
    expect(formatDuration(125)).toBe('2 h 05 min');
  });
  it('gives London as south-west of Norwich', () => {
    expect(compass(bearing(ORIGIN, LONDON))).toBe('south-west');
  });
});
