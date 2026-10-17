import { test, expect } from '@playwright/test';

test('landing theme toggle works and persists at compact widths', async ({ page }) => {
  await page.goto('/');
  for (const width of [320, 390, 1440]) {
    await page.setViewportSize({ width, height: 900 });
    await page.getByRole('button', { name: 'Switch to light mode' }).click();
    await expect(page.locator('html')).toHaveClass('light');
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    await page.getByRole('button', { name: 'Switch to dark mode' }).click();
    await expect(page.locator('html')).toHaveClass('dark');
  }
  await page.getByRole('button', { name: 'Switch to light mode' }).click();
  await page.reload();
  await expect(page.getByRole('button', { name: 'Switch to dark mode' })).toBeVisible();
});

test('link clears only after automatic save confirmation and triggers the milestone', async ({ page }) => {
  await page.goto('/artifacts/save-flow-preview.html');
  await page.waitForFunction(() => (window as any).__fixtureReady);
  const input = page.getByRole('textbox', { name: 'Music source URL' });
  await expect(page.getByText('0 of 1 songs. Keep following your ears.')).toBeVisible();
  await input.fill('https://youtu.be/example');
  await page.getByRole('button', { name: 'Stash to Spotify' }).click();
  await page.waitForFunction(() => typeof (window as any).__completeSave === 'function');
  await expect(input).toHaveValue('https://youtu.be/example');
  await page.evaluate(() => (window as any).__completeSave());
  await expect(input).toHaveValue('');
  await expect(page.locator('.milestone-toast')).toContainText('First Stash!');
});

test('manual selection and failed saves keep the link until a save succeeds', async ({ page }) => {
  await page.goto('/artifacts/save-flow-preview.html?manual=1');
  await page.waitForFunction(() => (window as any).__fixtureReady);
  await expect(page.getByRole('heading', { name: 'Capture', exact: true })).toBeVisible();
  await page.getByRole('button', { name: 'Open account menu' }).click();
  const autoAdd = page.getByRole('switch', { name: 'Auto-add top match' });
  await expect(autoAdd).toBeChecked();
  await autoAdd.click();
  await expect(autoAdd).not.toBeChecked();
  await page.keyboard.press('Escape');
  const input = page.locator('input[aria-label="Music source URL"]');
  await input.fill('https://www.instagram.com/reel/example/');
  await page.getByRole('button', { name: 'Stash to Spotify' }).click();
  await expect(page.getByRole('heading', { name: 'Select the best match' })).toBeVisible();
  await expect(input).toHaveValue('https://www.instagram.com/reel/example/');
  await page.getByRole('button', { name: /Save-flow sample/ }).click();
  await page.waitForFunction(() => typeof (window as any).__failSave === 'function');
  await page.evaluate(() => (window as any).__failSave());
  await expect(page.locator('[data-sonner-toast]').filter({ hasText: /Failed to add song|Fixture save failed/ })).toBeVisible();
  await expect(input).toHaveValue('https://www.instagram.com/reel/example/');
  await page.evaluate(() => { delete (window as any).__completeSave; });
  await page.getByRole('button', { name: 'Stash to Spotify' }).click();
  await page.getByRole('button', { name: /Save-flow sample/ }).click();
  await page.waitForFunction(() => typeof (window as any).__completeSave === 'function');
  await page.evaluate(() => (window as any).__completeSave());
  await expect(input).toHaveValue('');
});

test('unsupported hosts stay local and help gives the correct phone instructions', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('textbox', { name: 'Music source URL' }).fill('https://example.com/video');
  await page.getByRole('button', { name: 'Stash this song' }).click();
  await expect(page.getByText('Stash supports Instagram Reels and YouTube links.')).toBeVisible();
  await page.getByRole('button', { name: 'Help', exact: true }).click();
  await expect(page.getByRole('heading', { name: 'Can I share directly to Stash on iPhone?' })).toBeVisible();
  await expect(page.getByText(/iOS web apps cannot receive links from the share sheet/)).toBeVisible();
});
