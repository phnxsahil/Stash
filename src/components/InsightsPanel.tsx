import { useMemo } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { computeInsights } from '../lib/insights';
import type { Song } from '../types';

interface InsightsPanelProps {
  history: Song[];
}

function formatHour(hour: number): string {
  if (hour === 0) return '12am';
  if (hour === 12) return '12pm';
  return hour < 12 ? `${hour}am` : `${hour - 12}pm`;
}

export function InsightsPanel({ history }: InsightsPanelProps) {
  const reduced = useReducedMotion();
  const insights = useMemo(() => computeInsights(history), [history]);
  if (insights.totalSongs === 0) return null;

  const maxBucket = Math.max(1, ...insights.hourlyHistogram);
  const lateNightPct = Math.round(insights.lateNightShare * 100);

  return (
    <section className="st-insights" aria-label="Listening personality">
      <div className="st-insights-head">
        <span className="st-insights-kicker">Your listening personality</span>
        {insights.peakLabel && (
          <span className="st-insights-peak">
            {insights.peakLabel}{insights.peakHour !== null ? ` · peaks ${formatHour(insights.peakHour)}` : ''}
          </span>
        )}
      </div>

      <div className="st-insights-strip" role="img"
        aria-label={`Saves by hour. Peak at ${insights.peakHour !== null ? formatHour(insights.peakHour) : 'n/a'}.`}>
        {insights.hourlyHistogram.map((count, hour) => (
          <motion.span
            key={hour}
            className={`st-insights-bar${count === maxBucket && count > 0 ? ' is-peak' : ''}`}
            title={`${formatHour(hour)}: ${count} saved`}
            initial={reduced ? false : { scaleY: 0 }}
            whileInView={{ scaleY: Math.max(count / maxBucket, count > 0 ? 0.12 : 0.03) }}
            viewport={{ once: true }}
            transition={{ duration: 0.4, delay: hour * 0.02 }}
          />
        ))}
      </div>
      <div className="st-insights-hours"><span>12am</span><span>6am</span><span>12pm</span><span>6pm</span><span>11pm</span></div>

      <div className="st-insights-facts">
        {insights.hasEnoughData ? (
          <>
            {lateNightPct > 0 && <span>{lateNightPct}% found late at night</span>}
            {insights.longestGapDays > 0 && <span>Longest dry spell: {insights.longestGapDays}d</span>}
            {insights.sourceMix.slice(0, 2).map((s) => (
              <span key={s.source}>{Math.round(s.share * 100)}% via {s.source}</span>
            ))}
          </>
        ) : (
          <span>{insights.totalSongs} saved so far - personality patterns unlock after 10 saves.</span>
        )}
      </div>
    </section>
  );
}
