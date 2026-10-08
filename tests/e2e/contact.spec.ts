import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';

const turnstileScript = `window.turnstile = {
  render(element, options) {
    window.__turnstileOptions = options;
    options.callback('test-turnstile-token');
    return 'test-widget';
  },
  reset() {}
};`;

async function mockTurnstile(page: import('@playwright/test').Page): Promise<void> {
  await page.route('https://challenges.cloudflare.com/**', async (route) => {
    await route.fulfill({ contentType: 'text/javascript', body: turnstileScript });
  });
}

async function fillContact(page: import('@playwright/test').Page): Promise<void> {
  await page.locator('#contact-name').fill('Ana');
  await page.locator('#contact-email').fill('ana@example.com');
  await page.locator('#contact-message').fill('Necesito una aplicación sencilla.');
}

test('loads Turnstile only after interaction, submits, and clears the form without layout shift', async ({
  page,
}) => {
  await mockTurnstile(page);
  let completeRequest!: () => void;
  const requestGate = new Promise<void>((resolve) => {
    completeRequest = resolve;
  });
  await page.route('**/api/contact', async (route) => {
    await requestGate;
    await route.fulfill({ contentType: 'application/json', body: JSON.stringify({ ok: true }) });
  });
  await page.goto('/');
  await expect(page.locator('script[src*="challenges.cloudflare.com"]')).toHaveCount(0);
  await fillContact(page);
  await expect(page.locator('script[src*="challenges.cloudflare.com"]')).toHaveCount(1);
  await expect(page.locator('[data-turnstile-token]')).toHaveValue('test-turnstile-token');

  const initialHeight = await page.locator('html').evaluate((element) => element.scrollHeight);
  await page.getByRole('button', { name: /Enviar mensaje|Send message/i }).click();
  await expect(page.getByRole('button', { name: /Enviando|Sending/i })).toBeDisabled();
  expect(await page.locator('html').evaluate((element) => element.scrollHeight)).toBe(
    initialHeight,
  );
  completeRequest();
  await expect(page.locator('[data-form-status]')).toHaveText('Gracias. Te responderé pronto.');
  await expect(page.locator('#contact-name')).toHaveValue('');
  await expect(page.locator('#contact-email')).toHaveValue('');
  await expect(page.locator('#contact-message')).toHaveValue('');
});

for (const response of [
  { error: 'captcha', message: 'No se pudo verificar el captcha. Inténtalo de nuevo.' },
  { error: 'send-failed', message: 'No se pudo enviar el mensaje. Inténtalo más tarde.' },
]) {
  test(`shows the ${response.error} response`, async ({ page }) => {
    await mockTurnstile(page);
    await page.route('**/api/contact', (route) =>
      route.fulfill({
        status: response.error === 'captcha' ? 403 : 502,
        contentType: 'application/json',
        body: JSON.stringify({ ok: false, error: response.error }),
      }),
    );
    await page.goto('/');
    await fillContact(page);
    await page.getByRole('button', { name: /Enviar mensaje|Send message/i }).click();
    await expect(page.locator('[data-form-status]')).toHaveText(response.message);
  });
}

test('contact section has no serious or critical axe violations', async ({ page }) => {
  await mockTurnstile(page);
  await page.goto('/');
  await page.locator('#contact').scrollIntoViewIfNeeded();
  const result = await new AxeBuilder({ page })
    .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
    .include('#contact')
    .analyze();
  expect(
    result.violations
      .filter((violation) => violation.impact === 'serious' || violation.impact === 'critical')
      .map((violation) => ({
        id: violation.id,
        selectors: violation.nodes.map((node) => node.target),
      })),
  ).toEqual([]);
});
