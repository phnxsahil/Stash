import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowUpRight, BarChart3, Link2, LogOut, Menu, Moon, Music2, Radio, Settings, Sparkles, Sun } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Switch } from './ui/switch';
import { HistoryList } from './HistoryList';
import { QuickStats } from './QuickStats';
import LoadingSkeleton from './LoadingSkeleton';
import { FloatingStashButton } from './FloatingStashButton';
import { AchievementBanner } from './AchievementBanner';
import { useIsMobile } from './ui/use-mobile';
import { Sheet, SheetContent, SheetTrigger } from './ui/sheet';
import { Avatar, AvatarFallback } from './ui/avatar';
import { Song } from '../lib/api';
import logoLight from '../assets/stash_logo.png';
import logoDark from '../assets/logoDark_new.png';

interface AppViewProps {
  userName: string;
  history: Song[];
  songsThisWeek: number;
  streak: number;
  isLoadingHistory?: boolean;
  autoAddTopMatch: boolean;
  theme: 'light' | 'dark';
  onLogout: () => void;
  onStashSubmit: (url: string) => Promise<void>;
  onDeleteSong: (id: string) => void;
  onToggleAutoAdd: (value: boolean) => void;
  onToggleTheme: (value: 'light' | 'dark') => void;
  onOpenSettings: () => void;
  onOpenStats: () => void;
  pendingSharedUrl?: string | null;
}

const panelAnim = {
  hidden: { opacity: 0, y: 12 },
  show: { opacity: 1, y: 0, transition: { duration: 0.38, ease: [0.22, 1, 0.36, 1] } },
};

