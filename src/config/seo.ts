export const sitemapI18n = {
  defaultLocale: 'es',
  locales: { es: 'es-ES', en: 'en-US' },
};

const localizedAlternates: Record<string, { url: string; lang: string }[]> = {
  'https://fextracode.com/': [
    { url: 'https://fextracode.com/', lang: 'es-ES' },
    { url: 'https://fextracode.com/en/', lang: 'en-US' },
  ],
  'https://fextracode.com/en/': [
    { url: 'https://fextracode.com/', lang: 'es-ES' },
    { url: 'https://fextracode.com/en/', lang: 'en-US' },
  ],
  'https://fextracode.com/faq/': [
    { url: 'https://fextracode.com/faq/', lang: 'es-ES' },
    { url: 'https://fextracode.com/en/faq/', lang: 'en-US' },
  ],
  'https://fextracode.com/en/faq/': [
    { url: 'https://fextracode.com/faq/', lang: 'es-ES' },
    { url: 'https://fextracode.com/en/faq/', lang: 'en-US' },
  ],
  'https://fextracode.com/privacidad/': [
    { url: 'https://fextracode.com/privacidad/', lang: 'es-ES' },
    { url: 'https://fextracode.com/en/privacy/', lang: 'en-US' },
  ],
  'https://fextracode.com/en/privacy/': [
    { url: 'https://fextracode.com/privacidad/', lang: 'es-ES' },
    { url: 'https://fextracode.com/en/privacy/', lang: 'en-US' },
  ],
};

type SitemapEntry = { url: string; links?: { url: string; lang: string }[] };

export function serializeSitemapItem(item: SitemapEntry): SitemapEntry {
  const links = localizedAlternates[item.url];
  return links ? { ...item, links } : item;
}

export type SiteLanguage = 'es' | 'en';

export function createStructuredData(lang: SiteLanguage) {
  return {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'Person',
        name: 'Fernando Morales',
        url: 'https://fextracode.com/',
        jobTitle: 'Software Developer',
        email: 'mailto:moralespenafernando@gmail.com',
        sameAs: [
          'https://github.com/FerS00',
          'https://linkedin.com/in/fernando-trinidad-morales-pe%C3%B1a-3632b2391',
          'https://t.me/FerS_00',
        ],
        knowsLanguage: ['es', 'en'],
      },
      {
        '@type': 'WebSite',
        url: 'https://fextracode.com/',
        name: 'Fernando Morales · fextracode',
        inLanguage: lang,
      },
    ],
  };
}

export function serializeStructuredData(lang: SiteLanguage): string {
  return JSON.stringify(createStructuredData(lang)).replace(/</g, '\\u003c');
}
