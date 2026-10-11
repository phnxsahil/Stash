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
    <section className="grid grid-cols-3 gap-3 sm:grid-cols-3 md:gap-6" aria-label="Quick stats">
      {cards.map((card) => {
        const Icon = card.icon;
        return (
          <button
            key={card.label}
            type="button"
            onClick={onClick}
            className="group flex items-center gap-3 border-b border-border py-4 text-left transition-all hover:scale-[1.02] active:scale-[0.98] outline-focus "
          >
            <div className={`hidden md:grid h-10 w-10 place-items-center rounded-2xl border border-border/40 bg-card/50 shadow-sm transition-colors group-hover:border-primary/20  ${card.color}`}>
              <Icon className="w-6 h-6 md:w-7 md:h-7" />
            </div>
            <div className="min-w-0">
              <p className="text-[1.65rem] font-bold tracking-tight sm:mb-1 md:text-2xl">{card.value}</p>
              <p className="text-[9px] font-bold uppercase tracking-[0.18em] text-muted-foreground md:text-[10px]">{card.label}</p>
            </div>
          </button>
        );
      })}
    </section>
  );
}
