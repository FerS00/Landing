import AxeBuilder from '@axe-core/playwright';
import { expect, test, type Page } from '@playwright/test';

const routes = ['/', '/en/', '/faq/', '/privacidad/'];
const themes = ['dark', 'light'] as const;
const axeTags = ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'];

test.use({ reducedMotion: 'reduce' });

async function waitForStablePage(page: Page): Promise<void> {
  await page.evaluate(async () => {
    await document.fonts.ready;
    const finiteAnimations = document
      .getAnimations()
      .filter((animation) => Number.isFinite(animation.effect?.getComputedTiming().endTime));
    await Promise.all(
      finiteAnimations.map((animation) => animation.finished.catch(() => undefined)),
    );
  });
}

async function expectNoSeriousViolations(page: Page): Promise<void> {
  const results = await new AxeBuilder({ page }).withTags(axeTags).analyze();
  const violations = results.violations.filter(
    (violation) => violation.impact === 'serious' || violation.impact === 'critical',
  );

  expect(
    violations.map((violation) => ({
      id: violation.id,
      impact: violation.impact,
      selectors: violation.nodes.map((node) => node.target),
    })),
    'axe violations (id, impact, selectors)',
  ).toEqual([]);
}

for (const route of routes) {
  for (const theme of themes) {
    test(`${route} has no serious or critical axe violations in ${theme} theme`, async ({
      page,
    }) => {
      await page.addInitScript((selectedTheme) => {
        localStorage.setItem('theme', selectedTheme);
      }, theme);
      await page.goto(route);
      await waitForStablePage(page);
      if (route === '/' || route === '/en/') {
        const accessibleName =
          route === '/'
            ? 'Desarrollo backends, APIs, apps web, agentes de IA, licencias offline, apps Win32'
            : 'I build backends, APIs, web apps, AI agents, offline licensing, Win32 apps';
        await expect(page.getByRole('heading', { level: 1 })).toHaveAccessibleName(accessibleName);
      }
      await expectNoSeriousViolations(page);
    });
  }
}

for (const dialog of ['faq', 'privacy'] as const) {
  test(`home ${dialog} dialog has no serious or critical axe violations`, async ({ page }) => {
    await page.addInitScript(() => localStorage.setItem('theme', 'dark'));
    await page.goto('/');
    await page.locator(`footer [data-open-dialog="${dialog}"]`).click();
    await expect(page.locator(`[data-info-dialog="${dialog}"]`)).toBeVisible();
    await waitForStablePage(page);
    await expectNoSeriousViolations(page);
  });
}

test('consent banner and language labels have no serious axe violations', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('[data-consent-banner]')).toBeVisible();
  await waitForStablePage(page);

  const results = await new AxeBuilder({ page })
    .withRules(['label-content-name-mismatch'])
    .analyze();
  expect(
    results.violations.map((violation) => ({
      id: violation.id,
      impact: violation.impact,
      selectors: violation.nodes.map((node) => node.target),
    })),
    'axe violations including the experimental label-content-name-mismatch rule',
  ).toEqual([]);
});
