import type { APIRoute } from 'astro';
import { destinations } from '../../data/destinations';
import { vehicles } from '../../config/pricing';
import { site } from '../../config/site';

export const prerender = false;

const MAX = { name: 80, contact: 120, message: 2000, place: 120 };
const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const phoneRe = /^[+()\d\s-]{7,20}$/;

type Fields = Record<string, string>;

const clean = (v: unknown, max: number) => String(v ?? '').replace(/[\u0000-\u001f\u007f]/g, ' ').trim().slice(0, max);

export function validate(f: Fields): { ok: true; data: Fields } | { ok: false; errors: Record<string, string> } {
  const errors: Record<string, string> = {};
  const data: Fields = {
    name: clean(f.name, MAX.name),
    email: clean(f.email, MAX.contact),
    phone: clean(f.phone, MAX.contact),
    to: clean(f.to, MAX.place),
    pickup: clean(f.pickup || 'Norwich', MAX.place),
    date: clean(f.date, 10),
    time: clean(f.time, 5),
    vehicle: clean(f.vehicle, 20),
    passengers: clean(f.passengers, 2),
    message: clean(f.message, MAX.message),
  };
  if (data.name.length < 2) errors.name = 'Enter your name.';
  if (!data.email && !data.phone) errors.email = 'Give us an email address or a phone number.';
  if (data.email && !emailRe.test(data.email)) errors.email = 'That email address does not look right.';
  if (data.phone && !phoneRe.test(data.phone)) errors.phone = 'That phone number does not look right.';
  if (!data.to) errors.to = 'Choose or type a destination.';
  if (data.date && !/^\d{4}-\d{2}-\d{2}$/.test(data.date)) errors.date = 'Use the date picker.';
  if (data.time && !/^\d{2}:\d{2}$/.test(data.time)) errors.time = 'Use the time picker.';
  if (data.vehicle && !vehicles.some((v) => v.id === data.vehicle)) errors.vehicle = 'Choose a vehicle.';
  return Object.keys(errors).length ? { ok: false, errors } : { ok: true, data };
}

async function deliver(d: Fields) {
  const dest = destinations.find((x) => x.slug === d.to)?.name ?? d.to;
  const body = [
    `Name: ${d.name}`,
    `Email: ${d.email || '-'}`,
    `Phone: ${d.phone || '-'}`,
    `Route: ${d.pickup} to ${dest}`,
    `When: ${d.date || '-'} ${d.time || ''}`,
    `Vehicle: ${d.vehicle || '-'}, passengers: ${d.passengers || '-'}`,
    '',
    d.message,
  ].join('\n');
  const key = import.meta.env.RESEND_API_KEY ?? process.env.RESEND_API_KEY;
  if (!key) {
    console.log('[quote]', JSON.stringify({ ...d, to: dest }));
    return;
  }
  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      // Resend's shared sender works until a domain is verified.
      from: process.env.QUOTE_FROM || 'Wensum Black <onboarding@resend.dev>',
      to: [process.env.QUOTE_TO || site.email],
      reply_to: d.email || undefined,
      subject: `Quote: Norwich to ${dest} (${d.name})`,
      text: body,
    }),
  });
  if (!res.ok) throw new Error(`Resend ${res.status}`);
}

const json = (status: number, payload: object) =>
  new Response(JSON.stringify(payload), { status, headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' } });

export const POST: APIRoute = async ({ request }) => {
  const type = request.headers.get('content-type') ?? '';
  const wantsJson = (request.headers.get('accept') ?? '').includes('application/json');
  let fields: Fields;
  try {
    fields = type.includes('application/json')
      ? await request.json()
      : (Object.fromEntries((await request.formData()).entries()) as Fields);
  } catch {
    return json(400, { ok: false, errors: { form: 'Could not read the form.' } });
  }

  // Bots fill the hidden field or submit faster than any person could.
  const elapsed = Date.now() - Number(fields.t || 0);
  if (fields.website || (fields.t && elapsed < 2500)) {
    return wantsJson ? json(200, { ok: true }) : Response.redirect(new URL('/contact?sent=1', request.url), 303);
  }

  const v = validate(fields);
  if (!v.ok) return json(422, v);
  try {
    await deliver(v.data);
  } catch (e) {
    console.error('[quote] delivery failed', e);
    return json(502, { ok: false, errors: { form: `We could not send that. Please call ${site.phoneDisplay}.` } });
  }
  return wantsJson ? json(200, { ok: true }) : Response.redirect(new URL('/contact?sent=1', request.url), 303);
};

export const ALL: APIRoute = () => json(405, { ok: false, errors: { form: 'Method not allowed' } });
