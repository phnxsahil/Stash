import { useState, useRef } from 'react';
import { LogOut, BarChart3, Radio, Link2, Music2, Sparkles, Menu, Sun, Moon, Settings } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Switch } from './ui/switch';
import { HistoryList } from './HistoryList';
import { QuickStats } from './QuickStats';
import { FloatingStashButton } from './FloatingStashButton';
import { useIsMobile } from './ui/use-mobile';
import { Sheet, SheetContent, SheetTrigger } from './ui/sheet';
import { Avatar, AvatarFallback } from './ui/avatar';

interface Song {
  id: string;
  song: string;
  artist: string;
  source: string;
  album_art_url: string;
  preview_url?: string;
}

interface AppViewProps {
  userName: string;
  history: Song[];
  autoAddTopMatch: boolean;
  theme: 'light' | 'dark';
  onLogout: () => void;
  onStashSubmit: (url: string) => Promise<void>;
  onDeleteSong: (id: string) => void;
  onToggleAutoAdd: (value: boolean) => void;
  onToggleTheme: (value: 'light' | 'dark') => void;
  onOpenSettings: () => void;
  processingStatus?: string;
}

export function AppView({
  userName,
  history,
  autoAddTopMatch,
  theme,
  onLogout,
  onStashSubmit,
  onDeleteSong,
  onToggleAutoAdd,
  onToggleTheme,
  onOpenSettings,
  processingStatus,
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
    <div className="min-h-screen bg-white dark:bg-black text-gray-900 dark:text-white pb-safe noise-texture">
      {/* Header */}
      <header className="sticky top-0 z-40 backdrop-blur-xl bg-white/80 dark:bg-black/80 border-b border-gray-200 dark:border-white/10">
        <div className="container mx-auto px-4 md:px-6 py-3 md:py-4">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 md:w-10 md:h-10 rounded-lg bg-gradient-to-br from-[#1DB954] to-[#1ed760] flex items-center justify-center shadow-lg">
                <Radio className="w-5 h-5 md:w-6 md:h-6 text-black" />
              </div>
              <span className="text-[#1DB954] hidden sm:inline drop-shadow-sm" style={{ fontWeight: 600 }}>Stash</span>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center gap-4">
              <Button
                variant="ghost"
                className="opacity-50 pointer-events-none text-gray-500"
                disabled
              >
                <BarChart3 className="w-4 h-4 mr-2" />
                Stats
              </Button>
              <Avatar className="w-8 h-8">
                <AvatarFallback className="bg-[#1DB954]/20 text-[#1DB954]">
                  {userName.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <span className="text-gray-700 dark:text-gray-400">{userName}</span>
              <Button
                onClick={onOpenSettings}
                variant="ghost"
                className="hover:bg-gray-100 dark:hover:bg-white/10"
              >
                <Settings className="w-4 h-4 mr-2" />
                Settings
              </Button>
              <Button
                onClick={onLogout}
                variant="ghost"
                className="hover:bg-gray-100 dark:hover:bg-white/10"
              >
                <LogOut className="w-4 h-4 mr-2" />
                Logout
              </Button>
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
                    <Button
                      onClick={onOpenSettings}
                      variant="ghost"
                      className="justify-start hover:bg-gray-100 dark:hover:bg-white/10"
                    >
                      <Settings className="w-5 h-5 mr-3" />
                      Settings
                    </Button>
                    <Button
                      variant="ghost"
                      className="justify-start opacity-50 pointer-events-none"
                      disabled
                    >
                      <BarChart3 className="w-5 h-5 mr-3" />
                      Stats (Coming Soon)
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
      <div className="container mx-auto px-4 md:px-6 py-6 md:py-12 max-w-4xl">
        {/* Quick Stats */}
        <QuickStats totalSongs={history.length} />

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
                  className="bg-[#1DB954] hover:bg-[#1ed760] text-black px-8 md:px-12 h-12 md:h-14 rounded-xl shadow-lg shadow-[#1DB954]/20 hover:shadow-[#1DB954]/40 transition-all"
                  style={{ fontWeight: 600 }}
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

        {/* Settings - Desktop: Switch, Mobile: Button */}
        <div className="mb-8 md:mb-12 space-y-4">
          {/* Theme Toggle */}
          <div className="glass-card backdrop-blur-sm rounded-2xl p-6 shadow-lg">
            {isMobile ? (
              // Mobile: Button Layout
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  {theme === 'dark' ? (
                    <Moon className="w-5 h-5 text-[#1DB954] mt-0.5" />
                  ) : (
                    <Sun className="w-5 h-5 text-[#1DB954] mt-0.5" />
                  )}
                  <div className="flex-1">
                    <Label>Theme</Label>
                    <p className="text-gray-600 dark:text-gray-400 text-sm mt-1">
                      Choose your preferred color scheme
                    </p>
                  </div>
                </div>
                <Button
                  onClick={() => onToggleTheme(theme === 'dark' ? 'light' : 'dark')}
                  variant="outline"
                  className="w-full h-12 rounded-xl transition-all bg-[#1DB954]/20 border-[#1DB954] text-[#1DB954] hover:bg-[#1DB954]/30"
                >
                  {theme === 'dark' ? (
                    <>
                      <Sun className="w-4 h-4 mr-2" />
                      Switch to Light Mode
                    </>
                  ) : (
                    <>
                      <Moon className="w-4 h-4 mr-2" />
                      Switch to Dark Mode
                    </>
                  )}
                </Button>
              </div>
            ) : (
              // Desktop: Toggle Switch
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-3 flex-1">
                  {theme === 'dark' ? (
                    <Moon className="w-5 h-5 text-[#1DB954] mt-0.5" />
                  ) : (
                    <Sun className="w-5 h-5 text-[#1DB954] mt-0.5" />
                  )}
                  <div className="flex-1">
                    <Label htmlFor="theme-toggle">Theme</Label>
                    <p className="text-gray-600 dark:text-gray-400 text-sm mt-1">
                      {theme === 'dark' ? 'Dark mode enabled' : 'Light mode enabled'}
                    </p>
                  </div>
                </div>
                <Switch
                  id="theme-toggle"
                  checked={theme === 'dark'}
                  onCheckedChange={(checked: boolean) => onToggleTheme(checked ? 'dark' : 'light')}
                  className="data-[state=checked]:bg-[#1DB954] mt-1"
                />
              </div>
            )}
          </div>

          {/* Auto-add Toggle */}
          <div className="glass-card backdrop-blur-sm rounded-2xl p-6 shadow-lg">
            {isMobile ? (
              // Mobile: Button Layout
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <Music2 className="w-5 h-5 text-[#1DB954] mt-0.5" />
                  <div className="flex-1">
                    <Label>Auto-add top match</Label>
                    <p className="text-gray-600 dark:text-gray-400 text-sm mt-1">
                      Automatically save the best match without preview
                    </p>
                  </div>
                </div>
                <Button
                  onClick={() => onToggleAutoAdd(!autoAddTopMatch)}
                  variant="outline"
                  className={`w-full h-12 rounded-xl transition-all ${autoAddTopMatch
                    ? 'bg-[#1DB954]/20 border-[#1DB954] text-[#1DB954] hover:bg-[#1DB954]/30'
                    : 'border-gray-300 dark:border-white/20 hover:bg-gray-100 dark:hover:bg-white/5'
                    }`}
                >
                  {autoAddTopMatch ? (
                    <>
                      <Music2 className="w-4 h-4 mr-2" />
                      Auto-add Enabled
                    </>
                  ) : (
                    <>
                      <Music2 className="w-4 h-4 mr-2" />
                      Enable Auto-add
                    </>
                  )}
                </Button>
              </div>
            ) : (
              // Desktop: Toggle Switch
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
            )}
          </div>
        </div>

        {/* History List */}
        <HistoryList history={history} onDeleteSong={onDeleteSong} />
      </div>

      {/* Floating Stash Button - Mobile Only */}
      {isMobile && <FloatingStashButton onClick={handleFloatingButtonClick} />}

      {/* Processing Overlay */}
      {processingStatus && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-md transition-all animate-in fade-in">
          <div className="text-center space-y-6 p-8 rounded-3xl bg-white/5 border border-white/10 shadow-2xl scale-in-center">
            <div className="relative w-24 h-24 mx-auto">
              <div className="absolute inset-0 rounded-full border-4 border-[#1DB954]/20"></div>
              <div className="absolute inset-0 rounded-full border-4 border-t-[#1DB954] border-r-[#1DB954] animate-spin"></div>
              <Sparkles className="absolute inset-0 m-auto w-10 h-10 text-[#1DB954] animate-pulse" />
            </div>
            <div className="space-y-2">
              <h3 className="text-2xl font-bold text-white">Stashing...</h3>
              <p className="text-[#1DB954] font-medium tracking-wide animate-pulse h-6">
                {processingStatus}
              </p>
            </div>
            <div className="flex gap-2 justify-center">
              {[0, 1, 2].map((i) => (
                <div
                  key={i}
                  className="w-2 h-2 rounded-full bg-[#1DB954] animate-bounce"
                  style={{ animationDelay: `${i * 0.15}s` }}
                />
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
