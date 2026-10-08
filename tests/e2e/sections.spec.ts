import { expect, test } from '@playwright/test';

test('the orbit sprite keeps every local gradient reference and all ten logos', async ({
  page,
}) => {
  await page.goto('/');
  await expect(page.locator('.orbit use')).toHaveCount(10);
  const references = await page.locator('.logo-sprite').evaluate((sprite) => {
    const missing: string[] = [];
    for (const element of sprite.querySelectorAll('[fill], [stroke], [filter], [clip-path]')) {
      for (const attribute of element.attributes) {
        for (const match of attribute.value.matchAll(/url\(#([^)]*)\)/g)) {
          const id = match[1];
          if (id && !document.getElementById(id)) missing.push(id);
        }
      }
    }
    return { missing, python: sprite.querySelectorAll('#i-python path[fill^="url("]').length };
  });
  expect(references.missing).toEqual([]);
  expect(references.python).toBeGreaterThan(0);
});

for (const path of ['/', '/en/']) {
  test(`${path}: prototype presentation and short display name`, async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 900 });
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.goto(path);
    await page.evaluate(() => document.fonts.ready);
    await expect(page.locator('.hero h1')).toHaveAttribute('data-ready', 'true');
    const metrics = await page.evaluate(() => {
      const headline = document.querySelector('.hero h1')!;
      const gradient = document.querySelector('.hero .rotator')!;
      const contact = document.querySelector('#contact form')!;
      const submit = contact.querySelector('button[type="submit"]')!;
      const banner = document.querySelector('[data-consent-banner]')!;
      const activeFilter = document.querySelector('[data-project-filter="all"]')!;
      return {
        fontSize: Number.parseFloat(getComputedStyle(headline).fontSize),
        gradient: getComputedStyle(gradient).backgroundImage,
        buttonWidth: submit.getBoundingClientRect().width,
        formWidth: contact.getBoundingClientRect().width,
        bannerLeft: banner.getBoundingClientRect().left,
        bannerWidth: banner.getBoundingClientRect().width,
        filterBackground: getComputedStyle(activeFilter).backgroundColor,
      };
    });
    expect(metrics.fontSize).toBeGreaterThan(70);
    expect(metrics.gradient).toContain('linear-gradient');
    expect(Math.abs(metrics.buttonWidth - metrics.formWidth)).toBeLessThan(1);
    expect(metrics.bannerLeft).toBe(16);
    expect(metrics.bannerWidth).toBe(380);
    expect(metrics.filterBackground).not.toBe('rgba(0, 0, 0, 0)');
    await expect(page.locator('#contact .channel-value').nth(1)).toHaveText('Fernando Morales');
    await expect(page.locator('footer')).not.toContainText('Peña');
  });
}

test('all projects use the prototype rows at 1280px', async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 900 });
  await page.goto('/');
  await page.evaluate(() => document.fonts.ready);

  const layout = await page.locator('[data-project-grid]').evaluate((grid) => {
    const rectFor = (order: number) => {
      const card = grid.querySelector<HTMLElement>(`[data-project-order="${order}"]`);
      const rect = card?.getBoundingClientRect();
      return rect ? { top: rect.top, width: rect.width } : null;
    };
    return {
      gridWidth: grid.getBoundingClientRect().width,
      overseer: rectFor(1),
      operatix: rectFor(2),
      central: [rectFor(3), rectFor(4), rectFor(5)],
    };
  });

  expect(layout.overseer).not.toBeNull();
  expect(layout.operatix).not.toBeNull();
  expect(Math.abs(layout.overseer!.top - layout.operatix!.top)).toBeLessThan(1);
  expect(Math.abs(layout.overseer!.width / layout.gridWidth - 0.5)).toBeLessThan(0.03);
  expect(Math.abs(layout.operatix!.width / layout.gridWidth - 0.5)).toBeLessThan(0.03);
  const centralRows = layout.central.map((rect) => rect?.top);
  expect(centralRows.every((top) => top !== undefined && Math.abs(top - centralRows[0]!) < 1)).toBe(
    true,
  );
});

