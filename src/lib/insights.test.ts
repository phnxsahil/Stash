import { describe, it, expect } from 'vitest';
import { computeInsights, peakWindowLabel } from './insights';
import type { Song } from '../types';

const song = (over: Partial<Song>): Song => ({
    id: Math.random().toString(36).slice(2),
    song: 'Song', artist: 'Artist', source: 'instagram', album_art_url: '',
    ...over,
});

describe('computeInsights', () => {
    it('returns zeros for empty history', () => {
        const i = computeInsights([]);
        expect(i.totalSongs).toBe(0);
        expect(i.streakDays).toBe(0);
        expect(i.peakHour).toBeNull();
        expect(i.peakLabel).toBeNull();
        expect(i.lateNightShare).toBe(0);
    });

    it('counts streak ending today', () => {
        const now = new Date('2026-10-30T12:00:00');
        const history = [
            song({ created_at: '2026-10-30T01:00:00' }),
            song({ created_at: '2026-10-29T23:00:00' }),
            song({ created_at: '2026-10-28T10:00:00' }),
            song({ created_at: '2026-10-26T10:00:00' }), // gap on 27th
        ];
        const i = computeInsights(history, now);
        expect(i.streakDays).toBe(3);
        expect(i.songsThisWeek).toBe(4);
    });

    it('detects late-night listening once there is enough data', () => {
        const history = Array.from({ length: 12 }, (_, n) =>
            song({ created_at: `2026-10-${String(n + 1).padStart(2, '0')}T23:30:00` }));
        const i = computeInsights(history, new Date('2026-10-30T12:00:00'));
        expect(i.lateNightShare).toBe(1);
        expect(i.hasEnoughData).toBe(true);
        expect(i.peakLabel).toBe('Late-Night Discovery');
    });

    it('does not infer a personality from a handful of saves', () => {
        const history = [
            song({ created_at: '2026-10-01T23:30:00' }),
            song({ created_at: '2026-10-02T02:10:00' }),
            song({ created_at: '2026-10-03T12:00:00' }),
        ];
        const i = computeInsights(history, new Date('2026-10-30T12:00:00'));
        expect(i.lateNightShare).toBeCloseTo(2 / 3, 5);
        expect(i.hasEnoughData).toBe(false);
        expect(i.peakLabel).toBeNull();
        // Raw facts stay available regardless of the threshold.
        expect(i.totalSongs).toBe(3);
        expect(i.hourlyHistogram.reduce((a, b) => a + b, 0)).toBe(3);
    });

    it('ranks top artists and sources', () => {
        const history = [
            song({ artist: 'A', source: 'youtube', created_at: '2026-10-01T10:00:00' }),
            song({ artist: 'A', source: 'instagram', created_at: '2026-10-02T10:00:00' }),
            song({ artist: 'B', source: 'youtube', created_at: '2026-10-03T10:00:00' }),
        ];
        const i = computeInsights(history, new Date('2026-10-30T12:00:00'));
        expect(i.topArtists[0]).toEqual({ artist: 'A', count: 2 });
        expect(i.sourceMix[0]).toEqual({ source: 'youtube', count: 2, share: 2 / 3 });
    });

    it('labels peak windows', () => {
        expect(peakWindowLabel(2)).toBe('Late-Night Discovery');
        expect(peakWindowLabel(8)).toBe('Morning Scout');
        expect(peakWindowLabel(14)).toBe('Daytime Digger');
        expect(peakWindowLabel(20)).toBe('Evening Curator');
        expect(peakWindowLabel(null)).toBeNull();
    });
});
