import { expect, test } from '@playwright/test';

test('navigation FAQ opens, privacy link switches dialogs, and Escape restores focus', async ({
  page,
}) => {
  await page.goto('/');
  await expect(page.locator('html')).toHaveAttribute('data-dialogs-ready', 'true');
  const faqButton = page.getByRole('button', { name: 'FAQ' });
  await faqButton.click();
  const faq = page.locator('[data-info-dialog="faq"]');
  await expect(faq).toBeVisible();
  await faq.locator('details').last().locator('summary').click();

  await faq.getByRole('button', { name: 'política de privacidad' }).click();
  await expect(faq).not.toBeVisible();
  const privacy = page.locator('[data-info-dialog="privacy"]');
  await expect(privacy).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(privacy).not.toBeVisible();
  await expect(faqButton).toBeFocused();
});

test('the faq terminal command opens the FAQ dialog', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('html')).toHaveAttribute('data-dialogs-ready', 'true');
  await expect(page.locator('.terminal')).toHaveAttribute('data-ready', 'true');
  const input = page.getByLabel('Escribe un comando');
  await input.fill('faq');
  await input.focus();
  await page.keyboard.press('Enter');
  const faq = page.locator('[data-info-dialog="faq"]');
  await expect(faq).toBeVisible();
  await page.waitForTimeout(500);
  await expect(faq).toBeVisible();
});

test('terminal suggestion buttons keep the FAQ open after Enter and Space activation', async ({
  page,
}) => {
  await page.goto('/');
  await expect(page.locator('html')).toHaveAttribute('data-dialogs-ready', 'true');
  await expect(page.locator('.terminal')).toHaveAttribute('data-ready', 'true');
  const suggestion = page.locator('.terminal-hints button').first();
  await suggestion.evaluate((button) => button.setAttribute('data-command', 'faq'));

  for (const key of ['Enter', 'Space']) {
    await suggestion.focus();
    await page.keyboard.press(key);
    const faq = page.locator('[data-info-dialog="faq"]');
    await expect(faq).toBeVisible();
    await page.waitForTimeout(500);
    await expect(faq).toBeVisible();
    await page.keyboard.press('Escape');
    await expect(faq).not.toBeVisible();
  }
});

test('privacy routes render the correct language and reciprocal hreflang links', async ({
  page,
}) => {
  for (const route of [
    { path: '/privacidad/', lang: 'es', es: '/privacidad/', en: '/en/privacy/' },
    { path: '/en/privacy/', lang: 'en', es: '/privacidad/', en: '/en/privacy/' },
  ]) {
    await page.goto(route.path);
    await expect(page.locator('html')).toHaveAttribute('lang', route.lang);
    await expect(page.locator('link[hreflang="es"]')).toHaveAttribute(
      'href',
      new RegExp(`${route.es.replaceAll('/', '\\/')}$`),
    );
    await expect(page.locator('link[hreflang="en"]')).toHaveAttribute(
      'href',
      new RegExp(`${route.en.replaceAll('/', '\\/')}$`),
    );
    await expect(page.locator('h1')).toBeVisible();
  }
});

test('empty contact form shows three reserved validation lines without changing page height', async ({
  page,
}) => {
  await page.goto('/');
  const height = await page.evaluate(() => document.documentElement.scrollHeight);
  await page.locator('[data-contact-form] button[type="submit"]').click();
  await expect(page.locator('#contact-name')).toHaveAttribute('aria-invalid', 'true');
  await expect(page.locator('#contact-email')).toHaveAttribute('aria-invalid', 'true');
  await expect(page.locator('#contact-message')).toHaveAttribute('aria-invalid', 'true');
  await expect(page.locator('#error-name')).toHaveText('Escribe tu nombre.');
  await expect(page.locator('#error-email')).toHaveText('Escribe tu email.');
  await expect(page.locator('#error-message')).toHaveText('Escribe un mensaje.');
  await expect(page.locator('#contact-name')).toBeFocused();
  expect(await page.evaluate(() => document.documentElement.scrollHeight)).toBe(height);
});

