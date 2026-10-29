# Wensum Black

Private driver and secure courier site: Norwich to 138 UK destinations. Astro (static) + one Vercel function, three.js route scenes, no tile servers or API keys.

## Commands

| Command | What it does |
| --- | --- |
| `npm run dev` | Local dev server |
| `npm run build` | Static build + Vercel output |
| `npm test` | Pricing, geo and quote API tests |
| `npx tsx scripts/og.ts` | Regenerate share images in `public/og` (needs Playwright Chromium) |
| `npx tsx scripts/verify-data.ts` | Sanity-check destination data |
| `node scripts/audit.mjs` | SEO/link audit of the built site |

Requires Node 24 (Astro 7 needs ≥ 22.23.4).

## Where things live

- `src/config/site.ts`: name, phone, email, address, GA4 ID. **Replace the placeholders before launch.**
- `src/config/pricing.ts`: every rate, surcharge and ferry fare.
- `src/data/destinations.ts`: the 138 destinations (coordinates, roads, road miles, copy).
- `src/data/services.ts`: the four service pages.

## Environment variables (Vercel)

- `SITE_URL`: canonical origin, for example `https://wensumblack.co.uk`.
- `RESEND_API_KEY`: enables email delivery of quote requests. Without it, requests are written to the function log.
- `QUOTE_TO`, `QUOTE_FROM`: optional recipient and sender for quote emails.

## Analytics and consent

Google Consent Mode v2 defaults to denied. GA4 is only downloaded after the visitor accepts, and only once `ga4Id` in `site.ts` is a real ID.
