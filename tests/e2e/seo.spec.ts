import { expect, test } from '@playwright/test';

test('SEO metadata and CSP work across localized routes and interactive controls', async ({
  page,
}) => {
  const cspMessages: string[] = [];
  page.on('console', (message) => {
    if (/content security policy/i.test(message.text())) cspMessages.push(message.text());
  });

  for (const route of ['/', '/en/', '/faq/', '/privacidad/']) {
    await page.goto(route);
    await expect(page.locator('meta[http-equiv="content-security-policy"]')).toHaveCount(1);
    await expect(page.locator('meta[property="og:image"]')).toHaveAttribute(
      'content',
      `https://fextracode.com/og/og-${route.startsWith('/en/') ? 'en' : 'es'}.png`,
    );

    if (route === '/' || route === '/en/') {
      await page.locator('[data-theme-toggle]').click();
      const input = page.locator('[data-terminal-input]');
      await input.fill('faq');
      await input.press('Enter');
      await expect(page.locator('[data-info-dialog="faq"]')).toBeVisible();
      await page.keyboard.press('Escape');
      await input.fill('privacy');
      await input.press('Enter');
      await expect(page.locator('[data-info-dialog="privacy"]')).toBeVisible();
      await page.keyboard.press('Escape');
    }
  }

  const missing = await page.goto('/no-existe');
  expect(missing?.status()).toBe(404);
  await expect(page.getByRole('heading', { name: 'Página no encontrada' })).toBeVisible();
  await expect(page.getByRole('main').getByRole('link', { name: 'English' })).toHaveAttribute(
    'href',
    '/en/',
  );
  await expect(page.locator('.seg a[lang="en"]')).toHaveAttribute('href', '/en/');
  await expect(page.locator('link[rel="canonical"]')).toHaveCount(0);
  await expect(page.locator('link[hreflang]')).toHaveCount(0);
  await expect(page.locator('meta[name="robots"][content*="noindex"]')).toHaveCount(1);
  expect(cspMessages).toEqual([]);
});
