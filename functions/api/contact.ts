import { validateContact } from '../../src/scripts/contact-core';

interface Env {
  CONTACT_FROM?: string;
  CONTACT_TO?: string;
  RESEND_API_KEY?: string;
  TURNSTILE_SECRET_KEY?: string;
}

interface PagesContext {
  request: Request;
  env: Env;
}

interface ContactRequest {
  name: string;
  email: string;
  type: string;
  message: string;
  lang: string;
  token: string;
  website: string;
}

const json = (status: number, body: object, headers: HeadersInit = {}) =>
  new Response(JSON.stringify(body), {
    status,
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Cache-Control': 'no-store',
      ...headers,
    },
  });

const badMethod = () => json(405, { ok: false, error: 'method-not-allowed' }, { Allow: 'POST' });

function allowedOrigin(value: string | null): boolean {
  if (!value) return false;
  try {
    const url = new URL(value);
    return (
      value === url.origin &&
      (url.origin === 'https://fextracode.com' ||
        (url.protocol === 'https:' && /^[a-z0-9-]+\.fextracode\.pages\.dev$/i.test(url.hostname)))
    );
  } catch {
    return false;
  }
}

function isContactRequest(value: unknown): value is ContactRequest {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return false;
  const data = value as Record<string, unknown>;
  return ['name', 'email', 'type', 'message', 'lang', 'token', 'website'].every(
    (key) => typeof data[key] === 'string',
  );
}

export async function onRequestPost({ request, env }: PagesContext): Promise<Response> {
  if (!allowedOrigin(request.headers.get('Origin')))
    return json(403, { ok: false, error: 'origin' });
  if (!/^application\/json(?:\s*;|$)/i.test(request.headers.get('Content-Type') ?? '')) {
    return json(415, { ok: false, error: 'content-type' });
  }

  const declaredLength = Number(request.headers.get('Content-Length') ?? '0');
  if (declaredLength > 10 * 1024) return json(413, { ok: false, error: 'too-large' });
  let raw = '';
  try {
    if (request.body) {
      const reader = request.body.getReader();
      const chunks: Uint8Array[] = [];
      let byteLength = 0;
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        byteLength += value.byteLength;
        if (byteLength > 10 * 1024) {
          await reader.cancel();
          return json(413, { ok: false, error: 'too-large' });
        }
        chunks.push(value);
      }
      const bytes = new Uint8Array(byteLength);
      let offset = 0;
      for (const chunk of chunks) {
        bytes.set(chunk, offset);
        offset += chunk.byteLength;
      }
      raw = new TextDecoder().decode(bytes);
    }
  } catch {
    return json(400, { ok: false, error: 'invalid-json' });
  }
  if (new TextEncoder().encode(raw).byteLength > 10 * 1024)
    return json(413, { ok: false, error: 'too-large' });

  let value: unknown;
  try {
    value = JSON.parse(raw);
  } catch {
    return json(400, { ok: false, error: 'invalid-json' });
  }
  if (value && typeof value === 'object' && !Array.isArray(value)) {
    const website = (value as Record<string, unknown>).website;
    if (typeof website === 'string' && website.trim()) return json(200, { ok: true });
  }
  if (!isContactRequest(value)) return json(400, { ok: false, error: 'invalid', fields: ['form'] });
  const errors = validateContact(value);
  const fields = Object.keys(errors);
  if (fields.length) return json(400, { ok: false, error: 'invalid', fields });
  if (!value.token.trim()) return json(403, { ok: false, error: 'captcha' });

  if (!env.TURNSTILE_SECRET_KEY || !env.RESEND_API_KEY || !env.CONTACT_TO || !env.CONTACT_FROM) {
    return json(503, { ok: false, error: 'not-configured' });
  }

  const captchaBody = new URLSearchParams({
    secret: env.TURNSTILE_SECRET_KEY,
    response: value.token,
  });
  const remoteIp = request.headers.get('CF-Connecting-IP');
  if (remoteIp) captchaBody.set('remoteip', remoteIp);

  try {
    const captchaResponse = await fetch(
      'https://challenges.cloudflare.com/turnstile/v0/siteverify',
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: captchaBody,
      },
    );
    const captcha = (await captchaResponse.json()) as { success?: boolean };
    if (!captchaResponse.ok || captcha.success !== true)
      return json(403, { ok: false, error: 'captcha' });
  } catch {
    return json(403, { ok: false, error: 'captcha' });
  }

  const cleanHeader = (text: string) => text.replace(/[\r\n]/g, '');
  const proposalType = value.type === 'freelance' ? 'Proyecto freelance' : 'Colaboración técnica';
  const subject = cleanHeader(`[fextracode] ${proposalType} — ${value.name}`);
  const text = [
    `Nombre: ${value.name}`,
    `Email: ${value.email}`,
    `Tipo: ${proposalType}`,
    `Idioma: ${value.lang}`,
    '',
    'Mensaje:',
    value.message,
  ].join('\n');
  const endpoint = 'https://api.resend.com/emails';

  try {
    const mailResponse = await fetch(endpoint, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${env.RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        to: [cleanHeader(env.CONTACT_TO)],
        from: `fextracode <${cleanHeader(env.CONTACT_FROM)}>`,
        reply_to: cleanHeader(value.email),
        subject,
        text,
      }),
    });
    const result = (await mailResponse.json()) as { id?: unknown };
    if (!mailResponse.ok || typeof result.id !== 'string')
      return json(502, { ok: false, error: 'send-failed' });
    return json(200, { ok: true });
  } catch {
    return json(502, { ok: false, error: 'send-failed' });
  }
}

export async function onRequest({ request, env }: PagesContext): Promise<Response> {
  if (request.method !== 'POST') return badMethod();
  return onRequestPost({ request, env });
}
