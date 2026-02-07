import stashLogo from 'figma:asset/20648ebc90662bf928d8b1c2b16db090f7a84379.png';
import ThemeToggle from './ThemeToggle';
import { Music, Sparkles, Zap, Shield, Globe, TrendingUp } from 'lucide-react';
import { motion } from 'motion/react';

interface LandingViewProps {
  onConnect: () => void;
}

export default function LandingView({ onConnect }: LandingViewProps) {
  return (
    <div className="min-h-screen flex flex-col relative overflow-hidden">
      {/* Animated Background Gradients */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#121212] via-[#1a1a1a] to-[#0a0a0a] dark:from-[#121212] dark:via-[#1a1a1a] dark:to-[#0a0a0a] light:from-white light:via-gray-50 light:to-gray-100" />
      
      {/* Animated Orbs */}
      <motion.div
        className="absolute top-20 -left-20 w-96 h-96 bg-[#1DB954]/20 rounded-full blur-3xl"
        animate={{
          x: [0, 100, 0],
          y: [0, -50, 0],
          scale: [1, 1.2, 1],
        }}
        transition={{ duration: 20, repeat: Infinity, ease: 'easeInOut' }}
      />
      <motion.div
        className="absolute bottom-20 -right-20 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl"
        animate={{
          x: [0, -100, 0],
          y: [0, 50, 0],
          scale: [1, 1.3, 1],
        }}
        transition={{ duration: 25, repeat: Infinity, ease: 'easeInOut' }}
      />

      {/* Content */}
      <div className="relative z-10 flex flex-col min-h-screen">
        {/* Header */}
        <header className="p-6 md:p-8">
          <div className="flex items-center justify-between max-w-7xl mx-auto">
            <motion.div
              className="flex items-center gap-3"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
            >
              <img src={stashLogo} alt="Stash Logo" className="w-10 h-10" />
              <h1 className="text-2xl font-semibold tracking-tight">Stash</h1>
            </motion.div>
            
            {/* Theme Toggle */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <ThemeToggle />
            </motion.div>
          </div>
        </header>

        {/* Hero Section */}
        <main className="flex-1 flex flex-col items-center justify-center px-6 py-12 md:py-20">
          <div className="max-w-6xl mx-auto w-full">
            {/* Hero Content */}
            <div className="text-center space-y-8 mb-16">
              {/* Badge */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="inline-block"
              >
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#1DB954]/10 dark:bg-[#1DB954]/10 light:bg-[#1DB954]/20 border border-[#1DB954]/20 backdrop-blur-sm">
                  <Sparkles className="w-4 h-4 text-[#1DB954]" />
                  <span className="text-sm font-medium text-[#1DB954]">AI-Powered Music Discovery</span>
                </div>
              </motion.div>

              {/* Main Headline */}
              <motion.div
                className="space-y-6"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.1 }}
              >
                <h2 className="text-5xl md:text-7xl lg:text-8xl font-bold tracking-tight leading-tight">
                  The internet is the
                  <br />
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#1DB954] via-emerald-400 to-[#1DB954]">
                    world's radio
                  </span>
                </h2>
                <p className="text-2xl md:text-4xl text-gray-400 dark:text-gray-400 light:text-gray-600 font-medium max-w-3xl mx-auto">
                  It just needs a save button.
                </p>
              </motion.div>

              {/* CTA Button */}
              <motion.div
                className="pt-8"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.3 }}
              >
                <button
                  onClick={onConnect}
                  className="group relative px-12 py-5 rounded-full bg-gradient-to-r from-[#1DB954] to-emerald-500 hover:from-[#1ed760] hover:to-emerald-400 text-white font-semibold text-lg transition-all duration-300 shadow-2xl shadow-[#1DB954]/50 hover:shadow-[#1DB954]/70 hover:scale-105 active:scale-95"
                >
                  <span className="flex items-center gap-3">
                    <Music className="w-6 h-6" />
                    Connect with Spotify
                    <Zap className="w-5 h-5 group-hover:rotate-12 transition-transform" />
                  </span>
                </button>
                <p className="text-sm text-gray-500 dark:text-gray-500 light:text-gray-600 mt-4">
                  Free forever • No credit card required
                </p>
              </motion.div>
            </div>

            {/* Feature Cards Grid */}
            <motion.div
              className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-20"
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
            >
              {/* Feature 1 */}
              <div className="group relative p-8 rounded-3xl bg-white/5 dark:bg-white/5 light:bg-gray-900/5 backdrop-blur-sm border border-white/10 dark:border-white/10 light:border-gray-200 hover:border-[#1DB954]/50 transition-all duration-300 hover:scale-105">
                <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-[#1DB954]/0 to-[#1DB954]/10 opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className="relative">
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#1DB954] to-emerald-500 flex items-center justify-center mb-6">
                    <Globe className="w-7 h-7 text-white" />
                  </div>
                  <h3 className="text-xl font-semibold mb-3">Universal Discovery</h3>
                  <p className="text-gray-400 dark:text-gray-400 light:text-gray-600">
                    Find music anywhere on the internet—YouTube, TikTok, Instagram, or any platform
                  </p>
                </div>
              </div>

              {/* Feature 2 */}
              <div className="group relative p-8 rounded-3xl bg-white/5 dark:bg-white/5 light:bg-gray-900/5 backdrop-blur-sm border border-white/10 dark:border-white/10 light:border-gray-200 hover:border-[#1DB954]/50 transition-all duration-300 hover:scale-105">
                <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-purple-500/0 to-purple-500/10 opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className="relative">
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center mb-6">
                    <Zap className="w-7 h-7 text-white" />
                  </div>
                  <h3 className="text-xl font-semibold mb-3">Instant Recognition</h3>
                  <p className="text-gray-400 dark:text-gray-400 light:text-gray-600">
                    AI-powered music identification finds the exact track in seconds
                  </p>
                </div>
              </div>

              {/* Feature 3 */}
              <div className="group relative p-8 rounded-3xl bg-white/5 dark:bg-white/5 light:bg-gray-900/5 backdrop-blur-sm border border-white/10 dark:border-white/10 light:border-gray-200 hover:border-[#1DB954]/50 transition-all duration-300 hover:scale-105">
                <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-emerald-500/0 to-emerald-500/10 opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className="relative">
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center mb-6">
                    <Shield className="w-7 h-7 text-white" />
                  </div>
                  <h3 className="text-xl font-semibold mb-3">Auto-Sync to Spotify</h3>
                  <p className="text-gray-400 dark:text-gray-400 light:text-gray-600">
                    Automatically saves to your library. Never lose a song again.
                  </p>
                </div>
              </div>
            </motion.div>

            {/* How It Works Section */}
            <motion.div
              className="pt-16 md:pt-24"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.6 }}
            >
              <h3 className="text-3xl md:text-4xl font-bold text-center mb-16">
                Three steps to musical bliss
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-12 md:gap-16">
                {/* Step 1 */}
                <motion.div
                  className="relative text-center"
                  whileHover={{ y: -8 }}
                  transition={{ type: 'spring', stiffness: 300 }}
                >
                  <div className="relative inline-block mb-6">
                    <div className="absolute inset-0 bg-gradient-to-br from-[#1DB954] to-emerald-500 rounded-3xl blur-xl opacity-50" />
                    <div className="relative w-24 h-24 bg-gradient-to-br from-[#1DB954] to-emerald-500 rounded-3xl flex items-center justify-center">
                      <span className="text-5xl font-bold text-white">1</span>
                    </div>
                  </div>
                  <h4 className="text-xl font-semibold mb-3">Discover</h4>
                  <p className="text-gray-400 dark:text-gray-400 light:text-gray-600">
                    Find a song anywhere on the internet
                  </p>
                </motion.div>

                {/* Step 2 */}
                <motion.div
                  className="relative text-center"
                  whileHover={{ y: -8 }}
                  transition={{ type: 'spring', stiffness: 300 }}
                >
                  <div className="relative inline-block mb-6">
                    <div className="absolute inset-0 bg-gradient-to-br from-purple-500 to-pink-500 rounded-3xl blur-xl opacity-50" />
                    <div className="relative w-24 h-24 bg-gradient-to-br from-purple-500 to-pink-500 rounded-3xl flex items-center justify-center">
                      <span className="text-5xl font-bold text-white">2</span>
                    </div>
                  </div>
                  <h4 className="text-xl font-semibold mb-3">Paste</h4>
                  <p className="text-gray-400 dark:text-gray-400 light:text-gray-600">
                    Drop the link into Stash
                  </p>
                </motion.div>

                {/* Step 3 */}
                <motion.div
                  className="relative text-center"
                  whileHover={{ y: -8 }}
                  transition={{ type: 'spring', stiffness: 300 }}
                >
                  <div className="relative inline-block mb-6">
                    <div className="absolute inset-0 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-3xl blur-xl opacity-50" />
                    <div className="relative w-24 h-24 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-3xl flex items-center justify-center">
                      <span className="text-5xl font-bold text-white">3</span>
                    </div>
                  </div>
                  <h4 className="text-xl font-semibold mb-3">Enjoy</h4>
                  <p className="text-gray-400 dark:text-gray-400 light:text-gray-600">
                    It's in your Spotify library forever
                  </p>
                </motion.div>
              </div>
            </motion.div>

            {/* Stats Section */}
            <motion.div
              className="pt-20 pb-12"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.8 }}
            >
              <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                <div className="text-center">
                  <div className="text-4xl md:text-5xl font-bold text-[#1DB954] mb-2">10K+</div>
                  <div className="text-sm text-gray-500 dark:text-gray-500 light:text-gray-600">Songs Stashed</div>
                </div>
                <div className="text-center">
                  <div className="text-4xl md:text-5xl font-bold text-[#1DB954] mb-2">99%</div>
                  <div className="text-sm text-gray-500 dark:text-gray-500 light:text-gray-600">Match Accuracy</div>
                </div>
                <div className="text-center">
                  <div className="text-4xl md:text-5xl font-bold text-[#1DB954] mb-2">&lt;3s</div>
                  <div className="text-sm text-gray-500 dark:text-gray-500 light:text-gray-600">Avg. Recognition</div>
                </div>
                <div className="text-center">
                  <div className="text-4xl md:text-5xl font-bold text-[#1DB954] mb-2">24/7</div>
                  <div className="text-sm text-gray-500 dark:text-gray-500 light:text-gray-600">Always Available</div>
                </div>
              </div>
            </motion.div>

            {/* Coming Soon Badge */}
            <motion.div
              className="pt-12 text-center"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.8, delay: 1 }}
            >
              <div className="inline-flex items-center gap-2 px-6 py-3 bg-white/5 dark:bg-white/5 light:bg-gray-900/5 rounded-full border border-white/10 dark:border-white/10 light:border-gray-200">
                <TrendingUp className="w-4 h-4 text-[#1DB954]" />
                <p className="text-sm text-gray-400 dark:text-gray-400 light:text-gray-600">
                  Coming soon to <span className="text-white dark:text-white light:text-gray-900 font-medium">Apple Music</span> • <span className="text-white dark:text-white light:text-gray-900 font-medium">YouTube Music</span>
                </p>
              </div>
            </motion.div>
          </div>
        </main>

        {/* Footer */}
        <footer className="relative p-6 text-center text-sm text-gray-500 dark:text-gray-500 light:text-gray-600 border-t border-white/5 dark:border-white/5 light:border-gray-200">
          <p>© 2025 Stash. Made with ♥ for music lovers everywhere.</p>
        </footer>
      </div>
    </div>
  );
}