import { expect, test } from '@playwright/test';

test('Spanish and English pages expose locale metadata and equivalent routes', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('html')).toHaveAttribute('lang', 'es');
  await expect(page).toHaveTitle('Fernando Morales · fextracode');
  await expect(page.locator('link[hreflang="es"]')).toHaveCount(1);
  await expect(page.locator('link[hreflang="en"]')).toHaveCount(1);
  await expect(page.locator('link[hreflang="x-default"]')).toHaveCount(1);
  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute(
    'href',
    'https://fextracode.com/',
  );

  const languageLinks = page.locator('.seg a');
  for (const width of [375, 1280]) {
    await page.setViewportSize({ width, height: 800 });
    const linksFit = await languageLinks.evaluateAll((links) =>
      links.every((link) => link.scrollWidth <= link.clientWidth),
    );
    expect(linksFit).toBe(true);
  }

  await page.setViewportSize({ width: 1280, height: 800 });
  await page.getByRole('link', { name: /^EN/ }).click();
  await expect(page).toHaveURL(/\/en\/$/);
  await expect(page.locator('html')).toHaveAttribute('lang', 'en');
  await page.getByRole('link', { name: /^ES/ }).click();
  await expect(page).toHaveURL(/\/$/);
});

test('theme choice persists and the skip link receives the first Tab', async ({ page }) => {
  await page.goto('/');
  const button = page.getByRole('button', { name: /Switch to|Cambiar a tema/ });
  await button.click();
  await expect(page.locator('html')).toHaveAttribute('data-theme', /^(light|dark)$/);
  const selectedTheme = await page.locator('html').getAttribute('data-theme');
  expect(selectedTheme).toMatch(/^(light|dark)$/);

  await page.reload();
  await expect(page.locator('html')).toHaveAttribute('data-theme', selectedTheme!);

  await page.keyboard.press('Tab');
  await expect(page.getByRole('link', { name: 'Saltar al contenido' })).toBeFocused();
});
