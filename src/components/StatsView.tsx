import { Trophy, Sparkles, Music } from './stitch/StashIcons';
import { InstagramExport } from './InstagramExport';
import { StatsScreen } from './stitch/StatsScreen';
import { useEffect, useState } from 'react';
import { Song, Playlist, api } from '../lib/api';

interface StatsViewProps {
  history: Song[];
  userName: string;
  songsThisWeek: number;
  streak: number;
  playlists?: Playlist[];
  defaultPlaylistId?: string;
}

const COLORS = ['#1DB954', '#17c964', '#22c55e', '#7dd3a4', '#b7f0cb'];

export function StatsView({ history, userName, songsThisWeek, streak, playlists = [], defaultPlaylistId }: StatsViewProps) {
  const [vibe, setVibe] = useState<string>('Analyzing your vibe...');

  const genreCounts: Record<string, number> = {};
  history.forEach((song) => {
    const g = song.genre || 'Unknown';
    genreCounts[g] = (genreCounts[g] || 0) + 1;
  });

  const genreData = Object.entries(genreCounts)
    .map(([name, value], idx) => ({
      name,
      value: Math.round((value / history.length) * 100),
      count: value,
      color: COLORS[idx % COLORS.length],
    }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);

  const artistCounts: Record<string, { count: number; art: string }> = {};
  history.forEach((song) => {
    if (!artistCounts[song.artist]) {
      artistCounts[song.artist] = { count: 0, art: song.album_art_url };
    }
    artistCounts[song.artist].count += 1;
  });

  const topArtists = Object.entries(artistCounts)
    .map(([name, data]) => ({
      name,
      count: data.count,
      art: data.art,
    }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 3);

  const achievements = [
    { title: 'First Stash', target: 1, current: history.length, icon: Sparkles },
    { title: 'Collector', target: 10, current: history.length, icon: Music },
    { title: 'Music Lover', target: 25, current: history.length, icon: Trophy },
  ];

  useEffect(() => {
    if (history.length > 0) {
      api.getVibeAnalysis(history)
        .then(setVibe)
        .catch(() => setVibe('Eclectic and curious.'));
    } else {
      setVibe('No songs yet. Start stashing.');
    }
  }, [history]);

  return <StatsScreen history={history} vibe={vibe} songsThisWeek={songsThisWeek} streak={streak} genreData={genreData} topArtists={topArtists} achievements={achievements} playlists={playlists} defaultPlaylistId={defaultPlaylistId} exportControl={<InstagramExport totalSongs={history.length} genreData={genreData} topArtists={topArtists} streak={streak} compact />} />;
}
