export const INSTALL_DISMISS_COOLDOWN_MS = 1000 * 60 * 60 * 24 * 3;

export interface InstallPromptEligibility {
  hasDeferredPrompt: boolean;
  hasInteracted: boolean;
  isStandalone: boolean;
  hasPendingShare: boolean;
  dismissedAt?: number;
  now?: number;
}

export function isInstallPromptDismissed(dismissedAt = 0, now = Date.now()): boolean {
  return dismissedAt > 0 && now - dismissedAt <= INSTALL_DISMISS_COOLDOWN_MS;
}

export function canShowInstallPrompt({
  hasDeferredPrompt,
  hasInteracted,
  isStandalone,
  hasPendingShare,
  dismissedAt = 0,
  now = Date.now(),
}: InstallPromptEligibility): boolean {
  return hasDeferredPrompt && hasInteracted && !isStandalone && !hasPendingShare && !isInstallPromptDismissed(dismissedAt, now);
}

export function isStandaloneDisplayMode(): boolean {
  const displayMode = typeof window !== 'undefined' && typeof window.matchMedia === 'function'
    ? window.matchMedia('(display-mode: standalone)').matches
    : false;
  const iosStandalone = typeof navigator !== 'undefined' && (navigator as Navigator & { standalone?: boolean }).standalone === true;
  return displayMode || iosStandalone;
}
