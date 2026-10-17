import { useMemo, useState, type ReactNode } from 'react';
import type { Playlist, Song } from '../../types';
import { ComingSoon, Icon, StashCard, StashRow } from './StashUI';

interface StatsScreenProps {
  history: Song[]; vibe: string; songsThisWeek: number; streak: number;
  genreData: { name: string; count: number }[];
  topArtists: { name: string; count: number; art: string }[];
  playlists: Playlist[]; defaultPlaylistId?: string; exportControl: ReactNode;
  achievements: { title: string; current: number; target: number }[];
}

const weekdays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
function DailyChart({ counts }: { counts: number[] }) {
  const maximum = Math.max(...counts, 1);
  const total = counts.reduce((a, b) => a + b, 0);
  const peak = counts.indexOf(Math.max(...counts));
  return <div className="st-daily-chart"><div className="st-chart-heading"><h2>Daily ingestion</h2>{total > 0 && <span>Peak: {weekdays[peak]} ({counts[peak]})</span>}</div><div className="st-bars" role="img" aria-label={counts.map((count, index) => `${weekdays[index]}: ${count} tracks`).join(', ')}>{counts.map((count, index) => <div className={`st-bar-column ${total && index === peak ? 'is-peak' : ''}`} key={index}><div className="st-bar-track"><div style={{ height: `${count / maximum * 100}%` }} /></div><span>{weekdays[index].slice(0, 1)}</span></div>)}</div>{total === 0 && <p className="st-muted">No dated captures in this period.</p>}</div>;
}

export function StatsScreen({ history, vibe, songsThisWeek, streak, genreData, topArtists, playlists, defaultPlaylistId, exportControl, achievements }: StatsScreenProps) {
  const [period, setPeriod] = useState<'week' | 'month' | 'all'>('all');
  const periodHistory = useMemo(() => history.filter(song => period === 'all' || (song.created_at && Date.now() - Date.parse(song.created_at) < (period === 'week' ? 7 : 30) * 86400000)), [history, period]);
  const counts = useMemo(() => {
    const daily = Array(7).fill(0) as number[];
    periodHistory.forEach(song => { const date = new Date(song.created_at || ''); if (!Number.isNaN(date.getTime())) daily[(date.getDay() + 6) % 7]++; });
    return daily;
  }, [periodHistory]);
  const sources = useMemo(() => {
    const totals: Record<string, number> = {};
    periodHistory.forEach(song => { const source = song.source || 'Web'; totals[source] = (totals[source] || 0) + 1; });
    return Object.entries(totals).sort((a, b) => b[1] - a[1]);
  }, [periodHistory]);
  return <div className="st-stats-content">
    <header className="st-stats-heading"><div><p className="st-label">Sonic Summary<span className="st-desktop-extra"> & Discovery Analytics</span></p><h1>Analytics</h1></div><div className="st-stats-actions">{exportControl}<button disabled className="st-telemetry-button"><Icon name="sync" size={16} />Sync telemetry<ComingSoon /></button></div>
      <div className="st-period" role="group" aria-label="Analytics period">{(['week', 'month', 'all'] as const).map(value => <button key={value} aria-pressed={period === value} onClick={() => setPeriod(value)}>{value === 'all' ? 'All Time' : value === 'week' ? 'Week' : 'Month'}</button>)}</div>
    </header>
    <div className="st-analytics-grid">
      <StashCard className="st-capture-volume"><h2 className="st-label"><Icon name="graphic_eq" size={18} />Capture volume</h2><p className="st-volume-number">{periodHistory.length}<span>tracks</span></p><p className="st-muted st-volume-caption">Saved in your Stash history.</p><div className="st-mobile-chart"><DailyChart counts={counts} /></div></StashCard>
      <StashCard className="st-discovery-insight"><span className="st-insight-icon"><Icon name="dark_mode" size={20} filled /></span><div><div className="st-insight-heading"><h2>Discovery insight</h2><span>Insight</span></div><p>{vibe}</p></div></StashCard>
      <StashCard className="st-desktop-chart"><DailyChart counts={counts} /></StashCard>
      <StashCard className="st-capture-sources"><h2 className="st-label">Capture sources</h2><p className="st-source-caption">Share distribution{periodHistory.length > 0 && ` • ${periodHistory.length} tracks`}</p>{sources.length > 0 ? <><div className="st-source-distribution" aria-hidden="true">{sources.map(([name, count], index) => <span key={name} style={{ width: `${count / periodHistory.length * 100}%`, opacity: Math.max(.25, 1 - index * .2) }} />)}</div>{sources.map(([name, count]) => <StashRow key={name} icon={name === 'Instagram' ? 'movie' : name === 'YouTube' ? 'play_arrow' : name === 'TikTok' ? 'music_note' : 'link'} title={name === 'Instagram' ? 'Instagram Reels' : name === 'YouTube' ? 'YouTube Shorts' : name} description={`${count} ${count === 1 ? 'track' : 'tracks'} ingested`} trailing={<strong>{Math.round(count / periodHistory.length * 100)}%</strong>} />)}</> : <p className="st-muted">Stash your first song to see capture sources.</p>}</StashCard>
      <StashCard className="st-top-genres"><div className="st-card-heading"><h2 className="st-label">Top genres</h2><span>Ranked</span></div>{genreData.filter(genre => genre.name !== 'Unknown').map((genre, index) => <div className="st-genre-row" key={genre.name}><strong>#{index + 1}</strong><div><h3>{genre.name}</h3><p>{genre.count} tracks</p></div></div>)}{!genreData.some(genre => genre.name !== 'Unknown') && <p className="st-muted">Genre information is not available for your saved tracks yet.</p>}</StashCard>
      <StashCard className="st-stats-destinations"><div className="st-card-heading"><h2 className="st-label">Spotify destinations</h2><button disabled aria-label="Manage routing rules — coming soon"><Icon name="sync" size={16} /><ComingSoon /></button></div>{playlists.map(playlist => <StashRow key={playlist.id} icon={playlist.id === '1' ? 'favorite' : 'tune'} title={playlist.name} description={playlist.id === defaultPlaylistId ? 'Default sync destination' : 'Available Spotify destination'} />)}{playlists.length === 0 && <p className="st-muted">Connect Spotify to see your destinations.</p>}</StashCard>
    </div>
    <details className="st-existing-stats"><summary>More from your Stash<Icon name="expand_more" size={20} /></summary><div className="st-existing-stats-content"><StashCard><h2>Activity</h2><StashRow icon="trending_up" title={`${songsThisWeek} songs this week`} /><StashRow icon="local_fire_department" title={`${streak}-day streak`} /></StashCard><StashCard><h2>Top artists</h2>{topArtists.map(artist => <StashRow key={artist.name} icon="person" title={artist.name} description={`${artist.count} stashes`} />)}{!topArtists.length && <p className="st-muted">No artists yet.</p>}</StashCard><StashCard><h2>Achievements</h2>{achievements.map(achievement => <StashRow key={achievement.title} icon={achievement.current >= achievement.target ? 'check_circle' : 'military_tech'} title={achievement.title} description={achievement.current >= achievement.target ? 'Complete' : `${achievement.current}/${achievement.target} songs`} />)}</StashCard></div></details>
  </div>;
}
