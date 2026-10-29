import { geoConicConformal, geoPath, type GeoProjection } from 'd3-geo';
import { feature } from 'topojson-client';
import type { FeatureCollection, Feature, Geometry, Polygon, MultiPolygon } from 'geojson';
import world from 'world-atlas/countries-50m.json' with { type: 'json' };
import type { LatLon } from './geo';

/** ISO 3166 numeric: United Kingdom and Ireland (context only). */
const UK = '826';
const IE = '372';

/** SVG/scene coordinate box. */
export const MAP_W = 600;
export const MAP_H = 900;

type Countries = FeatureCollection<Polygon | MultiPolygon, { name: string }>;
const countries = feature(world as any, (world as any).objects.countries) as unknown as Countries;
const uk = countries.features.find((f) => String(f.id) === UK) as Feature<MultiPolygon>;
const ie = countries.features.find((f) => String(f.id) === IE) as Feature<MultiPolygon>;

/**
 * Drop tiny islets and Shetland (off the frame) so the map stays light.
 */
function prune(f: Feature<MultiPolygon>, minArea: number, maxLat = 59.5): Feature<MultiPolygon> {
  const p = geoPath();
  const polys = f.geometry.coordinates.filter(
    (c) => p.area({ type: 'Polygon', coordinates: c }) > minArea && p.centroid({ type: 'Polygon', coordinates: c })[1] < maxLat,
  );
  return { ...f, geometry: { type: 'MultiPolygon', coordinates: polys } };
}

export const ukShape = prune(uk, 2e-6);
export const ieShape = prune(ie, 2e-6);

export const projection: GeoProjection = geoConicConformal()
  .parallels([50, 58])
  .rotate([3.2, 0])
  .fitExtent(
    [
      [24, 24],
      [MAP_W - 24, MAP_H - 24],
    ],
    { type: 'Feature', geometry: { type: 'MultiPoint', coordinates: [[-8.2, 49.9], [1.8, 49.9], [1.8, 59.4], [-8.2, 59.4]] }, properties: {} } as Feature<Geometry>,
  );

const path = geoPath(projection).digits(1);

export const ukPath = path(ukShape) ?? '';
export const iePath = path(ieShape) ?? '';

export function project(p: LatLon): [number, number] {
  const xy = projection([p.lon, p.lat]);
  return xy ? [Math.round(xy[0] * 10) / 10, Math.round(xy[1] * 10) / 10] : [0, 0];
}

/** A gentle quadratic arc between two projected points, bowed to the right of travel. */
export function arcPath(a: LatLon, b: LatLon, bow = 0.18): string {
  const [x1, y1] = project(a);
  const [x2, y2] = project(b);
  const mx = (x1 + x2) / 2;
  const my = (y1 + y2) / 2;
  const dx = x2 - x1;
  const dy = y2 - y1;
  const cx = mx - dy * bow;
  const cy = my + dx * bow;
  return `M${x1} ${y1}Q${cx.toFixed(1)} ${cy.toFixed(1)} ${x2} ${y2}`;
}

/** Polygon rings in projected space, for three.js extrusion. Y is flipped by the caller. */
export function ukRings(): [number, number][][][] {
  return ukShape.geometry.coordinates.map((poly) =>
    poly.map((ring) => ring.map(([lon, lat]) => project({ lat, lon }))),
  );
}
