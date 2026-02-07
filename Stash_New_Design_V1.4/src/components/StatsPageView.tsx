import { ArrowLeft } from 'lucide-react';
import { Button } from './ui/button';
import { StatsView } from './StatsView';

interface StatsPageViewProps {
  onBack: () => void;
  theme: 'light' | 'dark';
  history?: any[];
}

export function StatsPageView({ onBack, theme, history = [] }: StatsPageViewProps) {
  return (
    <div className="min-h-screen bg-white dark:bg-black text-gray-900 dark:text-white noise-texture">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 backdrop-blur-xl bg-white/80 dark:bg-black/80 border-b border-gray-200 dark:border-white/10">
        <div className="container mx-auto px-4 md:px-6 py-4">
          <div className="flex items-center gap-4">
            <Button
              onClick={onBack}
              variant="ghost"
              size="icon"
              className="hover:bg-gray-100 dark:hover:bg-white/10"
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <h1 style={{ fontWeight: 600 }}>Your Stats</h1>
          </div>
        </div>
      </header>

      {/* Content - Use enhanced StatsView */}
      <div className="pt-16">
        <StatsView history={history} />
      </div>
    </div>
  );
}