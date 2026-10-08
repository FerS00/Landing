import AxeBuilder from '@axe-core/playwright';
import { expect, test, type Page } from '@playwright/test';

const analyticsHosts =
  /https?:\/\/[^/]*(?:googletagmanager\.com|google-analytics\.com|analytics\.google\.com|clarity\.ms)\//i;

async function interceptAnalytics(page: Page) {
  const requests: string[] = [];
  await page.route(analyticsHosts, async (route) => {
    requests.push(route.request().url());
    await route.fulfill({ status: 200, contentType: 'application/javascript', body: '' });
  });
  return requests;
}

test('does not request analytics before consent or after rejection', async ({ page }) => {
  const requests = await interceptAnalytics(page);
  await page.goto('/');
  const banner = page.locator('[data-consent-banner]');
  await expect(banner).toBeVisible();
  expect(requests).toEqual([]);

  await banner.getByRole('button', { name: 'Rechazar' }).click();
  await expect(banner).toBeHidden();
  await page.reload();
  await expect(banner).toBeHidden();
  expect(requests).toEqual([]);
});

test('loads both providers only after acceptance and sets denied advertising consent', async ({
  page,
}) => {
  const requests = await interceptAnalytics(page);
  await page.goto('/');
  await page.locator('[data-consent-banner]').getByRole('button', { name: 'Aceptar' }).click();
  await expect.poll(() => requests.length).toBe(2);
  expect(requests.some((url) => url.includes('googletagmanager.com/gtag/js?id=G-TEST000000'))).toBe(
    true,
  );
  expect(requests.some((url) => url.includes('clarity.ms/tag/testclarity'))).toBe(true);
  const dataLayer = await page.evaluate(() =>
    (window as Window & { dataLayer?: unknown[][] }).dataLayer?.map((entry) => Array.from(entry)),
  );
  expect(dataLayer).toContainEqual([
    'consent',
    'default',
    {
      analytics_storage: 'denied',
      ad_storage: 'denied',
      ad_user_data: 'denied',
      ad_personalization: 'denied',
    },
  ]);
});

test('withdrawing consent updates both providers and removes Google cookies', async ({ page }) => {
  const requests = await interceptAnalytics(page);
  await page.goto('/');
  await page.locator('[data-consent-banner]').getByRole('button', { name: 'Aceptar' }).click();
  await expect.poll(() => requests.length).toBe(2);
  await page.evaluate(() => {
    document.cookie = '_ga=one; path=/';
    document.cookie = '_ga_TEST=two; path=/';
  });

  await page.getByRole('link', { name: 'Privacidad y cookies' }).click();
  await page
    .locator('[data-info-dialog="privacy"]')
    .getByRole('button', { name: 'Rechazar analítica' })
    .click();
  await expect(page.locator('[data-info-dialog="privacy"]')).toBeHidden();
  const queues = await page.evaluate(() => ({
    google: (window as Window & { dataLayer?: unknown[][] }).dataLayer?.map((entry) =>
      Array.from(entry),
    ),
    clarity: (window as Window & { clarity?: { q?: unknown[][] } }).clarity?.q,
    cookies: document.cookie,
    consent: localStorage.getItem('consent'),
  }));
  expect(queues.google).toContainEqual(['consent', 'update', { analytics_storage: 'denied' }]);
  expect(queues.clarity).toContainEqual(['consent', false]);
  expect(queues.cookies).not.toMatch(/(?:^|; )_ga(?:_|=)/);
  expect(JSON.parse(queues.consent ?? 'null')).toMatchObject({ value: 'denied', version: 1 });
});

test('footer preferences reopens the banner and visibility does not change document height', async ({
  page,
}) => {
  await page.goto('/');
  const banner = page.locator('[data-consent-banner]');
  const height = await page.evaluate(() => document.documentElement.scrollHeight);
  await expect(banner).toBeVisible();
  expect(await page.evaluate(() => document.documentElement.scrollHeight)).toBe(height);
  await banner.getByRole('button', { name: 'Rechazar' }).click();
  expect(await page.evaluate(() => document.documentElement.scrollHeight)).toBe(height);
  await page.getByRole('button', { name: 'Preferencias de cookies' }).click();
  await expect(banner).toBeVisible();
  expect(await page.evaluate(() => document.documentElement.scrollHeight)).toBe(height);
});

test('consent banner has no serious or critical axe violations', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('[data-consent-banner]')).toBeVisible();
  const results = await new AxeBuilder({ page }).analyze();
  expect(
    results.violations.filter((violation) =>
      ['serious', 'critical'].includes(violation.impact ?? ''),
    ),
  ).toEqual([]);
});
