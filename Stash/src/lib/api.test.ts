import { describe, it, expect, vi, beforeEach } from 'vitest';
import { api } from '@/lib/api';

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
});
