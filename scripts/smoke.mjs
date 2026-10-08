/* global console, URL, fetch */
import process from 'node:process';
import { setTimeout } from 'node:timers/promises';

const baseUrl = process.argv[2] ?? process.env.SMOKE_URL;

if (!baseUrl) {
  console.error('Uso: npm run smoke -- <url> o define SMOKE_URL.');
  process.exit(1);
}

let parsedBaseUrl;
try {
  parsedBaseUrl = new URL(baseUrl);
  if (!['http:', 'https:'].includes(parsedBaseUrl.protocol)) {
    throw new Error('El protocolo debe ser http o https.');
  }
} catch (error) {
  console.error(`URL base no válida: ${error.message}`);
  process.exit(1);
}

const base = parsedBaseUrl.href.endsWith('/') ? parsedBaseUrl.href : `${parsedBaseUrl.href}/`;
const missingPath = '__fextracode-smoke-route-that-does-not-exist__';

async function verifySite() {
  const request = async (path) => {
    const response = await fetch(new URL(path, base), { redirect: 'follow' });
    return { response, html: await response.text() };
  };

  const { response: homeResponse, html: home } = await request('/');
  if (homeResponse.status !== 200)
    throw new Error(`/ respondió ${homeResponse.status}; se esperaba 200.`);
  if (!/<html\b[^>]*\blang=["']es["']/i.test(home))
    throw new Error('/ no contiene <html lang="es">.');
  if (!/<title>\s*Fernando Morales · fextracode\s*<\/title>/i.test(home)) {
    throw new Error('/ no contiene el título esperado.');
  }
  if (!/<link\b[^>]*\bhreflang=["']en["']/i.test(home))
    throw new Error('/ no contiene hreflang="en".');
  if (!/<link\b[^>]*\brel=["']canonical["']/i.test(home))
    throw new Error('/ no contiene el enlace canonical.');

  const { response: englishResponse, html: english } = await request('/en/');
  if (englishResponse.status !== 200)
    throw new Error(`/en/ respondió ${englishResponse.status}; se esperaba 200.`);
  if (!/<html\b[^>]*\blang=["']en["']/i.test(english))
    throw new Error('/en/ no contiene <html lang="en">.');

  for (const path of ['/privacidad/', '/en/privacy/']) {
    const { response } = await request(path);
    if (response.status !== 200)
      throw new Error(`${path} respondió ${response.status}; se esperaba 200.`);
  }

  const { response: missingResponse } = await request(missingPath);
  if (missingResponse.status !== 404) {
    throw new Error(`/${missingPath} respondió ${missingResponse.status}; se esperaba 404.`);
  }
}

let lastError;
for (let attempt = 1; attempt <= 5; attempt += 1) {
  try {
    await verifySite();
    console.log(`Smoke test correcto: ${base}`);
    process.exit(0);
  } catch (error) {
    lastError = error;
    if (attempt < 5) {
      const delayMs = attempt * 3000;
      console.error(
        `Intento ${attempt}/5 falló: ${error.message} Reintento en ${delayMs / 1000} s.`,
      );
      await setTimeout(delayMs);
    }
  }
}

console.error(`Smoke test falló después de 5 intentos contra ${base}: ${lastError.message}`);
process.exit(1);
