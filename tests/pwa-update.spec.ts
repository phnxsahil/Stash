import { test, expect } from '@playwright/test';

test('update is explicit and public offline page fits mobile', async ({ page, request }) => {
  await page.route('**/*', async route => {
    const url = new URL(route.request().url());
    if (url.hostname === 'stash.test') {
      const response = await request.get(`http://localhost:3000${url.pathname}${url.search}`);
      return route.fulfill({ response });
    }
    return route.abort();
  });
  await page.addInitScript(() => {
    localStorage.setItem('stash-theme', 'dark');
    const worker = { postMessage: () => { (window as any).updateRequests = ((window as any).updateRequests || 0) + 1; } };
    const registration = { waiting: worker, addEventListener: () => {}, removeEventListener: () => {}, update: async () => {} };
    Object.defineProperty(navigator, 'serviceWorker', { value: { controller: {}, addEventListener: () => {}, removeEventListener: () => {}, register: async () => registration } });
  });
  await page.goto('http://stash.test/');
  await expect(page.getByText('A new version is ready')).toBeVisible();
  expect(await page.evaluate(() => (window as any).updateRequests || 0)).toBe(0);
  for (const width of [390, 1280]) {
    await page.setViewportSize({ width, height: 900 });
    await page.screenshot({ path: `/downloads/stash-pwa-update-${width}.png`, animations: 'disabled' });
  }
  await page.getByRole('button', { name: 'Update and reload' }).click();
  expect(await page.evaluate(() => (window as any).updateRequests)).toBe(1);
  await page.goto('http://stash.test/offline.html');
  await expect(page.getByRole('heading', { name: 'You are offline right now' })).toBeVisible();
  for (const width of [320, 390, 1280]) {
    await page.setViewportSize({ width, height: 900 });
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(width);
    await page.screenshot({ path: `/downloads/stash-pwa-offline-${width}.png`, animations: 'disabled' });
  }
});
