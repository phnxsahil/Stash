import { test, expect } from '@playwright/test';

const preview = '/artifacts/stitch-preview.html';
const textColor = (element: Element) => getComputedStyle(element).color;

test('light text uses accessible colors while green fills and icons remain unchanged', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 900 });
  await page.goto(`${preview}?screen=capture&theme=light`);
  const active = page.locator('.st-bottom-nav button[aria-current=page]');
  expect(await active.evaluate(element => getComputedStyle(element).color)).toBe('rgb(0, 110, 45)');
  expect(await active.locator('.stash-icon').evaluate(element => getComputedStyle(element).color)).toBe('rgb(0, 110, 45)');
  expect(await page.locator('.st-capture-submit .st-button-primary').evaluate(element => getComputedStyle(element).backgroundImage)).toContain('rgb(29, 185, 84)');
  await page.goto(`${preview}?screen=about&theme=light`);
  expect(await page.getByText('Mission', { exact: true }).evaluate(element => getComputedStyle(element).color)).toBe('rgb(0, 110, 45)');
  await page.goto(`${preview}?screen=privacy&theme=light`);
  expect(await page.locator('a[href^="mailto:"]').evaluate(element => getComputedStyle(element).color)).toBe('rgb(0, 110, 45)');
  for (const theme of ['light', 'dark']) {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto(`${preview}?screen=landing&theme=${theme}`);
    const expected = theme === 'light' ? 'rgb(82, 99, 79)' : 'rgb(179, 179, 179)';
    expect(await page.locator('a[href="#how-it-works"]').evaluate(element => getComputedStyle(element).color)).toBe(expected);
    expect(await page.locator('.flow-marker>span:not(.stash-icon)').first().evaluate(element => getComputedStyle(element).color)).toBe(expected);
  }
});

test('main screens have one status, four stable tabs, and readable status chips', async ({ page }) => {
  for (const width of [320, 390, 1440]) {
    await page.setViewportSize({ width, height: 900 });
    for (const theme of ['light', 'dark']) {
      for (const screen of ['capture', 'library', 'stats', 'settings']) {
        await page.goto(`${preview}?screen=${screen}&theme=${theme}`);
        await expect(page.locator('.st-topbar>.st-badge')).toHaveText('Spotify connected');
        await expect(page.locator('.st-badge:visible')).toHaveCount(1);
        await expect(page.locator('.st-bottom-nav button>span:not(.stash-icon)')).toHaveText(['Capture', 'Library', 'Stats', 'Settings']);
        expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
        const tooSmall = await page.locator('.st-badge,.st-coming-soon').evaluateAll(elements => elements.filter(el => parseFloat(getComputedStyle(el).fontSize) < 11).length);
        expect(tooSmall).toBe(0);
        if (screen === 'stats') {
          await expect(page.getByRole('heading', { name: 'Stats', exact: true })).toBeVisible();
          if (width === 1440) await expect(page.getByRole('navigation', { name: 'Main navigation' }).getByRole('button', { name: 'Stats', exact: true })).toBeVisible();
        }
      }
    }
  }
});

test('compact controls and inline links have at least 44px hit areas', async ({ page }) => {
  const checkTargets = async (selector: string) => {
    const sizes = await page.locator(selector).evaluateAll(elements => elements.map(element => {
      const { width, height } = element.getBoundingClientRect(); return { width, height };
    }));
    expect(sizes.length).toBeGreaterThan(0);
    for (const size of sizes) { expect(size.width).toBeGreaterThanOrEqual(43.9); expect(size.height).toBeGreaterThanOrEqual(43.9); }
  };
  for (const width of [320, 390]) {
    await page.setViewportSize({ width, height: 900 });
    await page.goto(`${preview}?screen=capture`);
    await checkTargets('.st-url-field button,.st-destination button,button.st-avatar');
    await page.goto(`${preview}?screen=library`);
    await page.getByRole('textbox', { name: 'Search your stash' }).fill('strangers');
    await checkTargets('.st-source-filters button,.st-library-sort label,.st-library-sort button,.st-library-search button,.st-track-actions a,.st-track-actions button');
    await page.goto(`${preview}?screen=stats`);
    await checkTargets('.st-period button');
    await page.goto(`${preview}?screen=privacy&theme=light`);
    await checkTargets('a[href^="mailto:"]');
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  }
});

test('genre counts are singular at one and long ranks leave a gap before the title', async ({ page }) => {
  await page.goto(`${preview}?screen=stats`);
  await expect(page.locator('.st-genre-row p')).toHaveText(['1 track', '1 track']);
  const rank = page.locator('.st-genre-row>strong').first();
  await rank.evaluate(element => { element.textContent = '#12'; });
  const geometry = await rank.evaluate(element => {
    const a = element.getBoundingClientRect(), b = element.nextElementSibling!.getBoundingClientRect();
    return { width: a.width, gap: b.left - a.right, fits: element.scrollWidth <= element.clientWidth };
  });
  expect(geometry.width).toBeGreaterThanOrEqual(32);
  expect(geometry.gap).toBeGreaterThanOrEqual(12);
  expect(geometry.fits).toBe(true);
});
