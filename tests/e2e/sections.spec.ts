import { expect, test } from '@playwright/test';

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
