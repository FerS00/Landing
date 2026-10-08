import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { getAlternatePath, getLangFromUrl } from '../../src/i18n/paths';

const es = JSON.parse(readFileSync(new URL('../../src/i18n/es.json', import.meta.url), 'utf8')) as
  string | Record<string, unknown>;
const en = JSON.parse(readFileSync(new URL('../../src/i18n/en.json', import.meta.url), 'utf8')) as
  string | Record<string, unknown>;

function collectKeys(value: unknown, prefix = ''): string[] {
  if (typeof value !== 'object' || value === null) return [prefix];
  return Object.entries(value).flatMap(([key, child]) =>
    collectKeys(child, prefix ? `${prefix}.${key}` : key),
  );
}

function collectStrings(value: unknown): string[] {
  if (typeof value === 'string') return [value];
  if (typeof value !== 'object' || value === null) return [];
  return Object.values(value).flatMap(collectStrings);
}

describe('i18n dictionaries and paths', () => {
  it('has the same non-empty translation keys in both locales', () => {
    expect(collectKeys(es).sort()).toEqual(collectKeys(en).sort());
    expect(collectStrings(es).every((value) => value.trim().length > 0)).toBe(true);
    expect(collectStrings(en).every((value) => value.trim().length > 0)).toBe(true);
  });

  it.each([
    ['/', 'es'],
    ['/en/', 'en'],
    ['/en/faq', 'en'],
    ['/faq', 'es'],
  ])('detects %s as %s', (pathname, expected) => {
    expect(getLangFromUrl(new URL(pathname, 'https://fextracode.com'))).toBe(expected);
  });

  it.each([
    ['/', 'en', '/en/'],
    ['/en/', 'es', '/'],
    ['/en/faq', 'es', '/faq'],
    ['/faq', 'en', '/en/faq'],
    ['/privacidad', 'en', '/en/privacy'],
    ['/en/privacy', 'es', '/privacidad'],
    ['/privacidad/', 'en', '/en/privacy/'],
    ['/en/privacy/', 'es', '/privacidad/'],
    ['/404/', 'es', '/'],
    ['/404/', 'en', '/en/'],
    ['/en/404/', 'es', '/'],
    ['/en/404/', 'en', '/en/'],
    ['/404.html', 'es', '/'],
    ['/404.html', 'en', '/en/'],
    ['/privacidad', 'es', '/privacidad'],
    ['/en/privacy', 'en', '/en/privacy'],
  ])('maps %s to %s as %s', (pathname, lang, expected) => {
    expect(getAlternatePath(pathname, lang as 'es' | 'en')).toBe(expected);
  });
});
