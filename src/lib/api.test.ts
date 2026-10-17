import { describe, it, expect, vi, beforeEach } from 'vitest';
import { api } from '@/lib/api';
import { supabase } from '@/lib/supabase';

// Mock Supabase
vi.mock('@/lib/supabase', () => ({
    supabase: {
        auth: {
            getUser: vi.fn().mockResolvedValue({ data: { user: { id: 'test-user' } } }),
            signInWithOAuth: vi.fn(),
            signOut: vi.fn(),
        },
        from: vi.fn(() => ({
            insert: vi.fn().mockReturnThis(),
            select: vi.fn().mockReturnThis(),
            eq: vi.fn().mockReturnThis(),
            order: vi.fn().mockResolvedValue({ data: [], error: null }),
            single: vi.fn().mockResolvedValue({ data: { id: '123' }, error: null }),
        })),
    }
}));

describe('API Library', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('generates vibe analysis correctly from empty history', async () => {
        const result = await api.getVibeAnalysis([]);
        expect(result).toBe("No music yet! Start stashing.");
    });

    it('returns an empty history only when there is no signed-in user', async () => {
        vi.mocked(supabase.auth.getUser).mockResolvedValueOnce({ data: { user: null }, error: null } as any);
        await expect(api.getUserHistory()).resolves.toEqual([]);
    });

    it('propagates history fetch failures so the app can offer retry', async () => {
        const failure = new Error('history request failed');
        vi.mocked(supabase.from).mockReturnValueOnce({
            select: vi.fn().mockReturnThis(),
            eq: vi.fn().mockReturnThis(),
            order: vi.fn().mockResolvedValue({ data: null, error: failure }),
        } as any);

        await expect(api.getUserHistory()).rejects.toBe(failure);
    });
});
