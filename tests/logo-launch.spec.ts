import { test, expect } from '@playwright/test';

test('Hidden S draws then reaches the real header in both themes and sizes', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  for (const [width, theme] of [[390, 'dark'], [1440, 'light']] as const) {
    await page.setViewportSize({ width, height: 900 });
    await page.addInitScript(value => localStorage.setItem('stash-theme', value), theme);
    await page.goto('/');
    await expect(page.getByTestId('stash-launch')).toBeAttached();
    await page.waitForFunction(() => {
      const mark = document.querySelector('.st-launch-mark');
      const target = document.querySelector('header .st-logo img');
      if (!mark || !target) return false;
      const a = mark.getBoundingClientRect(), b = target.getBoundingClientRect();
      return Math.abs(a.x - b.x) < 1 && Math.abs(a.y - b.y) < 1 && Math.abs(a.width - b.width) < 1;
    }, null, { polling: 'raf', timeout: 2500 });
    await expect(page.getByTestId('stash-launch')).toHaveCount(0);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    await page.getByRole('button', { name: 'Privacy', exact: true }).click();
    await expect(page.getByRole('heading', { name: 'Data, kept straightforward' })).toBeVisible();
    await expect(page.getByTestId('stash-launch')).toHaveCount(0);
  }
});

test('launch can be skipped and is absent for reduced motion', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await page.goto('/');
  await expect(page.getByTestId('stash-launch')).toBeAttached();
  await page.keyboard.press('Escape');
  await expect(page.getByTestId('stash-launch')).toHaveCount(0);
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.reload();
  await expect(page.getByRole('heading', { name: 'Hear it. Stash it.' })).toBeVisible();
  await expect(page.getByTestId('stash-launch')).toHaveCount(0);
});
