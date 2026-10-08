import { chromium } from '@playwright/test';
import { existsSync } from 'node:fs';
import { mkdir, readFile } from 'node:fs/promises';
import { fileURLToPath, pathToFileURL } from 'node:url';
import path from 'node:path';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const templatePath = path.join(root, 'scripts', 'og-template.html');
const outputPath = path.join(root, 'public', 'og');
const distPath = path.join(root, 'dist');
const builtHtmlPath = path.join(distPath, 'index.html');

if (!existsSync(builtHtmlPath)) {
  throw new Error('Falta dist/index.html. Ejecuta "npm run build" antes de "npm run og".');
}

const builtHtml = await readFile(builtHtmlPath, 'utf8');
const fontFaceRules = [...builtHtml.matchAll(/@font-face\s*\{[^}]+\}/g)].map((match) => match[0]);

function getFont(name) {
  const rule = fontFaceRules.find((candidate) => {
    const family = candidate.match(/font-family:\s*(?:"([^"]+)"|'([^']+)'|([^;}]+))/);
    const value = family?.[1] ?? family?.[2] ?? family?.[3]?.trim();
    return value?.startsWith(`${name}-`) && !value.includes(' fallback:');
  });

  if (!rule) {
    throw new Error(`No se encontró la regla @font-face de ${name} en dist/index.html.`);
  }

  const family = rule.match(/font-family:\s*(?:"([^"]+)"|'([^']+)'|([^;}]+))/);
  const familyName = family?.[1] ?? family?.[2] ?? family?.[3]?.trim();
  if (!familyName) {
    throw new Error(`No se pudo leer el nombre de familia de ${name}.`);
  }

  const rules = fontFaceRules
    .filter((candidate) => {
      const match = candidate.match(/font-family:\s*(?:"([^"]+)"|'([^']+)'|([^;}]+))/);
      const value = match?.[1] ?? match?.[2] ?? match?.[3]?.trim();
      return value === familyName;
    })
    .map((candidate) =>
      candidate.replace(/url\((['"]?)(\/_astro\/fonts\/[^'")]+)['"]?\)/g, (_match, _quote, url) => {
        const fontPath = path.join(distPath, url.slice(1));
        if (!existsSync(fontPath)) {
          throw new Error(`No se encontró el archivo de fuente ${fontPath}.`);
        }
        return `url("${pathToFileURL(fontPath).href}")`;
      }),
    );

  if (rules.length === 0) {
    throw new Error(`No se extrajeron reglas @font-face de ${name}.`);
  }
  return { familyName, rules };
}

const syne = getFont('Syne');
const manrope = getFont('Manrope');
const fontStyles = `:root { --font-syne: "${syne.familyName}"; --font-manrope: "${manrope.familyName}"; }\n${[
  ...syne.rules,
  ...manrope.rules,
].join('\n')}`;

await mkdir(outputPath, { recursive: true });
const browser = await chromium.launch({ headless: true });

try {
  for (const lang of ['es', 'en']) {
    const page = await browser.newPage({
      viewport: { width: 1200, height: 630 },
      deviceScaleFactor: 1,
    });
    await page.goto(pathToFileURL(templatePath).href);
    await page.addStyleTag({ content: fontStyles });
    await page.evaluate((language) => {
      globalThis.document.documentElement.lang = language;
      const tagline = globalThis.document.querySelector('#tagline');
      if (tagline) {
        tagline.textContent =
          language === 'en'
            ? 'I build backends · APIs · web apps'
            : 'Desarrollo backends · APIs · apps web';
      }
    }, lang);
    await page.evaluate(() => globalThis.document.fonts.ready);
    const loadedFonts = await page.evaluate(
      ({ syneFamily, manropeFamily }) => ({
        syne: globalThis.document.fonts.check(`800 64px "${syneFamily}"`),
        manrope: globalThis.document.fonts.check(`400 29px "${manropeFamily}"`),
      }),
      { syneFamily: syne.familyName, manropeFamily: manrope.familyName },
    );
    if (!loadedFonts.syne) {
      throw new Error(
        `Syne 800 no cargó en Chromium (${syne.familyName}); no se generó og-${lang}.png.`,
      );
    }
    if (!loadedFonts.manrope) {
      throw new Error(
        `Manrope no cargó en Chromium (${manrope.familyName}); no se generó og-${lang}.png.`,
      );
    }
    await page.screenshot({ path: path.join(outputPath, `og-${lang}.png`) });
    await page.close();
  }
} finally {
  await browser.close();
}
