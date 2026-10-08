import { expect, test } from '@playwright/test';

const locales = [
  { path: '/', lang: 'es' },
  { path: '/en/', lang: 'en' },
];

for (const locale of locales) {
  test(`${locale.lang}: document and hero heights stay fixed for eight seconds`, async ({
    page,
  }) => {
    await page.goto(locale.path);
    await page.evaluate(() => document.fonts.ready);
    await expect(page.locator('.hero h1')).toHaveAttribute('data-ready', 'true');

    const initial = await page.evaluate(() => ({
      document: document.documentElement.scrollHeight,
      hero: document.querySelector('.hero')?.getBoundingClientRect().height,
    }));
    const samples = await page.evaluate(async () => {
      const values: { document: number; hero: number | undefined }[] = [];
      for (let elapsed = 0; elapsed <= 8000; elapsed += 200) {
        values.push({
          document: document.documentElement.scrollHeight,
          hero: document.querySelector('.hero')?.getBoundingClientRect().height,
        });
        if (elapsed < 8000) await new Promise((resolve) => window.setTimeout(resolve, 200));
      }
      return values;
    });

    expect(samples).toHaveLength(41);
    expect(samples.every((sample) => sample.document === initial.document)).toBe(true);
    expect(samples.every((sample) => sample.hero === initial.hero)).toBe(true);
  });

  for (const width of [375, 768, 1280]) {
    test(`${locale.lang}: visible main text fits at ${width}px`, async ({ page }) => {
      await page.setViewportSize({ width, height: 900 });
      await page.goto(locale.path);
      await page.evaluate(() => document.fonts.ready);

      const overflow = await page.locator('main').evaluate((main) => {
        const walker = document.createTreeWalker(main, NodeFilter.SHOW_TEXT);
        const overflowing: {
          text: string;
          rangeWidth: number;
          container: string;
          containerWidth: number;
        }[] = [];
        const viewport = { left: 0, right: document.documentElement.clientWidth };

        while (walker.nextNode()) {
          const node = walker.currentNode;
          const text = node.textContent?.trim() ?? '';
          const element = node.parentElement;
          if (!text || !element) continue;
          if (element.closest('[aria-hidden="true"], .sr-only')) continue;
          if (element.getClientRects().length === 0) continue;
          if (getComputedStyle(element).visibility === 'hidden') continue;

          const range = document.createRange();
          range.selectNodeContents(node);
          const rect = range.getBoundingClientRect();

          let containerElement: HTMLElement | null = element;
          while (containerElement) {
            const style = getComputedStyle(containerElement);
            if (style.overflowX !== 'visible' || style.overflowY !== 'visible') break;
            containerElement = containerElement.parentElement;
          }

          const containerRect = containerElement?.getBoundingClientRect() ?? viewport;
          const containerWidth =
            containerElement?.clientWidth ?? document.documentElement.clientWidth;
          const description = containerElement
            ? `${containerElement.tagName.toLowerCase()}${containerElement.className ? `.${String(containerElement.className).replaceAll(' ', '.')}` : ''}`
            : 'viewport';

          if (rect.left < containerRect.left - 1 || rect.right > containerRect.right + 1) {
            overflowing.push({
              text,
              rangeWidth: rect.width,
              container: description,
              containerWidth,
            });
          }
        }

        return {
          overflowing,
          documentScrollWidth: document.documentElement.scrollWidth,
          documentClientWidth: document.documentElement.clientWidth,
        };
      });

      expect(overflow.documentScrollWidth).toBeLessThanOrEqual(overflow.documentClientWidth);
      expect(overflow.overflowing).toEqual([]);
    });
  }
}

test('terminal runs help and projects scrolls to #work', async ({ page }) => {
  await page.goto('/');
  const input = page.getByLabel('Escribe un comando');

  await input.fill('help');
  await input.press('Enter');
  await expect(page.locator('[data-terminal-output]')).toContainText('comandos:');

  await input.fill('projects');
  await input.press('Enter');
  await expect(page.locator('[data-terminal-output]')).toContainText('Overseer');
  await expect.poll(() => page.evaluate(() => window.scrollY)).toBeGreaterThan(0);
});

for (const locale of locales) {
  test(`${locale.lang}: reduced motion shows the full terminal intro immediately`, async ({
    page,
  }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.goto(locale.path);

    await expect(page.locator('[data-terminal-output]')).toContainText(
      locale.lang === 'es' ? "Escribe 'help' para ver comandos." : "Type 'help' to see commands.",
    );
  });
}