test('project grid recalculates its minimum height after resizing from mobile', async ({
  page,
}) => {
  const directPage = await page.context().newPage();
  await directPage.setViewportSize({ width: 1280, height: 900 });
  await directPage.goto('/');
  await directPage.evaluate(() => document.fonts.ready);
  const directHeight = await directPage.evaluate(() => document.documentElement.scrollHeight);
  await directPage.close();

  await page.setViewportSize({ width: 375, height: 900 });
  await page.goto('/');
  await page.evaluate(() => document.fonts.ready);
  await page.setViewportSize({ width: 1280, height: 900 });

  const firstCard = page.locator('[data-project-grid] [data-project-order="1"]');
  await expect
    .poll(() => firstCard.evaluate((card) => card.getBoundingClientRect().height))
    .toBeLessThan(320);
  await expect
    .poll(() =>
      page.evaluate(
        (expected) => Math.abs(document.documentElement.scrollHeight - expected),
        directHeight,
      ),
    )
    .toBeLessThanOrEqual(2);
});

test('project kind filters keep document height stable', async ({ page }) => {
  await page.goto('/');
  await page.evaluate(() => document.fonts.ready);
  const cards = page.locator('[data-project-grid] .project-card');
  const initialHeight = await page.evaluate(() => document.documentElement.scrollHeight);

  await page.getByRole('button', { name: 'Código público' }).click();
  await expect(page.locator('[data-project-grid] .project-card:not([hidden])')).toHaveCount(4);
  await page.getByRole('button', { name: 'Casos de estudio' }).click();
  await expect(page.locator('[data-project-grid] .project-card:not([hidden])')).toHaveCount(3);
  await page.getByRole('button', { name: 'Todos', exact: true }).click();
  await expect(page.locator('[data-project-grid] .project-card:not([hidden])')).toHaveCount(7);

  await expect(cards).toHaveCount(7);
  expect(await page.evaluate(() => document.documentElement.scrollHeight)).toBe(initialHeight);
});

test('Java filters projects and the technology chip clears the filter', async ({ page }) => {
  await page.goto('/');
  await page.evaluate(() => document.fonts.ready);
  await page.locator('[data-consent-banner]').getByRole('button', { name: 'Rechazar' }).click();
  await page.locator('.orbit').hover();
  await page.locator('.orbit [data-tech="Java"]').click();

  await expect(page.locator('[data-project-grid] .project-card:not([hidden])')).toHaveCount(2);
  await expect(page.locator('[data-tech-chip]')).toBeVisible();
  await expect(page.locator('[data-tech-chip]')).toContainText('Java');
  await page.locator('[data-tech-chip]').click();
  await expect(page.locator('[data-project-grid] .project-card:not([hidden])')).toHaveCount(7);
  await expect(page.locator('[data-tech-chip]')).toBeHidden();
});

test('Java in the stack list filters projects without orbit animation', async ({ page }) => {
  await page.goto('/');
  await page.evaluate(() => document.fonts.ready);
  await page.locator('.stack-list [data-tech="Java"]').click();

  await expect(page.locator('[data-project-grid] .project-card:not([hidden])')).toHaveCount(2);
  await expect(page.locator('[data-tech-chip]')).toBeVisible();
  await page.locator('[data-tech-chip]').click();
  await expect(page.locator('[data-project-grid] .project-card:not([hidden])')).toHaveCount(7);
});

test('invalid illustrative request shows the rejection verdict', async ({ page }) => {
  await page.goto('/');
  await page.evaluate(() => document.fonts.ready);
  await page.getByRole('button', { name: /Petición inválida/ }).click();
  await expect(page.locator('#flow-request')).toHaveText(
    'Registra 3 licencias para Acme a -40 USD.',
  );
  await expect(page.locator('#flow-verdict')).toHaveText(
    '✗ rechazada · price=-40 no cumple las reglas',
    {
      timeout: 8000,
    },
  );
});

test('the document height stays fixed while the flow demo runs', async ({ page }) => {
  await page.goto('/');
  await page.evaluate(() => document.fonts.ready);
  await page.locator('#flow').scrollIntoViewIfNeeded();
  await expect(page.locator('#flow .node').first()).toHaveClass(/active/, { timeout: 3000 });
  const height = await page.evaluate(() => document.documentElement.scrollHeight);
  const samples = await page.evaluate(async () => {
    const heights: number[] = [];
    for (let elapsed = 0; elapsed <= 6000; elapsed += 200) {
      heights.push(document.documentElement.scrollHeight);
      if (elapsed < 6000) await new Promise((resolve) => window.setTimeout(resolve, 200));
    }
    return heights;
  });

  expect(samples).toHaveLength(31);
  expect(samples.every((sample) => sample === height)).toBe(true);
});
