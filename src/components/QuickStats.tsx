import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { Flame } from 'lucide-react';

interface QuickStatsProps {
  totalSongs: number;
  songsThisWeek: number;
  streak: number;
  onClick?: () => void;
  isLoading?: boolean;
  unavailable?: boolean;
}

export function QuickStats({ totalSongs, songsThisWeek, streak, onClick, isLoading, unavailable }: QuickStatsProps) {
  const reduced = useReducedMotion();
  return <section className="library-stats" aria-label="Your stash stats">
    {[{label:'Total stashed',value:totalSongs}, {label:'New this week',value:songsThisWeek}, {label:'Active streak',value:streak}].map(({label,value}, index) =>
      <button key={label} type="button" onClick={onClick} disabled={isLoading || unavailable} aria-label={isLoading ? `Loading ${label}` : unavailable ? `${label} unavailable` : `${value} ${label}${index === 2 ? ' days' : ''}. Open statistics`}>
        <div className="stat-value">
          {isLoading ? <span className="capture-shimmer stat-skeleton" aria-hidden="true" /> : unavailable ? <span>—</span> : <>
          {index === 2 && <motion.span key={`flame-${value}`} initial={false} animate={reduced ? {} : {scale:[1,1.2,1],rotate:[0,-8,0]}} transition={{duration:.45}}><Flame size={22} aria-hidden="true" /></motion.span>}
          <AnimatePresence mode="popLayout" initial={false}>
            <motion.span key={value} initial={reduced ? false : {y:12,opacity:0}} animate={{y:0,opacity:1}} exit={reduced ? undefined : {y:-12,opacity:0}} transition={{duration:.25}}>{value}</motion.span>
          </AnimatePresence>
          {index === 2 && <small>{value === 1 ? 'day' : 'days'}</small>}
          </>}
        </div>
        <span className="stat-label">{label}</span>
      </button>
    )}
  </section>;
}
