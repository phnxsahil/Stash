import { test, expect } from '@playwright/test';

test.describe('Landing capture', () => {
  test.beforeEach(async ({ page }) => { await page.goto('/'); });

  test('capture fits phone, compact phone, landscape and desktop', async ({ page }) => {
    for (const viewport of [{width: 390, height: 844}, {width: 320, height: 640}, {width: 844, height: 390}, {width: 1440, height: 1000}]) {
      await page.setViewportSize(viewport);
      await expect(page.getByRole('heading', {name: 'Hear it. Stash it.'})).toBeVisible();
      await expect(page.getByRole('button', {name: 'Stash this song'})).toBeVisible();
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
      const button = await page.getByRole('button', {name: 'Stash this song'}).boundingBox();
      expect(button!.height).toBeGreaterThanOrEqual(44);
      if (viewport.height >= 640) expect(button!.y + button!.height).toBeLessThan(viewport.height);
    }
  });

  test('invalid input stays local and offers a correction', async ({ page }) => {
    const input = page.getByRole('textbox', { name: 'Music source URL' });
    await input.fill('not a link');
    await page.getByRole('button', {name: 'Stash this song'}).click();
    await expect(input).toHaveAttribute('aria-invalid', 'true');
    await expect(input).toBeFocused();
    await expect(page.getByText('Paste a complete link, starting with https://.')).toBeVisible();
    await page.getByRole('button', {name: 'Clear link'}).click();
    await expect(input).toHaveValue('');
    await expect(input).toHaveAttribute('aria-invalid', 'false');
  });

  test('shared links survive a reload', async ({ page }) => {
    await page.goto('/?shared_url=https%3A%2F%2Fwww.instagram.com%2Freel%2Ftest123%2F');
    const input = page.getByRole('textbox', { name: 'Music source URL' });
    await expect(input).toHaveValue('https://www.instagram.com/reel/test123/');
    await page.reload();
    await expect(input).toHaveValue('https://www.instagram.com/reel/test123/');
    await expect(page.getByText('Shared link ready. Let’s find your song.')).toBeVisible();
  });

  test('privacy navigation returns to capture', async ({ page }) => {
    await page.getByRole('button', {name: 'Privacy', exact:true}).click();
    await expect(page.getByRole('heading', {name:'Data, kept straightforward'})).toBeVisible();
    await page.locator('header button').first().click();
    await expect(page.getByRole('heading', {name: 'Hear it. Stash it.'})).toBeVisible();
  });

  test('reduced motion leaves the flow visible and static', async ({ page }) => {
    await page.emulateMedia({reducedMotion:'reduce'});
    await page.reload();
    await page.getByRole('heading', {name:'Make it yours'}).scrollIntoViewIfNeeded();
    await expect(page.getByRole('heading', {name:'Make it yours'})).toBeVisible();
    expect(await page.locator('.capture-flow li').first().evaluate(el => getComputedStyle(el).opacity)).toBe('1');
    expect(await page.locator('.capture-vinyl').evaluate(el => getComputedStyle(el).animationName)).toBe('none');
  });
});
