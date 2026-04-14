import { ArrowLeft } from 'lucide-react';
import { Button } from './ui/button';
import { StatsView } from './StatsView';

interface StatsPageViewProps {
  onBack: () => void;
  theme: 'light' | 'dark';
  history?: any[];
  userName: string;
  songsThisWeek: number;
  streak: number;
}

export function StatsPageView({ onBack, theme, history = [], userName, songsThisWeek, streak }: StatsPageViewProps) {
  return (
    <div className="min-h-[100dvh] bg-background text-foreground">
      <header className="sticky top-0 z-40 border-b border-border/40 bg-background/75 backdrop-blur-3xl">
        <div className="container mx-auto px-safe py-4 md:px-6">
          <div className="flex items-center gap-4">
            <Button
              onClick={onBack}
              variant="ghost"
              size="icon"
              className="rounded-full hover:bg-muted/60"
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">Stats</p>
              <h1 className="text-xl font-semibold tracking-tight">Your listening snapshot</h1>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-safe py-6 md:px-6 md:py-8">
        <StatsView
          history={history}
          userName={userName}
          songsThisWeek={songsThisWeek}
          streak={streak}
        />
      </div>
    </div>
  );
}
