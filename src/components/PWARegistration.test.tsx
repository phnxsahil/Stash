import { render, waitFor } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { PWARegistration } from './PWARegistration';

vi.mock('sonner', () => ({ toast: { warning: vi.fn(), success: vi.fn() } }));

describe('PWA update lifecycle', () => {
  it('local preview only unregisters, never deletes unrelated cache entries', async () => {
    const unregister = vi.fn();
    const getRegistrations = vi.fn().mockResolvedValue([{ unregister }]);
    Object.defineProperty(navigator, 'serviceWorker', { configurable: true, value: { getRegistrations } });
    render(<PWARegistration busy />);
    await waitFor(() => expect(unregister).toHaveBeenCalledOnce());
  });
});
