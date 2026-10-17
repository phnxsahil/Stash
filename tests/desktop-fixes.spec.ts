import { test, expect } from '@playwright/test';

const preview = '/artifacts/stitch-preview.html';

test('desktop Stats uses full-width source cards and content-sized insights', async ({ page }) => {
  await page.setViewportSize({ width: 1100, height: 900 });
  await page.goto(`${preview}?screen=stats&theme=light`);
  await expect(page.locator('.st-desktop-chart')).toHaveCSS('grid-column-start', '1');
  await expect(page.locator('.st-desktop-chart')).toHaveCSS('grid-column-end', '-1');
  await expect(page.locator('.st-capture-sources')).toHaveCSS('grid-column-start', '1');
  await expect(page.locator('.st-capture-sources')).toHaveCSS('grid-column-end', '-1');

  const heights = await page.evaluate(() => Object.fromEntries(
    ['.st-capture-volume', '.st-discovery-insight', '.st-top-genres', '.st-stats-destinations']
      .map(selector => [selector, document.querySelector(selector)!.getBoundingClientRect().height]),
  ));
  expect(heights['.st-capture-volume']).toBeLessThan(216);
  expect(heights['.st-discovery-insight']).toBeLessThan(216);
  expect(heights['.st-stats-destinations']).toBeLessThan(heights['.st-top-genres']);
  const banner = page.locator('.library-milestone');
  expect(await banner.evaluate(element => Math.abs(element.getBoundingClientRect().width - element.parentElement!.getBoundingClientRect().width))).toBeLessThan(1);
});

test('desktop connection status and account sheet remain clear, with readable light-theme icons', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto(`${preview}?screen=capture&theme=light`);
  await expect(page.locator('.st-topbar>.st-badge')).toBeHidden();
  await expect(page.locator('.st-sidebar-connection .st-badge')).toHaveText('Spotify connected');
  await expect(page.locator('.st-badge:visible')).toHaveCount(1);
  for (const selector of ['.st-avatar .stash-icon', '.st-capture-cast']) {
    await expect(page.locator(selector).first()).toHaveCSS('color', 'rgb(0, 110, 45)');
  }

  await page.getByRole('button', { name: 'Open account menu' }).click();
  const account = page.locator('.st-account');
  await expect(account).toBeVisible();
  await page.waitForTimeout(600);
  const layout = await account.evaluate(element => {
    const rect = element.getBoundingClientRect();
    const style = getComputedStyle(element);
    const name = element.querySelector('.st-account-name')!;
    return { top: rect.top, bottom: rect.bottom, right: rect.right, padding: parseFloat(style.paddingLeft), nameFits: name.scrollWidth <= name.clientWidth };
  });
  expect(layout.top).toBeGreaterThanOrEqual(80);
  expect(layout.bottom).toBeLessThanOrEqual(900);
  expect(layout.right).toBeLessThanOrEqual(1440);
  expect(layout.padding).toBeGreaterThanOrEqual(24);
  expect(layout.nameFits).toBe(true);

  await page.goto(`${preview}?screen=library&theme=light`);
  await expect(page.locator('.st-library-stats>button:nth-child(3) .stash-icon')).toHaveCSS('color', 'rgb(0, 110, 45)');
  const banner = page.locator('.library-milestone');
  const column = page.locator('.st-library-content');
  expect(await banner.evaluate((element, parent) => Math.abs(element.getBoundingClientRect().width - document.querySelector(parent)!.getBoundingClientRect().width), '.st-library-content')).toBeLessThan(1);
  await expect(column).toBeVisible();
});
