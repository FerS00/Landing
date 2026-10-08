const analyticsConfigured = Boolean(process.env.PUBLIC_GA_ID || process.env.PUBLIC_CLARITY_ID);

const cspSources = {
  'default-src': ["'self'"],
  'script-src': [
    "'self'",
    'https://challenges.cloudflare.com', // Turnstile se carga al interactuar con el formulario.
    ...(analyticsConfigured
      ? [
          'https://www.googletagmanager.com', // Carga gtag.js después de aceptar.
          'https://www.clarity.ms', // Carga el loader de Clarity después de aceptar.
          'https://scripts.clarity.ms', // Scripts auxiliares del loader de Clarity.
          'https://static.cloudflareinsights.com', // Cloudflare Web Analytics, configurado en Pages.
        ]
      : []),
  ],
  'img-src': [
    "'self'",
    'data:',
    ...(analyticsConfigured
      ? [
          'https://www.google-analytics.com', // Píxeles de medición de Google Analytics.
          'https://*.google-analytics.com', // Píxeles regionales de Google Analytics.
          'https://*.analytics.google.com', // Recursos de medición regionales de Google.
          'https://*.googletagmanager.com', // Recursos de medición de Google.
          'https://*.clarity.ms', // Recursos de Clarity.
        ]
      : []),
  ],
  'font-src': ["'self'"],
  'connect-src': [
    "'self'",
    'https://challenges.cloudflare.com', // Verificación de Turnstile.
    ...(analyticsConfigured
      ? [
          'https://*.google-analytics.com', // Envío de eventos de GA4.
          'https://*.analytics.google.com', // Endpoints regionales de GA4.
          'https://*.googletagmanager.com', // Conexiones del contenedor de Google.
          'https://*.clarity.ms', // Envío de eventos de Clarity.
          'https://c.bing.com', // Endpoint de consentimiento de Clarity.
          'https://cloudflareinsights.com', // Métricas agregadas de Cloudflare Web Analytics.
        ]
      : []),
  ],
  'object-src': ["'none'"],
  'frame-src': ['https://challenges.cloudflare.com'], // Iframe del widget de Turnstile.
  'base-uri': ["'self'"],
  'form-action': ["'self'"],
};

export const cspDirectives = [
  ...Object.entries(cspSources)
    .filter(([directive]) => directive !== 'script-src')
    .map(([directive, sources]) => `${directive} ${sources.join(' ')}`),
  'upgrade-insecure-requests',
];

export const cspScriptResources = cspSources['script-src'].map((resource) => ({
  resource,
  kind: 'default' as const,
}));
