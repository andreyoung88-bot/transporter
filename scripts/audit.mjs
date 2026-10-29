// Static audit of the built site: unique titles/descriptions, one h1,
// canonical present, JSON-LD parses, internal links resolve, images have alt.
import { readdirSync, readFileSync, statSync, existsSync } from 'node:fs';
import { join, relative } from 'node:path';

const root = process.argv[2] || '.vercel/output/static';
const files = [];
const walk = (d) => readdirSync(d).forEach((f) => { const p = join(d, f); statSync(p).isDirectory() ? walk(p) : p.endsWith('.html') && files.push(p); });
walk(root);

const titles = new Map(), descs = new Map();
const problems = [];
const exists = (href) => {
  const clean = href.split('#')[0].split('?')[0];
  if (clean === '' || clean === '/') return true;
  return [clean, clean + '.html', join(clean, 'index.html')].some((c) => existsSync(join(root, c)));
};
for (const f of files) {
  const url = '/' + relative(root, f).replace(/\.html$/, '').replace(/index$/, '');
  const h = readFileSync(f, 'utf8');
  const title = h.match(/<title>([^<]*)<\/title>/)?.[1] ?? '';
  const desc = h.match(/<meta name="description" content="([^"]*)"/)?.[1] ?? '';
  const noindex = /name="robots" content="noindex/.test(h);
  if (!noindex) {
    if (titles.has(title)) problems.push(`${url}: duplicate title with ${titles.get(title)}`);
    titles.set(title, url);
    if (descs.has(desc)) problems.push(`${url}: duplicate description with ${descs.get(desc)}`);
    descs.set(desc, url);
  }
  if (title.length > 65) problems.push(`${url}: title ${title.length} chars`);
  if (desc.length < 70 || desc.length > 165) problems.push(`${url}: description ${desc.length} chars`);
  const h1 = (h.match(/<h1[\s>]/g) || []).length;
  if (h1 !== 1) problems.push(`${url}: ${h1} h1`);
  if (!/rel="canonical"/.test(h)) problems.push(`${url}: no canonical`);
  for (const m of h.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)) {
    try { JSON.parse(m[1]); } catch { problems.push(`${url}: bad JSON-LD`); }
  }
  for (const m of h.matchAll(/<img\b[^>]*>/g)) if (!/\balt=/.test(m[0])) problems.push(`${url}: img without alt`);
  for (const m of h.matchAll(/href="(\/[^"]*)"/g)) {
    const href = m[1].replace(/&amp;/g, '&');
    if (href.startsWith('/_astro') || href.startsWith('/fonts') || /\.(svg|png|jpg|webmanifest|xml|txt|json)$/.test(href.split('?')[0])) continue;
    if (!exists(href)) problems.push(`${url}: broken link ${href}`);
  }
}
console.log(`${files.length} pages audited`);
const uniq = [...new Set(problems)];
uniq.slice(0, 80).forEach((p) => console.log(' -', p));
console.log(uniq.length ? `${uniq.length} problems` : 'no problems');
process.exit(uniq.length ? 1 : 0);
