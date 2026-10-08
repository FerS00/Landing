export type ConsentValue = 'granted' | 'denied';

export interface ConsentRecord {
  value: ConsentValue;
  version: 1;
  at: string;
}

export function hasAnalyticsConfig(gaId?: string, clarityId?: string): boolean {
  return Boolean(gaId?.trim() || clarityId?.trim());
}

export type AnalyticsEventName =
  | 'cta_click'
  | 'project_open'
  | 'filter_change'
  | 'terminal_command'
  | 'lang_switch'
  | 'theme_switch'
  | 'email_copy'
  | 'contact_submit';

const knownCommands = new Set([
  'help',
  'whoami',
  'projects',
  'stack',
  'contact',
  'faq',
  'privacy',
  'privacidad',
  'cookies',
  'lang',
  'theme',
  'matrix',
  'sudo',
  'clear',
]);
const knownTechnologies = new Set([
  'Java',
  'Java 21',
  'Spring Boot',
  'Angular',
  'React',
  'Python',
  'FastAPI',
  'LangGraph',
  'MySQL',
  'Docker',
  'C#',
  'C++',
  'TypeScript',
  'Win32',
  'SSE',
]);

export function readConsent(storage: Pick<Storage, 'getItem'> | null): ConsentRecord | null {
  if (!storage) return null;
  try {
    const raw = storage.getItem('consent');
    if (!raw) return null;
    const value: unknown = JSON.parse(raw);
    if (typeof value !== 'object' || value === null) return null;
    const record = value as Partial<ConsentRecord>;
    if (
      (record.value !== 'granted' && record.value !== 'denied') ||
      record.version !== 1 ||
      typeof record.at !== 'string' ||
      !Number.isFinite(Date.parse(record.at)) ||
      !/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/.test(record.at) ||
      new Date(record.at).toISOString() !== record.at
    )
      return null;
    return { value: record.value, version: 1, at: record.at };
  } catch {
    return null;
  }
}

export function writeConsent(
  storage: Pick<Storage, 'setItem'> | null,
  value: ConsentValue,
  at = new Date().toISOString(),
): boolean {
  if (!storage) return false;
  try {
    storage.setItem('consent', JSON.stringify({ value, version: 1, at } satisfies ConsentRecord));
    return true;
  } catch {
    return false;
  }
}

export function filterAnalyticsEvent(
  name: string,
  params: Record<string, unknown>,
): { name: AnalyticsEventName; params: Record<string, string> } | null {
  const safe = (key: string, allowed: readonly string[]) =>
    typeof params[key] === 'string' && allowed.includes(params[key] as string)
      ? (params[key] as string)
      : null;

  switch (name) {
    case 'cta_click': {
      const location = safe('location', ['hero', 'contact']);
      return location ? { name, params: { location } } : null;
    }
    case 'project_open': {
      const project = params.project;
      const kind = safe('kind', ['pub', 'priv']);
      if (typeof project !== 'string' || !/^[a-z0-9_-]{1,40}$/.test(project) || !kind) return null;
      return { name, params: { project, kind } };
    }
    case 'filter_change': {
      const type = safe('type', ['kind', 'tech']);
      const value = params.value;
      if (!type || typeof value !== 'string' || value.length > 40) return null;
      if (type === 'kind' && !['all', 'pub', 'priv'].includes(value)) return null;
      if (type === 'tech' && value !== 'all' && !knownTechnologies.has(value)) return null;
      return { name, params: { type, value } };
    }
    case 'terminal_command': {
      const command = safe('command', [...knownCommands]);
      return command ? { name, params: { command } } : null;
    }
    case 'lang_switch': {
      const to = safe('to', ['es', 'en']);
      return to ? { name, params: { to } } : null;
    }
    case 'theme_switch': {
      const to = safe('to', ['light', 'dark']);
      return to ? { name, params: { to } } : null;
    }
    case 'email_copy':
      return { name, params: {} };
    case 'contact_submit': {
      const result = safe('result', [
        'invalid',
        'not_configured',
        'sent',
        'error',
        'ok',
        'captcha',
        'not-configured',
        'send-failed',
        'network',
      ]);
      return result ? { name, params: { result } } : null;
    }
    default:
      return null;
  }
}

interface AnalyticsWindow extends Window {
  dataLayer?: IArguments[];
  gtag?: (...args: unknown[]) => void;
  clarity?: (...args: unknown[]) => void;
}

declare const window: AnalyticsWindow;

const hostWindow = typeof window === 'undefined' ? undefined : (window as AnalyticsWindow);
const root = typeof document === 'undefined' ? undefined : document.documentElement;
const banner =
  typeof document === 'undefined'
    ? null
    : document.querySelector<HTMLElement>('[data-consent-banner]');
const gaId = banner?.dataset.gaId ?? '';
const clarityId = banner?.dataset.clarityId ?? '';
const hasAnalytics = Boolean(hostWindow && root && hasAnalyticsConfig(gaId, clarityId));
let gaLoaded = false;
let clarityLoaded = false;

function loadGoogleAnalytics(): void {
  if (!hostWindow || !gaId || gaLoaded) return;
  hostWindow.dataLayer = hostWindow.dataLayer ?? [];
  hostWindow.gtag =
    hostWindow.gtag ??
    function gtag(...args: unknown[]) {
      hostWindow.dataLayer?.push(args as unknown as IArguments);
    };
  hostWindow.gtag('consent', 'default', {
    analytics_storage: 'denied',
    ad_storage: 'denied',
    ad_user_data: 'denied',
    ad_personalization: 'denied',
  });
  hostWindow.gtag('consent', 'update', {
    analytics_storage: 'granted',
    ad_storage: 'denied',
    ad_user_data: 'denied',
    ad_personalization: 'denied',
  });
  hostWindow.gtag('js', new Date());
  hostWindow.gtag('config', gaId);
  const script = document.createElement('script');
  script.async = true;
  script.src = `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(gaId)}`;
  document.head.append(script);
  gaLoaded = true;
}

