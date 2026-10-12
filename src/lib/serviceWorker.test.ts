// Run the real worker in a tiny event harness. No browser account/network calls.
import { readFileSync } from 'node:fs';
import { runInNewContext } from 'node:vm';
import { describe, expect, it, vi } from 'vitest';

function harness() {
  const handlers: Record<string, (event: any) => void> = {};
  const put = vi.fn();
  const addAll = vi.fn().mockResolvedValue(undefined);
  const skipWaiting = vi.fn();
  const fetch = vi.fn().mockResolvedValue(new Response('public', { headers: { 'Cache-Control': 'public' } }));
  runInNewContext(readFileSync('public/sw.js', 'utf8'), {
    self: { location: new URL('https://stash.test'), addEventListener: (key: string, fn: any) => handlers[key] = fn, skipWaiting, clients: { claim: vi.fn() } },
    caches: { open: vi.fn().mockResolvedValue({ put, addAll }), match: vi.fn().mockResolvedValue(undefined), keys: vi.fn().mockResolvedValue([]), delete: vi.fn() },
    URL, Response, fetch,
  });
  const send = (path: string, extra = {}) => {
    const event = { request: { url: `https://stash.test${path}`, method: 'GET', headers: new Headers(), mode: 'cors', ...extra }, respondWith: vi.fn(), waitUntil: vi.fn() };
    handlers.fetch(event); return event;
  };
  return { handlers, send, put, addAll, skipWaiting, fetch };
}

describe('public-only service worker', () => {
  it.each(['/auth/v1/token', '/rest/v1/history', '/api/history', '/?code=secret', '/assets/app.js?url=private', '/save_track'])('does not intercept private/query URL %s', path => {
    const { send } = harness(); expect(send(path).respondWith).not.toHaveBeenCalled();
  });
  it('does not cache navigation URLs or auth callback data', async () => {
    const h = harness(); const event = h.send('/?code=private', { mode: 'navigate' });
    await event.respondWith.mock.calls[0][0]; expect(h.put).not.toHaveBeenCalled();
  });
  it('does not cache an authorized asset request', () => {
    const { send } = harness(); expect(send('/assets/app-123.js', { headers: new Headers({ Authorization: 'stub' }) }).respondWith).not.toHaveBeenCalled();
  });
  it('caches only same-origin public assets', async () => {
    const h = harness(); const event = h.send('/assets/app-123.js'); await event.respondWith.mock.calls[0][0];
    await Promise.all(event.waitUntil.mock.calls.map(([promise]) => promise)); expect(h.put).toHaveBeenCalledTimes(1);
  });
  it('does not cache private/no-store responses', async () => {
    const h = harness(); h.fetch.mockResolvedValue(new Response('private', { headers: { 'Cache-Control': 'private, no-store' } }));
    const event = h.send('/assets/app-123.js'); await event.respondWith.mock.calls[0][0]; expect(h.put).not.toHaveBeenCalled();
  });
  it('leaves a new worker waiting until requested', async () => {
    const h = harness(); const event = { waitUntil: vi.fn() }; h.handlers.install(event); await event.waitUntil.mock.calls[0][0];
    expect(h.skipWaiting).not.toHaveBeenCalled(); h.handlers.message({ data: { type: 'SKIP_WAITING' } }); expect(h.skipWaiting).toHaveBeenCalledOnce();
  });
});
