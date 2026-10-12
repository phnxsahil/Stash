import { test, expect } from '@playwright/test';

test('history retry does not repeat Spotify and removal is Stash-only', async ({ page }) => {
  let spotifyWrites = 0;
  let historyWrites = 0;
  const row = { id: 'pending-row', song: 'Test song', artist: 'Test artist', source: 'Web', album_art_url: '', created_at: new Date().toISOString() };
  await page.route('**/*', async route => {
    const url = new URL(route.request().url());
    if (url.pathname === '/save_track') {
      spotifyWrites++;
      return route.fulfill({ json: { success: true, playlist_id: '1', playlist_name: 'Liked Songs' } });
    }
    if (url.pathname === '/recognize') return route.fulfill({ json: {
      success: true, spotify_uri: 'spotify:track:4iV5W9uYEdYUVa79Axb7Rh', track: row.song, artist: row.artist, album_art: '',
    } });
    if (url.pathname.includes('/auth/v1/user')) return route.fulfill({ json: { id: 'test-owner', email: 'test@example.invalid', user_metadata: {} } });
    if (url.pathname.includes('/rest/v1/history')) {
      if (route.request().method() === 'POST') {
        historyWrites++;
        if (historyWrites === 1) return route.fulfill({ status: 500, json: { message: 'offline' } });
        Object.assign(row, route.request().postDataJSON());
        return route.fulfill({ json: row });
      }
      if (route.request().method() === 'DELETE') return route.fulfill({ json: [{ id: row.id }] });
      return route.fulfill({ json: [] });
    }
    if (url.pathname === '/v1/me/playlists') return route.fulfill({ json: { items: [] } });
    if (url.origin === 'http://127.0.0.1:3101') return route.continue();
    return route.abort('blockedbyclient');
  });
  await page.addInitScript(() => {
    localStorage.clear();
    localStorage.setItem('stash-theme', 'dark');
    // Fake test session only. No production credential or library call.
    localStorage.setItem('sb-placeholder-auth-token', JSON.stringify({
      access_token: 'test-access-token', refresh_token: 'test-refresh-token', provider_token: 'test-provider-token',
      token_type: 'bearer', expires_at: Math.floor(Date.now() / 1000) + 3600,
      user: { id: 'test-owner', email: 'test@example.invalid', user_metadata: {} },
    }));
  });
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/');
  await expect(page.getByRole('heading', {name: 'Hear it. Stash it.'})).toBeVisible();
  for (const width of [320, 390, 768, 1280]) {
    await page.setViewportSize({ width, height: 900 });
    await page.screenshot({ path: `/downloads/stash-port-capture-${width}.png`, fullPage: false, animations: 'disabled' });
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(width);
  }
  await page.setViewportSize({ width: 390, height: 900 });
  await page.getByRole('textbox', { name: 'Music source URL' }).fill('https://example.invalid/music');
  await page.getByRole('button', { name: 'Stash this song', exact: true }).click();
  await expect(page.getByRole('button', { name: 'Retry Stash history only' })).toBeVisible();
  for (const width of [390, 1280]) {
    await page.setViewportSize({ width, height: 900 });
    await page.screenshot({ path: `/downloads/stash-port-recovery-${width}.png`, fullPage: false, animations: 'disabled' });
  }
  await page.getByRole('button', { name: 'Retry Stash history only' }).click();
  await page.getByRole('button', { name: 'Your library', exact: true }).first().click();
  await expect(page.getByRole('region', { name: 'Stash history' }).getByText('Test song', { exact: true })).toBeVisible();
  expect(spotifyWrites).toBe(1);
  expect(historyWrites).toBe(2);
  await page.getByRole('button', { name: 'Remove Test song from stash' }).click();
  await page.getByRole('button', { name: 'Remove', exact: true }).click();
  await expect(page.getByText('Removed from Stash history. Spotify was not changed.', { exact: true })).toBeVisible();
  expect(spotifyWrites).toBe(1);
});