test('valid contact form submits and clears the fields', async ({ page }) => {
  await page.route('https://challenges.cloudflare.com/**', (route) =>
    route.fulfill({
      contentType: 'text/javascript',
      body: `window.turnstile = { render(element, options) { options.callback('test-token'); return 'test-widget'; }, reset() {} };`,
    }),
  );
  await page.route('**/api/contact', (route) =>
    route.fulfill({ contentType: 'application/json', body: JSON.stringify({ ok: true }) }),
  );
  await page.goto('/');
  await page.locator('#contact-name').fill('Ana');
  await page.locator('#contact-email').fill('ana@example.com');
  await page.locator('#contact-message').fill('I would like to discuss a project.');
  await page.locator('[data-contact-form] button[type="submit"]').click();
  await expect(page.locator('[data-form-status]')).toHaveText('Gracias. Te responderé pronto.');
  await expect(page.locator('#contact-name')).toHaveValue('');
});

test('copy email button keeps its width after copying', async ({ page }) => {
  await page.context().grantPermissions(['clipboard-read', 'clipboard-write']);
  await page.goto('/');
  const button = page.locator('[data-copy-email]');
  const before = await button.evaluate((element) => element.getBoundingClientRect().width);
  await button.click();
  await expect(button).toHaveText('Copiado');
  const after = await button.evaluate((element) => element.getBoundingClientRect().width);
  expect(after).toBe(before);
});

test('contact text and open dialogs fit at 375px', async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 800 });
  await page.goto('/');
  await page.evaluate(() => document.fonts.ready);
  const checkScope = async (selector: string) => {
    const overflow = await page.locator(selector).evaluate((scope) => {
      const walker = document.createTreeWalker(scope, NodeFilter.SHOW_TEXT);
      const issues: string[] = [];
      while (walker.nextNode()) {
        const node = walker.currentNode;
        const text = node.textContent?.trim() ?? '';
        const element = node.parentElement;
        if (!text || !element || element.getClientRects().length === 0) continue;
        const range = document.createRange();
        range.selectNodeContents(node);
        const rect = range.getBoundingClientRect();
        let container: HTMLElement | null = element;
        while (container) {
          const style = getComputedStyle(container);
          if (style.overflowX !== 'visible' || style.overflowY !== 'visible') break;
          container = container.parentElement;
        }
        if (!container) continue;
        const style = getComputedStyle(container);
        const bounds = container.getBoundingClientRect();
        if (style.overflowX === 'auto' || style.overflowX === 'scroll') {
          const parentBounds = container.parentElement?.getBoundingClientRect();
          const viewportBounds = {
            left: 0,
            right: document.documentElement.clientWidth,
          };
          const containingBounds = parentBounds ?? viewportBounds;
          if (
            bounds.left < containingBounds.left - 1 ||
            bounds.right > containingBounds.right + 1
          ) {
            issues.push(text);
          }
        } else if (rect.left < bounds.left - 1 || rect.right > bounds.right + 1) {
          issues.push(text);
        }
      }
      return issues;
    });
    expect(overflow).toEqual([]);
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= document.documentElement.clientWidth,
      ),
    ).toBe(true);
  };

  await checkScope('#contact');
  await expect(page.locator('html')).toHaveAttribute('data-dialogs-ready', 'true');
  for (const id of ['faq', 'privacy']) {
    await page.evaluate((dialogId) => {
      document.dispatchEvent(new CustomEvent('fx:open-dialog', { detail: { id: dialogId } }));
    }, id);
    await expect(page.locator(`[data-info-dialog="${id}"]`)).toBeVisible();
    await checkScope(`[data-info-dialog="${id}"]`);
    await page.keyboard.press('Escape');
  }
  await page.goto('/privacidad/');
  await page.evaluate(() => document.fonts.ready);
  await checkScope('.legal-page');
});

test('copy email falls back to selecting the address when clipboard access is denied', async ({
  page,
}) => {
  await page.context().clearPermissions();
  await page.goto('/');
  const button = page.locator('[data-copy-email]');
  const before = await button.evaluate((element) => element.getBoundingClientRect().width);
  await button.click();
  await expect(button).toHaveText('Copiar');
  await expect
    .poll(() => page.evaluate(() => window.getSelection()?.toString() ?? ''))
    .toBe('moralespenafernando@gmail.com');
  const after = await button.evaluate((element) => element.getBoundingClientRect().width);
  expect(after).toBe(before);
});
