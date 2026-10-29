import type { APIRoute } from 'astro';
import { ukRings, project, MAP_W, MAP_H } from '../../lib/projection';
import { destinations } from '../../data/destinations';
import { ORIGIN } from '../../config/site';

/** Pre-projected geometry for the three.js scenes, so the client never ships the world atlas. */
export const GET: APIRoute = () =>
  new Response(
    JSON.stringify({
      w: MAP_W,
      h: MAP_H,
      origin: project(ORIGIN),
      rings: ukRings(),
      places: destinations.map((d) => ({ s: d.slug, n: d.name, p: project(d), t: d.type })),
    }),
    { headers: { 'Content-Type': 'application/json' } },
  );
