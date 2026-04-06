import { Calendar, Music2, TrendingUp } from 'lucide-react';

interface QuickStatsProps {
  totalSongs: number;
  songsThisWeek: number;
  streak: number;
  onClick?: () => void;
}

export function QuickStats({ totalSongs, songsThisWeek, streak, onClick }: QuickStatsProps) {
  const cards = [
    { label: 'Total Stashed', value: totalSongs, icon: Music2, color: 'text-primary' },
    { label: 'New This Week', value: songsThisWeek, icon: TrendingUp, color: 'text-sky-500' },
    { label: 'Active Streak', value: streak, icon: Calendar, color: 'text-emerald-500' },
  ];

  return (
    <section className="grid grid-cols-3 gap-3 md:gap-6" aria-label="Quick stats">
      {cards.map((card) => {
        const Icon = card.icon;
        return (
          <button
            key={card.label}
            type="button"
            onClick={onClick}
            className="surface-panel p-4 md:p-7 text-center transition-all hover:scale-[1.03] active:scale-[0.97] outline-focus group"
          >
            <div className={`w-11 h-11 md:w-14 md:h-14 mx-auto mb-3 md:mb-4 rounded-2xl grid place-items-center bg-card/50 border border-border/40 shadow-sm group-hover:border-primary/20 transition-colors ${card.color}`}>
              <Icon className="w-6 h-6 md:w-7 md:h-7" />
            </div>
            <p className="text-xl md:text-4xl font-bold tracking-tight mb-1">{card.value}</p>
            <p className="text-[9px] md:text-xs uppercase tracking-[0.18em] font-bold text-muted-foreground">{card.label}</p>
          </button>
        );
      })}
    </section>
  );
}
