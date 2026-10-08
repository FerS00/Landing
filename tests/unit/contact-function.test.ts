import { afterEach, describe, expect, it, vi } from 'vitest';
import { onRequest, onRequestPost } from '../../functions/api/contact';

const env = {
  TURNSTILE_SECRET_KEY: 'test-secret',
  RESEND_API_KEY: 'test-resend-key',
  CONTACT_TO: 'owner@example.com',
  CONTACT_FROM: 'contacto@fextracode.com',
};

const validData = {
  name: 'Ana',
  email: 'ana@example.com',
  type: 'freelance',
  message: 'Necesito una aplicación sencilla.',
  lang: 'es',
  token: 'turnstile-token',
  website: '',
};

function request(body: unknown, headers: Record<string, string> = {}): Request {
  return new Request('https://fextracode.com/api/contact', {
    method: 'POST',
    headers: { Origin: 'https://fextracode.com', 'Content-Type': 'application/json', ...headers },
    body: typeof body === 'string' ? body : JSON.stringify(body),
  });
}

const okCaptcha = () =>
  new Response(JSON.stringify({ success: true }), {
    headers: { 'Content-Type': 'application/json' },
  });
const okMail = () =>
  new Response(JSON.stringify({ id: 'email-test-id' }), {
    headers: { 'Content-Type': 'application/json' },
  });

afterEach(() => {
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

describe('Pages contact function', () => {
  it('returns 405 and Allow for methods other than POST', async () => {
    const response = await onRequest({
      request: new Request('https://fextracode.com/api/contact', { method: 'GET' }),
      env,
    });
    expect(response.status).toBe(405);
    expect(response.headers.get('Allow')).toBe('POST');
  });

  it('rejects foreign origins', async () => {
    const response = await onRequestPost({
      request: request(validData, { Origin: 'https://attacker.example' }),
      env,
    });
    expect(response.status).toBe(403);
  });

  it('rejects bodies larger than 10 KB', async () => {
    const response = await onRequestPost({
      request: request({ ...validData, message: 'x'.repeat(11_000) }),
      env,
    });
    expect(response.status).toBe(413);
  });

  it('rejects malformed JSON', async () => {
    const response = await onRequestPost({ request: request('{'), env });
    expect(response.status).toBe(400);
    expect(await response.json()).toMatchObject({ error: 'invalid-json' });
  });

  it('rejects invalid fields using shared validation', async () => {
    const response = await onRequestPost({
      request: request({
        ...validData,
        name: '',
        email: 'bad',
        type: 'other',
        message: 'short',
        lang: 'fr',
      }),
      env,
    });
    expect(response.status).toBe(400);
    expect(await response.json()).toMatchObject({
      ok: false,
      error: 'invalid',
      fields: expect.arrayContaining(['name', 'email', 'type', 'message', 'lang']),
    });
  });

  it('silently accepts a filled honeypot without contacting Cloudflare', async () => {
    const fetchMock = vi.fn();
    vi.stubGlobal('fetch', fetchMock);
    const response = await onRequestPost({
      request: request({ ...validData, website: 'bot' }),
      env,
    });
    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({ ok: true });
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('rejects a failed Turnstile response', async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(new Response(JSON.stringify({ success: false })));
    vi.stubGlobal('fetch', fetchMock);
    const response = await onRequestPost({ request: request(validData), env });
    expect(response.status).toBe(403);
    expect(await response.json()).toEqual({ ok: false, error: 'captcha' });
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it('returns 503 when required variables are absent', async () => {
    const fetchMock = vi.fn();
    vi.stubGlobal('fetch', fetchMock);
    const response = await onRequestPost({
      request: request(validData),
      env: {
        TURNSTILE_SECRET_KEY: env.TURNSTILE_SECRET_KEY,
        CONTACT_TO: env.CONTACT_TO,
        CONTACT_FROM: env.CONTACT_FROM,
      },
    });
    expect(response.status).toBe(503);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('returns 502 when Resend rejects the request', async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(okCaptcha())
      .mockResolvedValueOnce(
        new Response(
          JSON.stringify({ statusCode: 401, name: 'validation_error', message: 'invalid key' }),
          {
            status: 401,
          },
        ),
      );
    vi.stubGlobal('fetch', fetchMock);
    const response = await onRequestPost({ request: request(validData), env });
    expect(response.status).toBe(502);
    expect(await response.json()).toEqual({ ok: false, error: 'send-failed' });
  });

  it('returns 502 when Resend responds without a string id', async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(okCaptcha())
      .mockResolvedValueOnce(
        new Response(JSON.stringify({ message: 'missing id' }), { status: 200 }),
      );
    vi.stubGlobal('fetch', fetchMock);
    const response = await onRequestPost({ request: request(validData), env });
    expect(response.status).toBe(502);
    expect(await response.json()).toEqual({ ok: false, error: 'send-failed' });
  });

  it('sends sanitized headers and the visitor reply-to without logging personal data', async () => {
    const log = vi.spyOn(console, 'log');
    const fetchMock = vi.fn().mockResolvedValueOnce(okCaptcha()).mockResolvedValueOnce(okMail());
    vi.stubGlobal('fetch', fetchMock);
    const response = await onRequestPost({
      request: request({ ...validData, name: 'Ana\r\nBcc: attacker@example.com' }),
      env,
    });
    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({ ok: true });
    const emailRequest = JSON.parse(String(fetchMock.mock.calls[1]?.[1]?.body)) as {
      to: string[];
      from: string;
      subject: string;
      reply_to: string;
    };
    expect(fetchMock.mock.calls[1]?.[0]).toBe('https://api.resend.com/emails');
    expect(fetchMock.mock.calls[1]?.[1]?.headers).toMatchObject({
      Authorization: `Bearer ${env.RESEND_API_KEY}`,
      'Content-Type': 'application/json',
    });
    expect(emailRequest.subject).not.toMatch(/[\r\n]/);
    expect(emailRequest.reply_to).toBe(validData.email);
    expect(emailRequest.from).toBe(`fextracode <${env.CONTACT_FROM}>`);
    expect(emailRequest.to).toEqual([env.CONTACT_TO]);
    expect(log).not.toHaveBeenCalled();
  });
});
