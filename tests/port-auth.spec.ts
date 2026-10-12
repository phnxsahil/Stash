import { test, expect } from '@playwright/test';
const session = (owner: string) => ({ access_token: `fake-${owner}`, refresh_token: `fake-refresh-${owner}`, provider_token: 'fake-provider', token_type: 'bearer', expires_at: Math.floor(Date.now() / 1000) + 3600, user: { id: owner, email: `${owner}@example.invalid`, user_metadata: {} } });

test('account change and sign-out discard late history reads', async ({ page }) => {
  let releaseOld!: () => void;
  const gate = new Promise<void>(resolve => { releaseOld = resolve; });
  let oldStarted = false;
  await page.route('**/*', async route => {
    const u = new URL(route.request().url());
    if (u.pathname.includes('/auth/v1/user')) {
      const owner = route.request().headers()['authorization']?.includes('owner-b') ? 'owner-b' : 'owner-a';
      return route.fulfill({ json: session(owner).user });
    }
    if (u.pathname.includes('/rest/v1/history')) {
      const owner = u.searchParams.get('user_id')?.replace('eq.', '') || 'owner-a';
      if (owner === 'owner-a') { oldStarted = true; await gate; }
      return route.fulfill({ json: [{ id: `${owner}-row`, user_id: owner, song: `${owner} song`, artist: 'Test artist', source: 'Web', album_art_url: '', created_at: new Date().toISOString() }] });
    }
    if (u.pathname === '/v1/me/playlists') return route.fulfill({ json: { items: [] } });
    if (u.origin === 'http://127.0.0.1:3101') return route.continue();
    return route.abort();
  });
  await page.addInitScript(value => {
    localStorage.clear(); localStorage.setItem('stash-theme', 'dark');
    localStorage.setItem('sb-placeholder-auth-token', JSON.stringify(value));
  }, session('owner-a'));
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/');
  await expect.poll(() => oldStarted).toBe(true);
  // Simulate the auth broadcast from another tab, without a real credential.
  await page.evaluate(value => {
    const key = 'sb-placeholder-auth-token'; const oldValue = localStorage.getItem(key); const newValue = JSON.stringify(value);
    localStorage.setItem(key, newValue);
    const channel = new BroadcastChannel(key); channel.postMessage({ event: 'SIGNED_IN', session: value }); channel.close();
  }, session('owner-b'));
  await page.getByRole('button', { name: 'Your library', exact: true }).first().click();
  await expect(page.getByRole('region', { name: 'Stash history' }).getByText('owner-b song', { exact: true })).toBeVisible();
  releaseOld();
  await expect(page.getByText('owner-a song', { exact: true })).toHaveCount(0);
  for (const width of [390, 1280]) {
    await page.setViewportSize({ width, height: 900 });
    await page.screenshot({ path: `/downloads/stash-auth-owner-${width}.png`, animations: 'disabled' });
  }
  await page.evaluate(() => {
    const key = 'sb-placeholder-auth-token'; const oldValue = localStorage.getItem(key);
    localStorage.removeItem(key);
    const channel = new BroadcastChannel(key); channel.postMessage({ event: 'SIGNED_OUT', session: null }); channel.close();
  });
  await expect(page.getByRole('heading', { name: 'Hear it. Stash it.' })).toBeVisible();
  await expect(page.getByText('owner-b song', { exact: true })).toHaveCount(0);
});
