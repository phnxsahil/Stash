// Listening-personality insights computed from stash history.
// Pure functions: no IO, fully unit-testable.

import type { Song } from '../types';

export interface ArtistCount {
    artist: string;
    count: number;
}

export interface SourceCount {
    source: string;
    count: number;
    share: number;
}

export interface ListeningInsights {
    totalSongs: number;
    songsThisWeek: number;
    streakDays: number;
    topArtists: ArtistCount[];
    topSongs: ArtistCount[];
    sourceMix: SourceCount[];
    /** 24 buckets, index = hour of day (local time of the save). */
    hourlyHistogram: number[];
    peakHour: number | null;
    /** Share of saves between 22:00 and 04:00 local. */
    lateNightShare: number;
    /** Human label for the peak listening window. Null until enough data. */
    peakLabel: string | null;
    /** True once there are enough saves for personality inference to be
     *  meaningful (not just a handful of events). */
    hasEnoughData: boolean;
    firstSaveAt: string | null;
    longestGapDays: number;
}

const DAY_MS = 24 * 60 * 60 * 1000;

/** Below this many saves, personality labels would be noise - the panel
 *  shows raw counts and an honest "keep listening" hint instead. */
export const MIN_SAVES_FOR_PERSONALITY = 10;

function dayKey(date: Date): string {
    return `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;
}

export function peakWindowLabel(hour: number | null): string | null {
    if (hour === null) return null;
    if (hour >= 22 || hour < 4) return 'Late-Night Discovery';
    if (hour < 11) return 'Morning Scout';
    if (hour < 17) return 'Daytime Digger';
    return 'Evening Curator';
}

export function computeInsights(history: Song[], now: Date = new Date()): ListeningInsights {
    const valid = history
        .filter((s) => s.created_at && !Number.isNaN(new Date(s.created_at).getTime()))
        .slice()
        .sort((a, b) => new Date(a.created_at!).getTime() - new Date(b.created_at!).getTime());

    const totalSongs = history.length;
    const weekAgo = now.getTime() - 7 * DAY_MS;
    const songsThisWeek = valid.filter((s) => new Date(s.created_at!).getTime() >= weekAgo).length;

    // Streak: consecutive days with at least one save, ending today or yesterday.
    const daySet = new Set(valid.map((s) => dayKey(new Date(s.created_at!))));
    let streakDays = 0;
    const cursor = new Date(now);
    if (!daySet.has(dayKey(cursor))) {
        cursor.setDate(cursor.getDate() - 1);
    }
    while (daySet.has(dayKey(cursor))) {
        streakDays++;
        cursor.setDate(cursor.getDate() - 1);
    }

    // Top artists / songs
    const artistCounts = new Map<string, number>();
    const songCounts = new Map<string, number>();
    for (const s of history) {
        const artist = (s.artist || 'Unknown artist').trim();
        if (artist) artistCounts.set(artist, (artistCounts.get(artist) || 0) + 1);
        const title = (s.song || '').trim();
        if (title) songCounts.set(`${title} — ${artist}`, (songCounts.get(`${title} — ${artist}`) || 0) + 1);
    }
    const sortCounts = (m: Map<string, number>): ArtistCount[] =>
        Array.from(m.entries())
            .map(([name, count]) => ({ artist: name, count }))
            .sort((a, b) => b.count - a.count || a.artist.localeCompare(b.artist));
    const topArtists = sortCounts(artistCounts).slice(0, 5);
    const topSongs = sortCounts(songCounts).slice(0, 5);

    // Source mix
    const sourceCounts = new Map<string, number>();
    for (const s of history) {
        const src = (s.source || 'unknown').toLowerCase();
        sourceCounts.set(src, (sourceCounts.get(src) || 0) + 1);
    }
    const sourceMix: SourceCount[] = Array.from(sourceCounts.entries())
        .map(([source, count]) => ({ source, count, share: totalSongs ? count / totalSongs : 0 }))
        .sort((a, b) => b.count - a.count);

    // Hourly histogram + late-night share
    const hourlyHistogram = new Array(24).fill(0);
    let lateNight = 0;
    for (const s of valid) {
        const h = new Date(s.created_at!).getHours();
        hourlyHistogram[h]++;
        if (h >= 22 || h < 4) lateNight++;
    }
    const lateNightShare = valid.length ? lateNight / valid.length : 0;
    let peakHour: number | null = null;
    let peakCount = 0;
    hourlyHistogram.forEach((count, hour) => {
        if (count > peakCount) {
            peakCount = count;
            peakHour = hour;
        }
    });

    // Longest gap between consecutive saves (days)
    let longestGapDays = 0;
    for (let i = 1; i < valid.length; i++) {
        const gap = (new Date(valid[i].created_at!).getTime() - new Date(valid[i - 1].created_at!).getTime()) / DAY_MS;
        if (gap > longestGapDays) longestGapDays = gap;
    }

    const hasEnoughData = valid.length >= MIN_SAVES_FOR_PERSONALITY;

    return {
        totalSongs,
        songsThisWeek,
        streakDays,
        topArtists,
        topSongs,
        sourceMix,
        hourlyHistogram,
        peakHour,
        lateNightShare,
        peakLabel: hasEnoughData ? peakWindowLabel(peakHour) : null,
        hasEnoughData,
        firstSaveAt: valid.length ? valid[0].created_at! : null,
        longestGapDays: Math.round(longestGapDays),
    };
}
