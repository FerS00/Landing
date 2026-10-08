import { describe, expect, it } from 'vitest';
import {
  filterAnalyticsEvent,
  hasAnalyticsConfig,
  readConsent,
  writeConsent,
} from '../../src/lib/analytics';

describe('analytics build configuration', () => {
  it('requires at least one analytics identifier for any analytics UI or loading', () => {
    expect(hasAnalyticsConfig()).toBe(false);
    expect(hasAnalyticsConfig('', '  ')).toBe(false);
    expect(hasAnalyticsConfig('G-TEST000000')).toBe(true);
    expect(hasAnalyticsConfig(undefined, 'testclarity')).toBe(true);
  });
});

function memoryStorage(initial?: string): Storage {
  let value = initial ?? null;
  return {
    getItem: () => value,
    setItem: (_key: string, next: string) => {
      value = next;
    },
  } as unknown as Storage;
}

describe('consent storage', () => {
  it('writes and reads a versioned decision with an ISO timestamp', () => {
    const storage = memoryStorage();
    expect(writeConsent(storage, 'granted', '2026-10-08T12:00:00.000Z')).toBe(true);
    expect(storage.getItem('consent')).toBe(
      '{"value":"granted","version":1,"at":"2026-10-08T12:00:00.000Z"}',
    );
    expect(readConsent(storage)).toEqual({
      value: 'granted',
      version: 1,
      at: '2026-10-08T12:00:00.000Z',
    });
  });

  it.each([
    '{',
    '"granted"',
    '{"value":"accepted","version":1,"at":"2026-10-08T12:00:00.000Z"}',
    '{"value":"denied","version":2,"at":"2026-10-08T12:00:00.000Z"}',
    '{"value":"denied","version":1,"at":"invalid"}',
  ])('rejects invalid stored data %s', (value) => {
    expect(readConsent(memoryStorage(value))).toBeNull();
  });

  it('handles missing and unavailable storage', () => {
    expect(readConsent(null)).toBeNull();
    expect(writeConsent(null, 'denied')).toBe(false);
    const blocked = {
      getItem: () => {
        throw new Error('blocked');
      },
      setItem: () => {
        throw new Error('blocked');
      },
    } as unknown as Storage;
    expect(readConsent(blocked)).toBeNull();
    expect(writeConsent(blocked, 'denied')).toBe(false);
  });
});

describe('analytics event filter', () => {
  it('keeps only the permitted fields and excludes personal data', () => {
    expect(
      filterAnalyticsEvent('cta_click', {
        location: 'contact',
        email: 'person@example.com',
        message: 'private text',
      }),
    ).toEqual({ name: 'cta_click', params: { location: 'contact' } });
    expect(
      filterAnalyticsEvent('project_open', { project: 'overseer', kind: 'pub', email: 'a@b.com' }),
    ).toEqual({ name: 'project_open', params: { project: 'overseer', kind: 'pub' } });
  });

  it('discards unknown commands and values that could contain free text', () => {
    expect(filterAnalyticsEvent('terminal_command', { command: 'unknown-private-command' })).toBe(
      null,
    );
    expect(
      filterAnalyticsEvent('terminal_command', { command: 'contact', text: 'email me' }),
    ).toEqual({ name: 'terminal_command', params: { command: 'contact' } });
    expect(
      filterAnalyticsEvent('filter_change', { type: 'tech', value: 'person@example.com' }),
    ).toBe(null);
    expect(filterAnalyticsEvent('contact_submit', { result: 'sent', email: 'a@b.com' })).toEqual({
      name: 'contact_submit',
      params: { result: 'sent' },
    });
    expect(
      filterAnalyticsEvent('contact_submit', { result: 'ok', message: 'private text' }),
    ).toEqual({
      name: 'contact_submit',
      params: { result: 'ok' },
    });
    expect(filterAnalyticsEvent('unknown_event', { value: 'anything' })).toBeNull();
  });
});
