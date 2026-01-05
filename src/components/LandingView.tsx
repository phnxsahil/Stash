import { Music, Zap, CheckCircle, Radio, Sun, Moon, Link2 } from 'lucide-react';
import { Button } from './ui/button';
import { Switch } from './ui/switch';
import heroImage from '../assets/hero.jpg';
import logoLight from '../assets/772b6607fed69ee0832a6f5e7102b5a6b45e84c2.png';
import logoDark from '../assets/b659e78a263c10d9b32767464e4b074fdb043c31.png';

interface LandingViewProps {
  onConnect: () => void;
  theme: 'light' | 'dark';
  onToggleTheme: (value: 'light' | 'dark') => void;
  onNavigate?: (page: 'privacy' | 'about' | 'help') => void;
}

export function LandingView({ onConnect, theme, onToggleTheme, onNavigate }: LandingViewProps) {
  return (
    <div className="min-h-screen bg-white dark:bg-black text-gray-900 dark:text-white overflow-hidden">
      {/* Header with Logo Placeholder */}
      <header className="fixed top-0 left-0 right-0 z-50 backdrop-blur-xl bg-white/80 dark:bg-black/80 border-b border-gray-200 dark:border-white/10">
        <div className="container mx-auto px-4 md:px-6 py-4">
          <div className="flex items-center justify-between">
            {/* Logo Placeholder */}
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl bg-gradient-to-br from-[#1DB954] to-[#1ed760] flex items-center justify-center shadow-lg shadow-[#1DB954]/20">
                <Radio className="w-6 h-6 md:w-7 md:h-7 text-black" />
              </div>
              <span className="text-2xl md:text-3xl text-[#1DB954]" style={{ fontWeight: 700, letterSpacing: '-0.02em' }}>Stash</span>
            </div>

            {/* Desktop: Clean Theme Toggle + Connect Button */}
            <div className="hidden md:flex items-center gap-3">
              <div className="flex items-center gap-2 px-3 py-2 rounded-full bg-white/80 dark:bg-white/5 border border-gray-200 dark:border-white/10">
                <Sun className="w-4 h-4 text-gray-500 dark:text-gray-600" />
                <Switch
                  checked={theme === 'dark'}
                  onCheckedChange={(checked: boolean) => onToggleTheme(checked ? 'dark' : 'light')}
                  className="data-[state=checked]:bg-[#1DB954]"
                />
                <Moon className="w-4 h-4 text-gray-400 dark:text-white" />
              </div>
              <Button
                onClick={onConnect}
                size="sm"
                className="bg-[#1DB954] hover:bg-[#1ed760] text-black px-6 h-9 shadow-md hover:shadow-lg transition-all font-semibold"
              >
                Connect
              </Button>
            </div>

            {/* Mobile: Simple Icon */}
            <Button
              onClick={() => onToggleTheme(theme === 'dark' ? 'light' : 'dark')}
              variant="ghost"
              size="icon"
              className="md:hidden"
            >
              {theme === 'dark' ? (
                <Sun className="w-5 h-5 text-gray-400" />
              ) : (
                <Moon className="w-5 h-5 text-gray-600" />
              )}
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <div className="relative pt-20 md:pt-24">
        {/* Hero Content - Image First */}
        <div className="relative z-10 container mx-auto px-4 md:px-6 py-8 md:py-16">
          <div className="max-w-6xl mx-auto">
            {/* Hero Image */}
            <div className="mb-8 md:mb-12">
              <div className="glass-card rounded-3xl overflow-hidden shadow-2xl max-w-md md:max-w-2xl mx-auto p-0 border border-white/20">
                <img
                  src={heroImage}
                  alt="Vinyl records with headphones"
                  className="w-full h-auto object-cover"
                />
              </div>
            </div>

            {/* Hero Text */}
            <div className="text-center space-y-6 md:space-y-8">
              <h1
                className="text-4xl md:text-6xl lg:text-7xl tracking-tight leading-tight text-gray-900 dark:text-white"
                style={{ fontWeight: 700 }}
              >
                The internet is the world's radio.
              </h1>
              <p
                className="text-xl md:text-2xl lg:text-3xl text-[#1DB954]"
                style={{ fontWeight: 700 }}
              >
                It just needs a save button.
              </p>
              <div className="pt-4 flex flex-col sm:flex-row gap-4 items-center justify-center">
                <Button
                  onClick={onConnect}
                  className="bg-[#1DB954] hover:bg-[#1ed760] text-black px-8 md:px-12 py-6 md:py-7 rounded-full transition-all shadow-2xl shadow-[#1DB954]/20 hover:shadow-[#1DB954]/40 hover:scale-105"
                  style={{ fontWeight: 600 }}
                >
                  ✨ Stash your first song
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    const howItWorks = document.getElementById('how-it-works');
                    howItWorks?.scrollIntoView({ behavior: 'smooth' });
                  }}
                  className="glass-light text-gray-900 dark:text-white border-gray-300 dark:border-white/30 px-8 md:px-12 py-6 md:py-7 rounded-full transition-all"
                  style={{ fontWeight: 500 }}
                >
                  How it works
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* How It Works Section */}
      <div id="how-it-works" className="relative z-10 container mx-auto px-4 md:px-6 py-16 md:py-24">
        <h2 className="text-center mb-12 md:mb-16 text-gray-900 dark:text-white text-3xl md:text-4xl" style={{ fontWeight: 700 }}>How It Works</h2>

        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {/* Step 1 */}
          <div className="glass-card rounded-2xl p-8 text-center shadow-lg border border-gray-200 dark:border-white/10">
            <div className="w-16 h-16 mx-auto mb-6 bg-[#1DB954]/10 rounded-2xl flex items-center justify-center">
              <Link2 className="w-8 h-8 text-[#1DB954]" />
            </div>
            <h3 className="mb-4 text-gray-900 dark:text-white text-xl" style={{ fontWeight: 600 }}>Find Any Song</h3>
            <p className="text-gray-600 dark:text-gray-400">
              Discover music anywhere on the internet—YouTube, TikTok, Instagram, or any website.
            </p>
          </div>

          {/* Step 2 */}
          <div className="glass-card rounded-2xl p-8 text-center shadow-lg border border-gray-200 dark:border-white/10">
            <div className="w-16 h-16 mx-auto mb-6 bg-[#1DB954]/10 rounded-2xl flex items-center justify-center">
              <Zap className="w-8 h-8 text-[#1DB954]" />
            </div>
            <h3 className="mb-4 text-gray-900 dark:text-white text-xl" style={{ fontWeight: 600 }}>Paste the Link</h3>
            <p className="text-gray-600 dark:text-gray-400">
              Copy the URL and paste it into Stash. We'll instantly find the perfect match.
            </p>
          </div>

          {/* Step 3 */}
          <div className="glass-card rounded-2xl p-8 text-center shadow-lg border border-gray-200 dark:border-white/10">
            <div className="w-16 h-16 mx-auto mb-6 bg-[#1DB954]/10 rounded-2xl flex items-center justify-center">
              <CheckCircle className="w-8 h-8 text-[#1DB954]" />
            </div>
            <h3 className="mb-4 text-gray-900 dark:text-white text-xl" style={{ fontWeight: 600 }}>Save to Spotify</h3>
            <p className="text-gray-600 dark:text-gray-400">
              The song is automatically added to your Spotify library. Done!
            </p>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="relative z-10 container mx-auto px-4 md:px-6 py-16 md:py-24 text-gray-900 dark:text-white">
        <div className="max-w-4xl mx-auto space-y-8">
          <h2 className="text-center mb-12 text-3xl md:text-4xl" style={{ fontWeight: 700 }}>Why Stash?</h2>

          <div className="grid md:grid-cols-2 gap-6">
            <div className="glass-card rounded-xl p-6 shadow-lg border border-gray-200 dark:border-white/10">
              <h3 className="mb-3 text-xl" style={{ fontWeight: 600 }}>🎵 Universal Music Discovery</h3>
              <p className="text-gray-600 dark:text-gray-400">
                No more switching between apps. Save songs from anywhere, instantly.
              </p>
            </div>

            <div className="glass-card rounded-xl p-6 shadow-lg border border-gray-200 dark:border-white/10">
              <h3 className="mb-3 text-xl" style={{ fontWeight: 600 }}>⚡ Lightning Fast</h3>
              <p className="text-gray-600 dark:text-gray-400">
                Our AI matches songs in seconds, so you never lose track of a discovery.
              </p>
            </div>

            <div className="glass-card rounded-xl p-6 shadow-lg border border-gray-200 dark:border-white/10">
              <h3 className="mb-3 text-xl" style={{ fontWeight: 600 }}>🎯 Perfect Matches</h3>
              <p className="text-gray-600 dark:text-gray-400">
                Preview and confirm the right version before adding to your library.
              </p>
            </div>

            <div className="glass-card rounded-xl p-6 shadow-lg border border-gray-200 dark:border-white/10">
              <h3 className="mb-3 text-xl" style={{ fontWeight: 600 }}>📱 Works Everywhere</h3>
              <p className="text-gray-600 dark:text-gray-400">
                Desktop, mobile, or tablet. Stash works seamlessly on all your devices.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="relative z-10 container mx-auto px-4 md:px-6 py-16 md:py-24 text-gray-900 dark:text-white">
        <div className="glass-card rounded-3xl p-12 md:p-16 text-center max-w-3xl mx-auto shadow-2xl border border-gray-200 dark:border-white/10">
          <h2 className="mb-6 text-3xl md:text-4xl" style={{ fontWeight: 700 }}>Ready to Start Stashing?</h2>
          <p className="text-gray-600 dark:text-gray-400 mb-8 text-lg">
            Connect your Spotify account and never lose a song again.
          </p>
          <Button
            onClick={onConnect}
            className="bg-[#1DB954] hover:bg-[#1ed760] text-black px-12 py-7 rounded-full transition-all shadow-2xl shadow-[#1DB954]/20 hover:shadow-[#1DB954]/40 hover:scale-105 text-lg"
            style={{ fontWeight: 600 }}
          >
            Connect with Spotify
          </Button>
        </div>
      </div>

      {/* Footer */}
      <footer className="relative z-10 border-t border-gray-200 dark:border-white/10 py-8 text-gray-900 dark:text-white">
        <div className="container mx-auto px-4 md:px-6">
          <div className="flex flex-col items-center justify-center gap-4">
            <p className="text-gray-500 dark:text-gray-500 text-sm text-center">
              © 2026 Stash. The internet's save button for music.
            </p>
            <p className="text-gray-600 dark:text-gray-400 text-sm">
              Designed & Developed by Sahil Sharma
            </p>
            <div className="flex items-center gap-6 text-sm">
              <button
                onClick={() => onNavigate?.('privacy')}
                className="text-gray-600 dark:text-gray-400 hover:text-[#1DB954] transition-colors"
              >
                Privacy
              </button>
              <button
                onClick={() => onNavigate?.('about')}
                className="text-gray-600 dark:text-gray-400 hover:text-[#1DB954] transition-colors"
              >
                About
              </button>
              <button
                onClick={() => onNavigate?.('help')}
                className="text-gray-600 dark:text-gray-400 hover:text-[#1DB954] transition-colors"
              >
                Help
              </button>
            </div>
          </div>
        </div>
      </footer>

      {/* Mobile CTA */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 p-4 bg-white/90 dark:bg-black/90 backdrop-blur-xl border-t border-gray-200 dark:border-white/10 z-50 pb-safe">
        <Button
          onClick={onConnect}
          className="w-full bg-[#1DB954] hover:bg-[#1ed760] text-black py-6 rounded-full shadow-lg shadow-[#1DB954]/20"
          style={{ fontWeight: 600 }}
        >
          ✨ Stash your first song
        </Button>
      </div>

      {/* Mobile Theme Toggle Button */}
      <div className="md:hidden fixed bottom-24 left-6 z-50">
        <Button
          onClick={() => onToggleTheme(theme === 'dark' ? 'light' : 'dark')}
          className="glass-card rounded-full w-14 h-14 flex items-center justify-center shadow-xl border-2 border-gray-300 dark:border-white/20"
          variant="ghost"
          size="icon"
        >
          {theme === 'dark' ? (
            <Sun className="w-5 h-5 text-yellow-400" />
          ) : (
            <Moon className="w-5 h-5 text-purple-600" />
          )}
        </Button>
      </div>
    </div>
  );
}