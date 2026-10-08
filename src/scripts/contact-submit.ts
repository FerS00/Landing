import type { ContactData } from './contact-core';

export type ContactFailureReason =
  'invalid' | 'captcha' | 'not-configured' | 'send-failed' | 'network';
export type ContactSubmitResult = { ok: true } | { ok: false; reason: ContactFailureReason };

export interface ContactSubmission extends ContactData {
  lang: 'es' | 'en';
  token: string;
  website: string;
}

export async function submitContact(data: ContactSubmission): Promise<ContactSubmitResult> {
  const controller = new AbortController();
  const timeout = window.setTimeout(() => controller.abort(), 10_000);
  try {
    const response = await fetch('/api/contact', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
      signal: controller.signal,
    });
    let result: { ok?: boolean; error?: ContactFailureReason };
    try {
      result = (await response.json()) as typeof result;
    } catch {
      return { ok: false, reason: 'network' };
    }
    if (response.ok && result.ok === true) return { ok: true };
    const reason = result.error;
    if (
      reason === 'invalid' ||
      reason === 'captcha' ||
      reason === 'not-configured' ||
      reason === 'send-failed'
    ) {
      return { ok: false, reason };
    }
    return { ok: false, reason: 'network' };
  } catch {
    return { ok: false, reason: 'network' };
  } finally {
    window.clearTimeout(timeout);
  }
}
