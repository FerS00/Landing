import { getRelativeLocaleUrl } from 'astro:i18n';
import en from './en.json';
import es from './es.json';
import {
  getAlternatePath as getAlternatePathPure,
  getLangFromUrl as getLangFromUrlPure,
} from './paths';

export const LANGS = ['es', 'en'] as const;
export type Lang = (typeof LANGS)[number];

type TranslationPaths<T> = {
  [K in keyof T & string]: T[K] extends string
    ? K
    : T[K] extends Record<string, unknown>
      ? `${K}.${TranslationPaths<T[K]>}`
      : never;
}[keyof T & string];

export type TranslationKey = TranslationPaths<typeof es>;

const translations: Record<Lang, typeof es> = { es, en };

export function useTranslations(lang: Lang): (key: TranslationKey) => string {
  return (key) => {
    let value: unknown = translations[lang];
    for (const segment of key.split('.')) {
      if (typeof value !== 'object' || value === null || !(segment in value)) {
        throw new Error(`Unknown translation key: ${key}`);
      }
      value = (value as Record<string, unknown>)[segment];
    }
    if (typeof value !== 'string') throw new Error(`Unknown translation key: ${key}`);
    return value;
  };
}

export function getLangFromUrl(url: URL): Lang {
  return getLangFromUrlPure(url);
}

export function getAlternatePath(pathname: string, target: Lang): string {
  const alternate = getAlternatePathPure(pathname, target);
  const route = target === 'en' ? alternate.replace(/^\/en\/?/, '') : alternate.slice(1);
  return getRelativeLocaleUrl(target, route);
}
