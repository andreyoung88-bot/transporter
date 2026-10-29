import { describe, it, expect, vi } from 'vitest';
import { POST, validate } from '../src/pages/api/quote';

const call = (body: Record<string, string>, json = true) => {
  const fd = new FormData();
  Object.entries(body).forEach(([k, v]) => fd.append(k, v));
  const request = new Request('https://example.test/api/quote', { method: 'POST', body: fd, headers: json ? { accept: 'application/json' } : {} });
  return (POST as any)({ request });
};

const good = { name: 'Ada Lovelace', email: 'ada@example.com', to: 'heathrow-airport', vehicle: 'executive', t: String(Date.now() - 10_000) };

describe('quote API', () => {
  it('accepts a valid request', async () => {
    const log = vi.spyOn(console, 'log').mockImplementation(() => {});
    const res = await call(good);
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ ok: true });
    expect(log).toHaveBeenCalled();
    log.mockRestore();
  });
  it('rejects missing contact details with field errors', async () => {
    const res = await call({ ...good, email: '' });
    expect(res.status).toBe(422);
    expect((await res.json()).errors.email).toBeTruthy();
  });
  it('rejects a bad email and an unknown vehicle', () => {
    const v = validate({ ...good, email: 'nope', vehicle: 'tank' });
    expect(v.ok).toBe(false);
    if (!v.ok) expect(Object.keys(v.errors).sort()).toEqual(['email', 'vehicle']);
  });
  it('silently drops honeypot and too-fast submissions', async () => {
    const log = vi.spyOn(console, 'log').mockImplementation(() => {});
    expect((await call({ ...good, website: 'spam.biz' })).status).toBe(200);
    expect((await call({ ...good, t: String(Date.now()) })).status).toBe(200);
    expect(log).not.toHaveBeenCalled();
    log.mockRestore();
  });
  it('redirects plain form posts back to the contact page', async () => {
    vi.spyOn(console, 'log').mockImplementation(() => {});
    const res = await call(good, false);
    expect(res.status).toBe(303);
    expect(res.headers.get('location')).toContain('/contact?sent=1');
  });
  it('strips control characters and caps lengths', () => {
    const v = validate({ ...good, name: 'A\u0000B' + 'x'.repeat(200) });
    expect(v.ok).toBe(true);
    if (v.ok) { expect(v.data.name).not.toContain('\u0000'); expect(v.data.name.length).toBeLessThanOrEqual(80); }
  });
});