function loadClarity(): void {
  if (!hostWindow || !clarityId || clarityLoaded) return;
  const queued: unknown[][] = [];
  const clarity = ((...args: unknown[]) => {
    queued.push(args);
  }) as AnalyticsWindow['clarity'] & {
    q?: unknown[][];
  };
  clarity.q = queued;
  hostWindow.clarity = hostWindow.clarity ?? clarity;
  hostWindow.clarity('consentv2', { ad_Storage: 'denied', analytics_Storage: 'granted' });
  const script = document.createElement('script');
  script.async = true;
  script.src = `https://www.clarity.ms/tag/${encodeURIComponent(clarityId)}`;
  document.head.append(script);
  clarityLoaded = true;
}

function expireGoogleCookies(): void {
  const hostParts = location.hostname.split('.');
  const domains = [
    '',
    `.${location.hostname}`,
    ...hostParts.slice(1).map((_, index) => `.${hostParts.slice(index + 1).join('.')}`),
  ];
  document.cookie.split(';').forEach((cookie) => {
    const name = cookie.split('=', 1)[0]?.trim();
    if (!name || (name !== '_ga' && !name.startsWith('_ga_'))) return;
    for (const domain of domains) {
      document.cookie = `${name}=; Max-Age=0; path=/${domain ? `; domain=${domain}` : ''}; SameSite=Lax`;
    }
  });
}

export function track(name: string, params: Record<string, unknown> = {}): void {
  if (!hasAnalytics || readConsent(safeLocalStorage())?.value !== 'granted') return;
  const event = filterAnalyticsEvent(name, params);
  if (!event) return;
  hostWindow?.gtag?.('event', event.name, event.params);
  hostWindow?.clarity?.('event', event.name);
}

function safeLocalStorage(): Storage | null {
  try {
    return hostWindow?.localStorage ?? null;
  } catch {
    return null;
  }
}

function setConsent(value: ConsentValue): void {
  if (!hostWindow) return;
  writeConsent(safeLocalStorage(), value);
  if (banner) banner.hidden = true;
  if (value === 'granted') {
    loadGoogleAnalytics();
    loadClarity();
    return;
  }
  if (gaLoaded) {
    hostWindow.gtag?.('consent', 'update', { analytics_storage: 'denied' });
    expireGoogleCookies();
  }
  if (clarityLoaded) hostWindow.clarity?.('consent', false);
}

if (hasAnalytics) {
  const existing = readConsent(safeLocalStorage());
  if (banner && !existing) banner.hidden = false;
  document.addEventListener('fx:open-consent', () => {
    if (banner) banner.hidden = false;
  });
  document.addEventListener('fx:consent', (event) => {
    const value = (event as CustomEvent<{ consent?: ConsentValue }>).detail?.consent;
    if (value === 'granted' || value === 'denied') setConsent(value);
  });
  banner?.addEventListener('click', (event) => {
    if (!(event.target instanceof Element)) return;
    const button = event.target.closest<HTMLButtonElement>('[data-banner-consent]');
    if (button?.dataset.bannerConsent === 'granted' || button?.dataset.bannerConsent === 'denied') {
      setConsent(button.dataset.bannerConsent);
    }
  });
  if (existing?.value === 'granted') {
    loadGoogleAnalytics();
    loadClarity();
  }

  document.addEventListener('click', (event) => {
    if (!(event.target instanceof Element)) return;
    const tracked = event.target.closest<HTMLElement>('[data-track]');
    if (tracked) {
      const eventName = tracked.dataset.track ?? '';
      if (eventName === 'cta_click') track(eventName, { location: tracked.dataset.trackLocation });
      if (eventName === 'lang_switch') track(eventName, { to: tracked.dataset.trackTo });
      if (eventName === 'email_copy') track(eventName);
      if (eventName === 'theme_switch')
        track(eventName, { to: root?.dataset.theme === 'light' ? 'light' : 'dark' });
    }
    const project = event.target.closest<HTMLElement>('[data-track-project]');
    if (project)
      track('project_open', {
        project: project.dataset.trackProject,
        kind: project.dataset.projectKind,
      });
    const filter = event.target.closest<HTMLElement>('[data-project-filter]');
    if (filter) track('filter_change', { type: 'kind', value: filter.dataset.projectFilter });
    const clearTechnology = event.target.closest<HTMLElement>('[data-tech-chip]');
    if (clearTechnology) track('filter_change', { type: 'tech', value: 'all' });
  });

  document.addEventListener('fx:terminal-command', (event) => {
    const command = (event as CustomEvent<{ command?: string }>).detail?.command;
    track('terminal_command', { command });
  });
  document.addEventListener('fx:filter-tech', (event) => {
    const tech = (event as CustomEvent<{ tech?: string | null }>).detail?.tech;
    if (tech) track('filter_change', { type: 'tech', value: tech });
  });
  document.addEventListener('fx:contact-submit', (event) => {
    const result = (event as CustomEvent<{ result?: string }>).detail?.result;
    track('contact_submit', { result });
  });
}
