import { describe, expect, it } from 'vitest';
import { canShowInstallPrompt, INSTALL_DISMISS_COOLDOWN_MS } from './pwa';

describe('PWA install prompt eligibility', () => {
  it('only allows the prompt when the browser supplied it and the app is eligible', () => {
    const now = 1_000_000_000_000;
    const eligible = { hasDeferredPrompt: true, hasInteracted: true, isStandalone: false, hasPendingShare: false, now };
    expect(canShowInstallPrompt(eligible)).toBe(true);
    expect(canShowInstallPrompt({ ...eligible, hasDeferredPrompt: false })).toBe(false);
    expect(canShowInstallPrompt({ ...eligible, hasInteracted: false })).toBe(false);
    expect(canShowInstallPrompt({ ...eligible, isStandalone: true })).toBe(false);
    expect(canShowInstallPrompt({ ...eligible, hasPendingShare: true })).toBe(false);
    expect(canShowInstallPrompt({ ...eligible, dismissedAt: now - INSTALL_DISMISS_COOLDOWN_MS + 1 })).toBe(false);
    expect(canShowInstallPrompt({ ...eligible, dismissedAt: now - INSTALL_DISMISS_COOLDOWN_MS - 1 })).toBe(true);
  });
});
