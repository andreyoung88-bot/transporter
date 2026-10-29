import { chromium } from 'playwright';
const out = process.argv[2];
const base = 'http://localhost:4321';
const browser = await chromium.launch({ args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'] });
const errors = [];
async function shot(path, name, width, height, { full = false, live = false } = {}) {
  const page = await browser.newPage({ viewport: { width, height }, deviceScaleFactor: 1 });
  page.on('console', (m) => m.type() === 'error' && errors.push(`${name}: ${m.text()}`));
  page.on('pageerror', (e) => errors.push(`${name}: ${e.message}`));
  await page.goto(base + path, { waitUntil: 'networkidle' });
  if (live) {
    await page.mouse.move(width / 2, height / 2);
    await page.mouse.move(width / 2 + 40, height / 2 + 20);
    await page.waitForSelector('.s3d.is-live', { timeout: 20000 }).catch(() => errors.push(`${name}: 3D never went live`));
    await page.waitForTimeout(3500);
  }
  if (full) await page.evaluate(() => document.querySelectorAll('[data-reveal]').forEach((e) => e.classList.add('in')));
  await page.screenshot({ path: `${out}/${name}.png`, fullPage: full });
  await page.close();
}
await shot('/', 'home-desktop', 1440, 900, { live: true });
await shot('/', 'home-mobile', 390, 844, { live: true });
await shot('/', 'home-full', 1440, 900, { full: true });
await shot('/routes/heathrow-airport/', 'route-desktop', 1440, 900, { live: true });
await shot('/routes/edinburgh/', 'route-full', 1440, 900, { full: true });
await shot('/routes/edinburgh/', 'route-mobile-full', 390, 844, { full: true });
await shot('/routes/', 'routes-index', 1440, 900);
await shot('/contact/', 'contact', 1440, 900, { full: true });
await shot('/fleet/', 'fleet', 1440, 900);
await browser.close();
console.log(errors.length ? errors.join('\n') : 'no console errors');
