/**
 * Renders Open Graph cards (1200x630) for the home page and every route
 * with the site's own fonts, using the pre-installed Chromium. Run locally:
 *   npx tsx scripts/og.ts
 * Output is committed to public/og so the Vercel build needs no browser.
 */
import { chromium } from 'playwright';
import { mkdirSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import sharp from 'sharp';
import { allRoutes } from '../src/lib/routes';
import { ukPath, arcPath, project, MAP_W, MAP_H } from '../src/lib/projection';
import { ORIGIN } from '../src/config/site';
import { gbp } from '../src/lib/price';

const out = resolve('public/og');
mkdirSync(out, { recursive: true });
const font = (f: string) => `data:font/woff2;base64,${readFileSync(resolve('public/fonts', f)).toString('base64')}`;

const css = `
@font-face{font-family:B;src:url(${font('barlow-condensed-latin-600-normal.woff2')})}
@font-face{font-family:M;src:url(${font('jetbrains-mono-latin-400-normal.woff2')})}
*{margin:0;box-sizing:border-box}
body{width:1200px;height:630px;background:#0b0b0c;color:#e8e6e1;font-family:B;position:relative;overflow:hidden}
.g{position:absolute;inset:0;background-image:linear-gradient(#18191c 1px,transparent 1px),linear-gradient(90deg,#18191c 1px,transparent 1px);background-size:40px 40px}
.map{position:absolute;right:-30px;top:-150px;width:520px;height:780px}
.c{position:absolute;left:64px;top:56px;bottom:56px;width:720px;display:flex;flex-direction:column}
.brand{font-size:30px;letter-spacing:4px}
.brand i{display:block;width:62px;height:3px;background:#f2a93b;margin-top:8px}
h1{font-size:112px;line-height:.9;text-transform:uppercase;margin-top:auto}
h1 span{color:#f2a93b}
.m{font-family:M;font-size:24px;letter-spacing:2px;color:#9a9da3;margin-top:28px;text-transform:uppercase}
.m b{color:#f2a93b;font-weight:400}
.bar{position:absolute;left:0;right:0;bottom:0;height:10px;background:repeating-linear-gradient(90deg,#f2a93b 0 36px,transparent 36px 56px)}
`;

function svg(target?: { lat: number; lon: number }) {
  const [ox, oy] = project(ORIGIN);
  const arc = target ? `<path d="${arcPath(ORIGIN, target)}" fill="none" stroke="#f2a93b" stroke-width="3"/>` : '';
  const [tx, ty] = target ? project(target) : [0, 0];
  return `<svg class="map" viewBox="0 0 ${MAP_W} ${MAP_H}"><path d="${ukPath}" fill="#17181b" stroke="#4a4d54" stroke-width="1.2"/>${arc}${target ? `<rect x="${tx - 6}" y="${ty - 6}" width="12" height="12" fill="#e8e6e1"/>` : ''}<circle cx="${ox}" cy="${oy}" r="9" fill="#f2a93b"/></svg>`;
}

const page = (title: string, meta: string, target?: { lat: number; lon: number }) =>
  `<!doctype html><html><head><style>${css}</style></head><body><div class="g"></div>${svg(target)}<div class="c"><div class="brand">WENSUM BLACK<i></i></div><h1>${title}</h1><p class="m">${meta}</p></div><div class="bar"></div></body></html>`;

const browser = await chromium.launch();
const ctx = await browser.newPage({ viewport: { width: 1200, height: 630 } });
async function shot(name: string, html: string) {
  await ctx.setContent(html, { waitUntil: 'load' });
  await ctx.evaluate(() => document.fonts.ready);
  const png = await ctx.screenshot({ type: 'png' });
  await sharp(png).jpeg({ quality: 80, mozjpeg: true }).toFile(resolve(out, `${name}.jpg`));
}

await shot('default', page('Norwich <span>&rarr;</span><br/>anywhere', 'Private driver <b>/</b> secure courier <b>/</b> 24/7'));
for (const r of allRoutes()) {
  const name = r.d.name.length > 16 ? r.d.name.replace(' Airport', '<br/>Airport').replace('Port of ', 'Port of<br/>') : r.d.name;
  await shot(r.d.slug, page(`Norwich <span>&rarr;</span><br/>${name}`, `${r.miles} mi <b>/</b> ${r.duration} <b>/</b> from ${gbp(r.from)}`, r.d));
}
await browser.close();

// App icons from the SVG favicon.
const fav = readFileSync(resolve('public/favicon.svg'));
await sharp(fav, { density: 600 }).resize(180, 180).png().toFile(resolve('public/apple-touch-icon.png'));
await sharp(fav, { density: 600 }).resize(192, 192).png().toFile(resolve('public/icon-192.png'));
await sharp(fav, { density: 600 }).resize(512, 512).png().toFile(resolve('public/icon-512.png'));
console.log('og + icons done');
