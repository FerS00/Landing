import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

const faqEs = JSON.parse(
  readFileSync(new URL('../../src/content/faq/es.json', import.meta.url), 'utf8'),
) as {
  items: { q: string; a: string; link?: string }[];
  cta: string;
};
const faqEn = JSON.parse(
  readFileSync(new URL('../../src/content/faq/en.json', import.meta.url), 'utf8'),
) as {
  items: { q: string; a: string; link?: string }[];
  cta: string;
};
const privacyEs = readFileSync(
  new URL('../../src/content/legal/privacy.es.md', import.meta.url),
  'utf8',
);
const privacyEn = readFileSync(
  new URL('../../src/content/legal/privacy.en.md', import.meta.url),
  'utf8',
);

describe('FAQ and legal content collections', () => {
  it('keeps seven valid FAQ entries in both locales', () => {
    expect(faqEs.items).toHaveLength(7);
    expect(faqEn.items).toHaveLength(7);
    expect(faqEs.items).toHaveLength(faqEn.items.length);
    for (const item of [...faqEs.items, ...faqEn.items]) {
      expect(item.q.trim()).not.toBe('');
      expect(item.a.trim()).not.toBe('');
      expect(item.link === undefined || item.link === 'privacy').toBe(true);
    }
    expect(faqEs.items.at(-1)?.link).toBe('privacy');
    expect(faqEn.items.at(-1)?.link).toBe('privacy');
    expect(faqEs.cta.trim()).not.toBe('');
    expect(faqEn.cta.trim()).not.toBe('');
  });

  it('includes the privacy table and matching analytics policy in both locales', () => {
    for (const content of [privacyEs, privacyEn]) {
      expect(content).toContain('|');
    }
    expect(privacyEs).toContain('Cloudflare Web Analytics');
    expect(privacyEn).toContain('Cloudflare Web Analytics');
    expect(privacyEs.toLowerCase()).not.toContain('borrador');
    expect(privacyEn.toLowerCase()).not.toContain('draft');
  });
});
