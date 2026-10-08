import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';
import { serializeSitemapItem, serializeStructuredData, sitemapI18n } from '../../src/config/seo';

const root = process.cwd();

describe('SEO configuration', () => {
  it('defines locale mappings and all six localized page routes for the sitemap', () => {
    expect(sitemapI18n).toEqual({
      defaultLocale: 'es',
      locales: { es: 'es-ES', en: 'en-US' },
    });

    const routes = [
      'src/pages/index.astro',
      'src/pages/en/index.astro',
      'src/pages/faq.astro',
      'src/pages/en/faq.astro',
      'src/pages/privacidad.astro',
      'src/pages/en/privacy.astro',
    ];
    expect(routes.every((route) => existsSync(resolve(root, route)))).toBe(true);
    expect(routes).toHaveLength(6);

    const urls = [
      'https://fextracode.com/',
      'https://fextracode.com/en/',
      'https://fextracode.com/faq/',
      'https://fextracode.com/en/faq/',
      'https://fextracode.com/privacidad/',
      'https://fextracode.com/en/privacy/',
    ];
    for (const url of urls) {
      expect(serializeSitemapItem({ url }).links).toHaveLength(2);
    }
  });

  it.each(['es', 'en'] as const)('emits valid %s JSON-LD and escapes HTML delimiters', (lang) => {
    const serialized = serializeStructuredData(lang);
    const data = JSON.parse(serialized) as {
      '@graph': { '@type': string; inLanguage?: string; sameAs?: string[] }[];
    };

    expect(serialized).not.toContain('<');
    expect(data['@graph'].map((item) => item['@type'])).toEqual(['Person', 'WebSite']);
    expect(data['@graph'][0]?.sameAs).toContain('https://github.com/FerS00');
    expect(data['@graph'][1]?.inLanguage).toBe(lang);
  });

  it('includes the custom static 404 page source', () => {
    expect(existsSync(resolve(root, 'src/pages/404.astro'))).toBe(true);
  });

  it.each(['es', 'en'])('includes a valid 1200×630 %s Open Graph PNG', (lang) => {
    const image = readFileSync(resolve(root, `public/og/og-${lang}.png`));
    expect(image.subarray(0, 8)).toEqual(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]));
    expect(image.readUInt32BE(16)).toBe(1200);
    expect(image.readUInt32BE(20)).toBe(630);
  });
});
