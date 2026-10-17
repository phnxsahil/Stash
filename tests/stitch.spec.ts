import { test, expect } from '@playwright/test';

const preview = '/artifacts/stitch-preview.html';

test('approved primary screens fit both themes on mobile and desktop', async ({ page }) => {
  for (const screen of ['capture', 'library', 'stats', 'settings']) {
    for (const theme of ['dark', 'light']) {
      for (const width of [390, 1440]) {
        await page.setViewportSize({ width, height: 900 });
        await page.goto(`${preview}?screen=${screen}&theme=${theme}`);
        await expect(page.locator('.st-shell')).toBeVisible();
        await page.evaluate(() => document.fonts.ready);
        expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
        expect(await page.locator('.st-shell').evaluate(el => getComputedStyle(el).fontFamily)).toContain('Plus Jakarta Sans');
        if (width === 1440) await expect(page.getByRole('complementary', { name: 'Desktop navigation' })).toBeVisible();
      }
    }
  }
});

test('settings preserve callbacks and leave unavailable controls disabled', async ({ page }) => {
  await page.goto(`${preview}?screen=settings`);
  const autoAdd = page.getByRole('switch', { name: 'Auto-Add Top Match', exact: true });
  await expect(autoAdd).toBeChecked();
  await autoAdd.click();
  await expect(autoAdd).not.toBeChecked();
  await page.getByRole('combobox', { name: 'Default destination' }).click();
  await page.getByRole('option', { name: 'Very long playlist name to verify safe truncation' }).click();
  expect(await page.evaluate(() => (window as any).__playlist)).toBe('2');
  await page.getByRole('combobox', { name: 'Appearance' }).click();
  await page.getByRole('option', { name: 'Light', exact: true }).click();
  await expect(page.locator('html')).toHaveClass('light');
  await expect(page.getByRole('switch', { name: 'Push notifications — coming soon' })).toBeDisabled();
  await expect(page.getByRole('switch', { name: 'Haptic feedback — coming soon' })).toBeDisabled();
  await expect(page.getByRole('button', { name: /Export Stash History/ })).toBeDisabled();
  await expect(page.getByRole('button', { name: /Clear Match History/ })).toBeDisabled();
});

test('analytics keep period selection and the existing image download working', async ({ page }) => {
  await page.goto(`${preview}?screen=stats`);
  await page.getByRole('button', { name: 'Week', exact: true }).click();
  await expect(page.getByRole('button', { name: 'Week', exact: true })).toHaveAttribute('aria-pressed', 'true');
  await page.getByRole('button', { name: 'Share analytics' }).click();
  await expect(page.getByRole('dialog')).toBeVisible();
  await page.evaluate(() => document.fonts.ready);
  const download = page.waitForEvent('download');
  await page.getByRole('button', { name: 'Download Image' }).click();
  expect((await download).suggestedFilename()).toMatch(/^stash-stats-\d+\.png$/);
});

test('retained secondary pages stay centered without horizontal overflow', async ({ page }) => {
  for (const screen of ['about', 'privacy', 'help']) {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto(`${preview}?screen=${screen}`);
    await expect(page.locator('.st-secondary')).toBeVisible();
    const box = await page.locator('.st-secondary').boundingBox();
    expect(box!.width).toBeLessThanOrEqual(512);
    await page.setViewportSize({ width: 390, height: 844 });
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  }
});
