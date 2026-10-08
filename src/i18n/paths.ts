type Lang = 'es' | 'en';

export function getLangFromPathname(pathname: string): Lang {
  return pathname === '/en' || pathname.startsWith('/en/') ? 'en' : 'es';
}

export function getLangFromUrl(url: URL): Lang {
  return getLangFromPathname(url.pathname);
}

export function getAlternatePath(pathname: string, target: Lang): string {
  const withoutLocale = pathname.replace(/^\/en(?=\/|$)/, '') || '/';
  if (/^\/404(?:\.html)?\/?$/.test(withoutLocale)) return target === 'es' ? '/' : '/en/';
  const normalized = withoutLocale.startsWith('/') ? withoutLocale : `/${withoutLocale}`;
  let path = normalized === '/' ? '' : normalized.slice(1);
  const trailingSlash = path.endsWith('/');
  let comparablePath = trailingSlash ? path.slice(0, -1) : path;
  if (target === 'es') {
    if (comparablePath === 'privacy') comparablePath = 'privacidad';
    path = `${comparablePath}${trailingSlash ? '/' : ''}`;
    return path ? `/${path}` : '/';
  }
  if (comparablePath === 'privacidad') comparablePath = 'privacy';
  path = `${comparablePath}${trailingSlash ? '/' : ''}`;
  return path ? `/en/${path}` : '/en/';
}
