import { useState, useRef } from 'react';
import { Song } from '../types';
import SongHistory from './SongHistory';
import FloatingStashButton from './FloatingStashButton';
import { BarChart3, Settings, LogOut, Music2, Sparkles } from 'lucide-react';
import { motion } from 'motion/react';
import stashLogo from 'figma:asset/20648ebc90662bf928d8b1c2b16db090f7a84379.png';

interface AppViewProps {
  userName: string;
  history: Song[];
  autoAddEnabled: boolean;
  onLogout: () => void;
  onStashSubmit: (url: string) => Promise<void>;
  onDeleteSong: (index: number) => void;
  onToggleAutoAdd: (enabled: boolean) => void;
  onNavigateToStats?: () => void;
  onNavigateToSettings?: () => void;
}

export default function AppView({
  userName,
  history,
  autoAddEnabled,
  onLogout,
  onStashSubmit,
  onDeleteSong,
  onToggleAutoAdd,
  onNavigateToStats,
  onNavigateToSettings,
}: AppViewProps) {
  const [urlInput, setUrlInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!urlInput.trim() || isLoading) return;

    setIsLoading(true);
    try {
      await onStashSubmit(urlInput);
      setUrlInput(''); // Clear input on success
    } finally {
      setIsLoading(false);
    }
  };

  const scrollToInput = () => {
    inputRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    inputRef.current?.focus();
  };

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="border-b border-gray-800 bg-[#1D1D1F]/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img src={stashLogo} alt="Stash Logo" className="w-8 h-8" />
            <h1 className="text-xl font-semibold tracking-tight">Stash</h1>
          </div>

          <div className="flex items-center gap-4">
            {/* Stats Button */}
            <button
              onClick={onNavigateToStats}
              disabled={!onNavigateToStats}
              className="hidden md:flex items-center gap-2 px-4 py-2 rounded-lg bg-gray-800 hover:bg-gray-700 transition-colors text-sm disabled:bg-gray-800/50 disabled:text-gray-500 disabled:cursor-not-allowed disabled:opacity-50"
              title={onNavigateToStats ? 'View Stats' : 'Coming soon'}
            >
              <BarChart3 className="w-4 h-4" />
              Stats
            </button>

            {/* Settings Button */}
            <button
              onClick={onNavigateToSettings}
              disabled={!onNavigateToSettings}
              className="hidden md:flex items-center gap-2 px-4 py-2 rounded-lg bg-gray-800 hover:bg-gray-700 transition-colors text-sm disabled:bg-gray-800/50 disabled:text-gray-500 disabled:cursor-not-allowed disabled:opacity-50"
              title={onNavigateToSettings ? 'Settings' : 'Coming soon'}
            >
              <Settings className="w-4 h-4" />
              Settings
            </button>

            {/* User Profile */}
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-[#1DB954] flex items-center justify-center">
                <span className="text-sm font-semibold text-white">
                  {userName.charAt(0).toUpperCase()}
                </span>
              </div>
              <span className="hidden sm:inline text-sm">{userName}</span>
            </div>

            {/* Logout Button */}
            <button
              onClick={onLogout}
              className="px-4 py-2 rounded-lg bg-gray-800 hover:bg-gray-700 transition-colors text-sm"
            >
              <LogOut className="w-4 h-4" />
              Logout
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 px-6 py-8 md:py-12">
        <div className="max-w-3xl mx-auto space-y-12">
          {/* Stash Form */}
          <div className="space-y-4">
            <h2 className="text-2xl md:text-3xl font-semibold">
              Stash a song
            </h2>
            
            {/* Hero CTA when history is empty */}
            {history.length === 0 && (
              <div className="mb-6 p-6 rounded-2xl bg-gradient-to-br from-[#1DB954]/10 to-emerald-500/10 border border-[#1DB954]/20">
                <div className="flex items-center justify-center gap-2 mb-3">
                  <span className="text-2xl">✨</span>
                  <p className="text-lg font-medium text-center">
                    Stash your first song
                  </p>
                  <span className="text-2xl">✨</span>
                </div>
                <p className="text-sm text-gray-400 text-center">
                  Paste any music link from YouTube, TikTok, Instagram, or anywhere on the internet
                </p>
              </div>
            )}
            
            <form onSubmit={handleSubmit} className="flex gap-3">
              <input
                ref={inputRef}
                type="text"
                value={urlInput}
                onChange={(e) => setUrlInput(e.target.value)}
                placeholder="Paste a link from YouTube, TikTok, Instagram..."
                className="flex-1 px-4 py-3 rounded-lg bg-[#1D1D1F] border border-gray-700 focus:border-[#1DB954] focus:outline-none transition-colors placeholder:text-gray-500"
                disabled={isLoading}
              />
              <button
                type="submit"
                disabled={isLoading || !urlInput.trim()}
                className="px-8 py-3 rounded-lg bg-[#1DB954] hover:bg-[#1ed760] disabled:bg-gray-700 disabled:cursor-not-allowed transition-colors font-medium whitespace-nowrap"
              >
                {isLoading ? (
                  <span className="flex items-center gap-2">
                    <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                        fill="none"
                      />
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      />
                    </svg>
                    Stashing...
                  </span>
                ) : (
                  'Stash'
                )}
              </button>
            </form>
          </div>

          {/* Settings */}
          <div className="border-t border-gray-800 pt-8">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <h3 className="font-medium">Auto-add top match</h3>
                <p className="text-sm text-gray-400">
                  Automatically add the best match without confirmation
                </p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={autoAddEnabled}
                  onChange={(e) => onToggleAutoAdd(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#1DB954]"></div>
              </label>
            </div>
          </div>

          {/* Recently Stashed */}
          <SongHistory
            history={history}
            onDelete={onDeleteSong}
          />
        </div>
      </main>

      {/* Footer */}
      <footer className="p-6 text-center text-sm text-gray-500 border-t border-gray-800">
        <p>© 2025 Stash. Made with ♥ for music lovers.</p>
      </footer>

      {/* Floating Stash Button */}
      <FloatingStashButton onClick={scrollToInput} />
    </div>
  );
}