import { Icon } from './stitch/StashUI';

interface QuickStatsProps {
  totalSongs: number; songsThisWeek: number; streak: number;
  onClick?: () => void; isLoading?: boolean; unavailable?: boolean;
}
export function QuickStats({ totalSongs, songsThisWeek, streak, onClick, isLoading, unavailable }: QuickStatsProps) {
  return <section className="st-library-stats" aria-label="Your stash stats">
    {[{ label: 'Stashed', value: totalSongs, icon: 'bookmark_added' }, { label: 'This Week', value: songsThisWeek, icon: 'trending_up' }, { label: 'Streak', value: streak, icon: 'local_fire_department' }].map(({ label, value, icon }, index) =>
      <button className="st-card" key={label} type="button" onClick={onClick} disabled={isLoading || unavailable} aria-label={isLoading ? `Loading ${label}` : unavailable ? `${label} unavailable` : `${value} ${label}${index === 2 ? ' days' : ''}. Open statistics`}>
        <span className="st-stat-label">{label}<Icon name={icon} size={16} /></span>
        {isLoading ? <span className="st-stat-loading" /> : !unavailable && <span className="st-stat-number">{index === 1 ? '+' : ''}{value}{index === 2 && <small>d</small>}</span>}
      </button>)}
  </section>;
}