export function AppView({
  userName,
  history,
  songsThisWeek,
  streak,
  isLoadingHistory,
  autoAddTopMatch,
  theme,
  onLogout,
  onStashSubmit,
  onDeleteSong,
  onToggleAutoAdd,
  onToggleTheme,
  onOpenSettings,
  onOpenStats,
  pendingSharedUrl,
}: AppViewProps) {
  const [url, setUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const isMobile = useIsMobile();
  const inputRef = useRef<HTMLInputElement>(null);
  const activeLogo = theme === 'dark' ? logoDark : logoLight;

  useEffect(() => {
    if (!pendingSharedUrl) return;
    setUrl(pendingSharedUrl);
    window.requestAnimationFrame(() => {
      inputRef.current?.focus();
      inputRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    });
  }, [pendingSharedUrl]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!url.trim() || isLoading) return;

    setIsLoading(true);
    try {
      await onStashSubmit(url);
      setUrl('');
    } finally {
      setIsLoading(false);
    }
  };

  const handleFloatingButtonClick = () => {
    inputRef.current?.focus();
    inputRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  };

  return (
    <div className="min-h-screen pb-safe relative overflow-hidden">
      <motion.div
        aria-hidden
        className="pointer-events-none absolute -top-20 right-0 w-96 h-96 rounded-full bg-primary/12 blur-[100px]"
        animate={{ x: [0, -20, 10, 0], y: [0, 15, -10, 0] }}
        transition={{ duration: 20, repeat: Infinity, ease: 'easeInOut' }}
      />

      <header className="sticky top-0 z-40 border-b border-border/40 bg-background/70 backdrop-blur-3xl">
        <div className="container mx-auto px-4 md:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-11 h-11 rounded-2xl border border-border/50 bg-card/60 grid place-items-center overflow-hidden shadow-sm">
                <img src={activeLogo} alt="Stash logo" className="w-9 h-9 object-contain" />
              </div>
              <div className="hidden sm:block">
                <p className="mb-1 text-[10px] font-semibold uppercase leading-none tracking-[0.22em] text-muted-foreground">Dashboard</p>
                <p className="text-sm font-medium tracking-tight">Welcome, {userName}</p>
              </div>
            </div>

            <div className="hidden md:flex items-center gap-4">
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-full border border-border/50 bg-card/50 shadow-sm">
                <Sun className="w-3.5 h-3.5 text-muted-foreground" />
                <Switch
                  checked={theme === 'dark'}
                  onCheckedChange={(checked) => onToggleTheme(checked ? 'dark' : 'light')}
                  className="data-[state=checked]:bg-primary"
                />
                <Moon className="w-3.5 h-3.5 text-muted-foreground" />
              </div>

              <div className="flex items-center gap-2">
                <Button variant="ghost" size="icon" onClick={onOpenStats} className="rounded-full hover:bg-muted/50">
                  <BarChart3 className="w-4.5 h-4.5" />
                </Button>
                <Button variant="ghost" size="icon" onClick={onOpenSettings} className="rounded-full hover:bg-muted/50">
                  <Settings className="w-4.5 h-4.5" />
                </Button>
              </div>

              <Avatar className="w-10 h-10 border border-border/50 shadow-sm">
                <AvatarFallback className="bg-primary/10 text-primary font-bold">{userName.charAt(0).toUpperCase()}</AvatarFallback>
              </Avatar>
            </div>

            <div className="md:hidden">
              <Sheet>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="icon" className="rounded-full">
                    <Menu className="w-6 h-6" />
                  </Button>
                </SheetTrigger>
                <SheetContent className="bg-background/95 backdrop-blur-xl border-border/40 text-foreground">
                  <div className="pt-10 flex flex-col gap-6">
                    <div className="surface-muted p-5 flex items-center gap-4">
                      <Avatar className="w-12 h-12 border border-border/40 shadow-sm">
                        <AvatarFallback className="bg-primary/10 text-primary font-bold">{userName.charAt(0).toUpperCase()}</AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="text-lg font-semibold">{userName}</p>
                        <p className="text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">Personal library</p>
                      </div>
                    </div>

                    <div className="surface-muted p-5 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        {theme === 'dark' ? <Moon className="w-5 h-5 text-primary" /> : <Sun className="w-5 h-5 text-primary" />}
                        <span className="font-semibold">Dark Mode</span>
                      </div>
                      <Switch
                        checked={theme === 'dark'}
                        onCheckedChange={(checked) => onToggleTheme(checked ? 'dark' : 'light')}
                        className="data-[state=checked]:bg-primary"
                      />
                    </div>

                    <div className="grid gap-2">
                      <Button onClick={onOpenStats} variant="ghost" className="justify-start h-12 font-semibold rounded-xl hover:bg-muted/50">
                        <BarChart3 className="w-5 h-5 mr-3 text-primary" />
                        Statistics
                      </Button>
                      <Button onClick={onOpenSettings} variant="ghost" className="justify-start h-12 font-semibold rounded-xl hover:bg-muted/50">
                        <Settings className="w-5 h-5 mr-3 text-primary" />
                        Settings
                      </Button>
                      <Button onClick={onLogout} variant="ghost" className="justify-start h-12 font-semibold rounded-xl text-destructive hover:bg-destructive/10">
                        <LogOut className="w-5 h-5 mr-3" />
                        Logout
                      </Button>
                    </div>
                  </div>
                </SheetContent>
              </Sheet>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 md:px-8 py-6 md:py-14 max-w-5xl space-y-8 md:space-y-10">
        <motion.section variants={panelAnim} initial="hidden" animate="show">
          <QuickStats totalSongs={history.length} songsThisWeek={songsThisWeek} streak={streak} onClick={onOpenStats} />
        </motion.section>

        <motion.section variants={panelAnim} initial="hidden" animate="show" transition={{ delay: 0.05 }}>
          <AchievementBanner totalSongs={history.length} />
        </motion.section>

        <motion.section variants={panelAnim} initial="hidden" animate="show" transition={{ delay: 0.08 }} className="surface-panel p-5 md:p-9 bg-gradient-to-br from-card/95 via-card/84 to-accent/28 relative overflow-hidden">
          <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary/40 to-transparent" />
          <form onSubmit={handleSubmit} className="space-y-6">
            {pendingSharedUrl && (
              <div className="rounded-2xl border border-primary/25 bg-primary/7 px-5 py-4 text-sm animate-in fade-in slide-in-from-top-2">
                <div className="flex items-start gap-4">
                  <div className="mt-0.5 flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10 text-primary shadow-sm">
                    <ArrowUpRight className="h-5 w-5" />
                  </div>
                  <div className="min-w-0">
                    <p className="font-semibold text-foreground">Shared link ready</p>
                    <p className="mt-1 truncate text-xs font-medium text-muted-foreground">{pendingSharedUrl}</p>
                  </div>
                </div>
              </div>
            )}

            <div className="beta-chip">
              <Radio className="h-3.5 w-3.5" />
              Spotify private beta access
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Link2 className="w-4.5 h-4.5 text-primary" />
                </div>
                <Label htmlFor="url-input" className="text-base font-semibold tracking-tight">
                  Capture from feed
                </Label>
              </div>
              <p className="max-w-2xl text-sm leading-relaxed text-muted-foreground">
                Paste any social link. Stash handles extraction, identification, and sync while keeping the mobile flow clear and lightweight.
              </p>
            </div>

            <div className="grid gap-4 md:grid-cols-[1fr_auto]">
              <div className="relative group">
                <Input
                  ref={inputRef}
                  id="url-input"
                  type="url"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  placeholder="https://instagram.com/reel/..."
                  className="h-14 rounded-2xl bg-background/44 border-border/50 focus:border-primary/50 px-5 text-base font-medium transition-all shadow-inner"
                  disabled={isLoading}
                  aria-label="Music source URL"
                />
                <div className="absolute inset-0 rounded-2xl pointer-events-none border border-primary/0 group-focus-within:border-primary/20 transition-all" />
              </div>
              <Button type="submit" disabled={isLoading || !url.trim()} className="green-glow h-14 rounded-2xl bg-primary px-8 text-base font-semibold text-primary-foreground transition-all hover:scale-[1.02] hover:opacity-90 active:scale-[0.98]">
                {isLoading ? (
                  <>
                    <Sparkles className="w-5 h-5 mr-3 animate-spin" />
                    Stashing...
                  </>
                ) : (
                  'Stash this song'
                )}
              </Button>
            </div>
          </form>
        </motion.section>

        <motion.section variants={panelAnim} initial="hidden" animate="show" transition={{ delay: 0.12 }} className="surface-panel p-6 md:p-8">
          <div className="flex items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-primary/8 flex items-center justify-center shadow-sm">
                <Music2 className="w-6 h-6 text-primary" />
              </div>
              <div>
                <Label htmlFor="auto-add-toggle" className="text-base font-semibold tracking-tight">
                  Auto-add top match
                </Label>
                <p className="mt-0.5 text-sm text-muted-foreground">
                  Skip the confirmation step for 2x faster stashing.
                </p>
              </div>
            </div>
            <Switch id="auto-add-toggle" checked={autoAddTopMatch} onCheckedChange={onToggleAutoAdd} className="scale-110 data-[state=checked]:bg-primary" />
          </div>
        </motion.section>

        <motion.section variants={panelAnim} initial="hidden" animate="show" transition={{ delay: 0.16 }}>
          {isLoadingHistory && history.length === 0 ? (
            <div className="space-y-6">
              <div className="flex items-center justify-between px-2">
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">Library</p>
                  <h2 className="text-2xl font-semibold tracking-tight">Loading your stash</h2>
                </div>
              </div>
              <LoadingSkeleton variant="history" lines={4} />
            </div>
          ) : (
            <HistoryList history={history} onDeleteSong={onDeleteSong} />
          )}
        </motion.section>
      </main>

      {isMobile && <div className="pb-safe"><FloatingStashButton onClick={handleFloatingButtonClick} /></div>}
    </div>
  );
}
