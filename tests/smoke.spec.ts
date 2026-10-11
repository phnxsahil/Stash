import { test, expect } from '@playwright/test';

test.describe('Stash unauthenticated smoke tests', () => {
    test.beforeEach(async ({ page }) => {
        // No credentials or production services: allow only this local app's assets.
        await page.route('**/*', async (route) => {
            if (new URL(route.request().url()).origin === 'http://localhost:3000') {
                await route.continue();
            } else {
                await route.abort('blockedbyclient');
            }
        });
        await page.route('**/auth/v1/**', (route) => route.fulfill({
            status: 401,
            contentType: 'application/json',
            body: JSON.stringify({ message: 'No test session' }),
        }));
        await page.addInitScript(() => {
            localStorage.clear();
            localStorage.setItem('stash-theme', 'dark');
        });
        await page.goto('/');
    });

    test('landing page offers the intended capture workflow', async ({ page }) => {
        await expect(page).toHaveTitle(/Stash/i);
        await expect(page.getByRole('heading', {
            name: 'Found in the feed. Kept for the feeling.', exact: true,
        })).toBeVisible();
        await expect(page.getByRole('button', { name: 'Connect', exact: true })).toBeVisible();
        await expect(page.getByRole('button', { name: 'Start stashing now', exact: true })).toBeVisible();
    });

    test('privacy navigation returns to the landing page', async ({ page }) => {
        await page.getByRole('button', { name: 'Privacy', exact: true }).click();
        await expect(page.getByRole('heading', {
            name: 'Data, kept straightforward', exact: true,
        })).toBeVisible();
        await page.getByRole('button', { name: 'Back to Stash', exact: true }).click();
        await expect(page.getByRole('heading', {
            name: 'Found in the feed. Kept for the feeling.', exact: true,
        })).toBeVisible();
    });

    test('named theme switch updates appearance and local preference', async ({ page }) => {
        const themeSwitch = page.getByRole('switch', { name: 'Dark mode', exact: true });
        await expect(themeSwitch).toBeChecked();
        await expect(page.locator('html')).toHaveClass('dark');
        await themeSwitch.click();
        await expect(themeSwitch).not.toBeChecked();
        await expect(page.locator('html')).toHaveClass('light');
        await expect.poll(() => page.evaluate(() => localStorage.getItem('stash-theme'))).toBe('light');
        await themeSwitch.click();
        await expect(themeSwitch).toBeChecked();
        await expect(page.locator('html')).toHaveClass('dark');
        await expect.poll(() => page.evaluate(() => localStorage.getItem('stash-theme'))).toBe('dark');
    });
});


test('landing fits narrow screens and honors reduced motion', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.route('**/*', route => new URL(route.request().url()).origin === 'http://localhost:3000' ? route.continue() : route.abort());
    await page.route('**/auth/v1/**', route => route.fulfill({ status: 401, json: {} }));
    await page.goto('/');
    for (const width of [320, 390, 768, 1280]) {
        await page.setViewportSize({ width, height: 900 });
        expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(width);
    }
    await expect(page.getByRole('heading', { name: "Don't let it disappear." })).toHaveCSS('opacity', '1');
    await page.getByRole('button', { name: 'Privacy', exact: true }).click();
    await expect.poll(() => page.evaluate(() => scrollY)).toBe(0);
});
