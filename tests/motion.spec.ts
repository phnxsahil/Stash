import { test, expect } from '@playwright/test';

test('scroll motion reveals content without narrow overflow', async ({ page }) => {
  await page.route('**/*', route => new URL(route.request().url()).origin === 'http://localhost:3000' ? route.continue() : route.abort());
  await page.route('**/auth/v1/**', route => route.fulfill({ status: 401, json: {} }));
  await page.addInitScript(() => localStorage.setItem('stash-theme', 'dark'));
  for (const width of [320, 390, 768, 1280]) {
    await page.setViewportSize({ width, height: 900 });
    await page.goto('/');
    await expect(page.locator('.record-scene')).toHaveCSS('opacity', '1');
    await page.locator('.record-scene').hover();
    await page.screenshot({ path: `/downloads/stash-motion-hero-${width}.png`, animations: 'disabled' });
    const before = await page.locator('.vinyl-record').evaluate(el => getComputedStyle(el).transform);
    await page.getByRole('link', { name: 'How it works' }).click();
    await expect.poll(() => page.locator('#how-it-works').evaluate(el => Math.round(el.getBoundingClientRect().top))).toBeLessThan(130);
    await expect.poll(() => page.evaluate(() => Math.round(scrollY))).toBeGreaterThan(500);
    await expect(page.getByRole('heading', { name: 'Bring the moment' })).toBeVisible();
    await expect(page.locator('.discovery-step').first()).toHaveCSS('opacity', '1');
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(width);
    await expect.poll(() => page.locator('.vinyl-record').evaluate(el => getComputedStyle(el).transform)).not.toBe(before);
    await page.screenshot({ path: `/downloads/stash-motion-scroll-${width}.png`, animations: 'disabled' });
    await page.getByRole('button', { name: 'Privacy', exact: true }).click();
    await expect(page.getByRole('heading', { name: 'Data, kept straightforward' })).toBeVisible();
  }
});

 test('reduced motion leaves static progress and record', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.route('**/*', route => new URL(route.request().url()).origin === 'http://localhost:3000' ? route.continue() : route.abort());
  await page.route('**/auth/v1/**', route => route.fulfill({ status: 401, json: {} }));
  for (const width of [390, 1280]) {
    await page.setViewportSize({ width, height: 900 });
    await page.goto('/');
    await expect(page.locator('.reading-progress')).toHaveCSS('transform', 'matrix(0, 0, 0, 1, 0, 0)');
    const before = await page.locator('.vinyl-record').evaluate(el => getComputedStyle(el).transform);
    await page.getByRole('link', { name: 'How it works' }).click();
    await expect(page.locator('.vinyl-record')).toHaveCSS('transform', before);
    await page.screenshot({ path: `/downloads/stash-motion-reduced-${width}.png`, animations: 'disabled' });
  }
 });
