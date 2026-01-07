import { useState, useRef } from 'react';
import { LogOut, BarChart3, Radio, Link2, Music2, Sparkles, Menu, Sun, Moon, Settings } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Switch } from './ui/switch';
import { HistoryList } from './HistoryList';
import { QuickStats } from './QuickStats';
import { FloatingStashButton } from './FloatingStashButton';
import { AchievementBanner } from './AchievementBanner';
import { useIsMobile } from './ui/use-mobile';
import { Sheet, SheetContent, SheetTrigger } from './ui/sheet';
import { Avatar, AvatarFallback } from './ui/avatar';
import { Song } from '../lib/api';

interface AppViewProps {
  userName: string;
  history: Song[];
  songsThisWeek: number;
  streak: number;
  autoAddTopMatch: boolean;
  theme: 'light' | 'dark';
  onLogout: () => void;
  onStashSubmit: (url: string) => Promise<void>;
  onDeleteSong: (id: string) => void;
  onToggleAutoAdd: (value: boolean) => void;
  onToggleTheme: (value: 'light' | 'dark') => void;
  onOpenSettings: () => void;
  onOpenStats: () => void;
}

export function AppView({
  userName,
  history,
  songsThisWeek,
  streak,
  autoAddTopMatch,
  theme,
  onLogout,
  onStashSubmit,
  onDeleteSong,
  onToggleAutoAdd,
  onToggleTheme,
  onOpenSettings,
  onOpenStats,
}: AppViewProps) {
  const [url, setUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const isMobile = useIsMobile();
  const inputRef = useRef<HTMLInputElement>(null);

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
    <div className="min-h-screen bg-white dark:bg-black text-gray-900 dark:text-white pb-safe">
      {/* Header */}
      <header className="sticky top-0 z-40 backdrop-blur-xl bg-white/80 dark:bg-black/80 border-b border-gray-200 dark:border-white/10">
        <div className="container mx-auto px-4 md:px-6 py-3 md:py-4">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 md:w-10 md:h-10 rounded-xl bg-gradient-to-br from-[#1DB954] to-[#1ed760] flex items-center justify-center shadow-lg shadow-[#1DB954]/20">
                <Radio className="w-5 h-5 md:w-6 md:h-6 text-black" />
              </div>
              <span className="text-xl md:text-2xl text-[#1DB954]" style={{ fontWeight: 700, letterSpacing: '-0.02em' }}>Stash</span>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center gap-4">
              {/* Theme Toggle Switch */}
              <div className="flex items-center gap-2 px-3 py-2 rounded-full bg-gray-100 dark:bg-white/5 border border-gray-200 dark:border-white/10">
                <Sun className="w-4 h-4 text-gray-500 dark:text-gray-600" />
                <Switch
                  checked={theme === 'dark'}
                  onCheckedChange={(checked) => onToggleTheme(checked ? 'dark' : 'light')}
                  className="data-[state=checked]:bg-[#1DB954]"
                />
                <Moon className="w-4 h-4 text-gray-400 dark:text-white" />
              </div>

              <Button
                variant="ghost"
                size="sm"
                onClick={onOpenStats}
                className="text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-white/10"
              >
                <BarChart3 className="w-4 h-4" />
              </Button>

              <Button
                variant="ghost"
                size="sm"
                onClick={onOpenSettings}
                className="text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-white/10"
              >
                <Settings className="w-4 h-4" />
              </Button>

              <div className="w-px h-6 bg-gray-200 dark:bg-white/10" />

              <Avatar className="w-8 h-8 ring-2 ring-[#1DB954]/20">
                <AvatarFallback className="bg-gradient-to-br from-[#1DB954] to-[#1ed760] text-black font-semibold">
                  {userName.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{userName}</span>
            </div>

            {/* Mobile Menu */}
            <div className="md:hidden">
              <Sheet>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="icon" className="hover:bg-gray-100 dark:hover:bg-white/10">
                    <Menu className="w-5 h-5" />
                  </Button>
                </SheetTrigger>
                <SheetContent className="bg-white dark:bg-black border-gray-200 dark:border-white/10 text-gray-900 dark:text-white">
                  <div className="flex flex-col gap-6 pt-8">
                    <div className="flex items-center gap-3 pb-4 border-b border-gray-200 dark:border-white/10">
                      <Avatar className="w-12 h-12">
                        <AvatarFallback className="bg-[#1DB954]/20 text-[#1DB954]">
                          {userName.charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p>{userName}</p>
                        <p className="text-gray-600 dark:text-gray-400 text-sm">Free Account</p>
                      </div>
                    </div>
                    <div className="flex items-center justify-between py-2 border-b border-gray-200 dark:border-white/10">
                      <div className="flex items-center gap-3">
                        {theme === 'dark' ? <Moon className="w-5 h-5 text-white" /> : <Sun className="w-5 h-5 text-gray-500" />}
                        <span className="font-medium">Theme</span>
                      </div>
                      <Switch
                        checked={theme === 'dark'}
                        onCheckedChange={(checked) => onToggleTheme(checked ? 'dark' : 'light')}
                        className="data-[state=checked]:bg-[#1DB954]"
                      />
                    </div>
                    <Button
                      onClick={onOpenSettings}
                      variant="ghost"
                      className="justify-start hover:bg-gray-100 dark:hover:bg-white/10"
                    >
                      <Settings className="w-5 h-5 mr-3" />
                      Settings
                    </Button>
                    <Button
                      onClick={onOpenStats}
                      variant="ghost"
                      className="justify-start hover:bg-gray-100 dark:hover:bg-white/10"
                    >
                      <BarChart3 className="w-5 h-5 mr-3" />
                      Stats
                    </Button>
                    <Button
                      onClick={onLogout}
                      variant="ghost"
                      className="justify-start hover:bg-gray-100 dark:hover:bg-white/10"
                    >
                      <LogOut className="w-5 h-5 mr-3" />
                      Logout
                    </Button>
                  </div>
                </SheetContent>
              </Sheet>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="container mx-auto px-4 md:px-6 py-6 md:py-12 max-w-4xl pt-safe">
        {/* Quick Stats */}
        <QuickStats
          totalSongs={history.length}
          songsThisWeek={songsThisWeek}
          streak={streak}
          onClick={onOpenStats}
        />

        {/* Achievement Banner */}
        <AchievementBanner totalSongs={history.length} />

        {/* Stash Form */}
        <div className="mb-8 md:mb-12">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="glass-card backdrop-blur-sm rounded-2xl p-6 md:p-8 shadow-2xl">
              <div className="flex items-center gap-2 mb-4">
                <Link2 className="w-5 h-5 text-[#1DB954]" />
                <Label htmlFor="url-input" className="text-gray-700 dark:text-gray-200">
                  Paste a song link from anywhere
                </Label>
              </div>
              <div className="flex flex-col md:flex-row gap-3">
                <Input
                  ref={inputRef}
                  id="url-input"
                  type="text"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  placeholder="https://instagram.com/reel/..."
                  className="flex-1 bg-white dark:bg-white/10 border-gray-300 dark:border-white/20 text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500 h-12 md:h-14 rounded-xl focus:border-[#1DB954] focus:ring-[#1DB954]/50 transition-all"
                  disabled={isLoading}
                />
                <Button
                  type="submit"
                  disabled={isLoading || !url.trim()}
                  className="bg-[#1DB954] hover:bg-[#1ed760] text-white px-8 md:px-12 h-12 md:h-14 rounded-xl shadow-lg shadow-[#1DB954]/20 hover:shadow-[#1DB954]/40 transition-all"
                  style={{ fontWeight: 600, color: '#ffffff' }}
                >
                  {isLoading ? (
                    <>
                      <Sparkles className="w-4 h-4 mr-2 animate-spin" />
                      Stashing...
                    </>
                  ) : (
                    'Stash'
                  )}
                </Button>
              </div>
            </div>
          </form>
        </div>

        {/* Auto-add Toggle */}
        <div className="mb-8 md:mb-12 space-y-4">
          <div className="glass-card backdrop-blur-sm rounded-2xl p-6 shadow-lg">
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-start gap-3 flex-1">
                <Music2 className="w-5 h-5 text-[#1DB954] mt-0.5" />
                <div className="flex-1">
                  <Label htmlFor="auto-add-toggle">Auto-add top match</Label>
                  <p className="text-gray-600 dark:text-gray-400 text-sm mt-1">
                    Automatically save the best match without preview
                  </p>
                </div>
              </div>
              <Switch
                id="auto-add-toggle"
                checked={autoAddTopMatch}
                onCheckedChange={onToggleAutoAdd}
                className="data-[state=checked]:bg-[#1DB954] mt-1"
              />
            </div>
          </div>
        </div>

        {/* History List */}
        <HistoryList history={history} onDeleteSong={onDeleteSong} />
      </div>

      {/* Floating Stash Button - Mobile Only */}
      {isMobile && <FloatingStashButton onClick={handleFloatingButtonClick} />}
    </div>
  );
}