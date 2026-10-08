import { defineConfig, fontProviders } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import { cspDirectives, cspScriptResources } from './src/config/csp.ts';
import { serializeSitemapItem, sitemapI18n } from './src/config/seo.ts';

export default defineConfig({
  site: 'https://fextracode.com',
  integrations: [
    sitemap({
      i18n: sitemapI18n,
      serialize: serializeSitemapItem,
      filter: (page) => !/^\/(?:en\/)?404(?:\.html)?\/?$/.test(new globalThis.URL(page).pathname),
    }),
  ],
  output: 'static',
  build: { inlineStylesheets: 'always' },
  security: {
    csp: {
      directives: cspDirectives,
      scriptDirective: { resources: cspScriptResources },
      styleDirective: {
        resources: [{ resource: "'unsafe-inline'", kind: 'attribute' }],
      },
    },
  },
  markdown: { syntaxHighlight: false },
  i18n: {
    defaultLocale: 'es',
    locales: ['es', 'en'],
    routing: { prefixDefaultLocale: false },
  },
  fonts: [
    {
      provider: fontProviders.fontsource(),
      name: 'Syne',
      cssVariable: '--font-syne',
      weights: [700, 800],
      styles: ['normal'],
      subsets: ['latin', 'latin-ext'],
      fallbacks: ['sans-serif'],
    },
    {
      provider: fontProviders.fontsource(),
      name: 'Manrope',
      cssVariable: '--font-manrope',
      weights: [400, 500, 600, 700],
      styles: ['normal'],
      subsets: ['latin', 'latin-ext'],
      fallbacks: ['sans-serif'],
    },
    {
      provider: fontProviders.fontsource(),
      name: 'JetBrains Mono',
      cssVariable: '--font-jetbrains-mono',
      weights: [400, 500],
      styles: ['normal'],
      subsets: ['latin', 'latin-ext'],
      fallbacks: ['monospace'],
    },
  ],
});
