import { test, expect } from '@playwright/test';

test.describe('Stash App Smoke Tests', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto('/');
    });

    test('landing page loads correctly', async ({ page }) => {
        await expect(page).toHaveTitle(/Stash/i);
        await expect(page.getByText(/The internet is the world's radio/i)).toBeVisible();
        await expect(page.getByRole('button', { name: /Connect/i }).first()).toBeVisible();
    });

    test('navigation to privacy page', async ({ page }) => {
        // Scroll to footer and click Privacy
        const privacyLink = page.getByRole('button', { name: 'Privacy' });
        await privacyLink.scrollIntoViewIfNeeded();
        await privacyLink.click();

        await expect(page.getByRole('heading', { name: 'Privacy Policy' })).toBeVisible();

        // Back button in header (first icon button)
        await page.locator('header button').first().click();
        await expect(page.getByText(/The internet is the world's radio/i)).toBeVisible();
    });

    test('theme toggle works', async ({ page }) => {
        const html = page.locator('html');
        const initialClass = await html.getAttribute('class') || '';
        const isInitialDark = initialClass.includes('dark');

        // Click theme toggle in header (desktop)
        const toggle = page.locator('header .data-\\[state\\]').first();
        await toggle.click();

        // Check if class adjusted
        const newClass = await html.getAttribute('class') || '';
        if (isInitialDark) {
            expect(newClass).not.toContain('dark');
            expect(newClass).toContain('light');
        } else {
            expect(newClass).toContain('dark');
            expect(newClass).not.toContain('light');
        }
    });
});
