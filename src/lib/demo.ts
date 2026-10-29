// Demo mode: sample data so the product can be explored without a Spotify
// connection. Enabled only via VITE_DEMO_MODE=1 at build time and clearly
// labelled in the UI. Nothing here touches a real account.

import type { Song } from '../types';

export const DEMO_MODE = import.meta.env.VITE_DEMO_MODE === '1';

const hours = [23, 1, 22, 14, 0, 23, 2, 16, 22, 1, 13, 23, 0, 21, 2, 22, 15, 1];

const demoSongs: Array<[string, string, string, number]> = [
    ['Nights', 'Frank Ocean', 'YouTube', 23],
    ['Saiyaara', 'Tanishk Bagchi', 'Instagram', 1],
    ['Midnight City', 'M83', 'Instagram', 22],
    ['Tum Hi Ho', 'Arijit Singh', 'YouTube', 14],
    ['Get Lucky', 'Daft Punk', 'Instagram', 0],
    ['Pasoori', 'Ali Sethi', 'Instagram', 23],
    ['Blinding Lights', 'The Weeknd', 'YouTube', 2],
    ['Clair de Lune', 'Debussy', 'YouTube', 16],
    ['Starboy', 'The Weeknd', 'Instagram', 22],
    ['Kesariya', 'Arijit Singh', 'Instagram', 1],
    ['Sunflower', 'Post Malone', 'YouTube', 13],
    ['After Hours', 'The Weeknd', 'Instagram', 23],
    ['Raabta', 'Arijit Singh', 'YouTube', 0],
    ['Levitating', 'Dua Lipa', 'Instagram', 21],
    ['Time', 'Hans Zimmer', 'YouTube', 2],
    ['Starlight', 'Muse', 'Instagram', 22],
    ['O Bedardeya', 'Arijit Singh', 'YouTube', 15],
    ['Heat Waves', 'Glass Animals', 'Instagram', 1],
];

export function buildDemoHistory(): Song[] {
    const now = Date.now();
    return demoSongs.map(([song, artist, source, hour], i) => {
        const d = new Date(now - i * 21 * 60 * 60 * 1000);
        d.setHours(hour, Math.floor(Math.random() * 50), 0, 0);
        return {
            id: `demo-${i}`,
            song,
            artist,
            source,
            album_art_url: '',
            spotify_url: 'https://open.spotify.com/',
            genre: ['Pop', 'Bollywood', 'Electronic', 'Indie'][i % 4],
            created_at: d.toISOString(),
        };
    });
}
