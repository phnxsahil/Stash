import { ArrowLeft, Music, Zap, Heart } from 'lucide-react';
import { Button } from './ui/button';
import logoLight from 'figma:asset/772b6607fed69ee0832a6f5e7102b5a6b45e84c2.png';
import logoDark from 'figma:asset/b659e78a263c10d9b32767464e4b074fdb043c31.png';

interface AboutViewProps {
  onBack: () => void;
  theme: 'light' | 'dark';
}

export function AboutView({ onBack, theme }: AboutViewProps) {
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
            <h1 style={{ fontWeight: 600 }}>About Stash</h1>
          </div>
        </div>
      </header>

      {/* Content */}
      <div className="container mx-auto px-4 md:px-6 py-24 max-w-4xl">
        <div className="space-y-8">
          {/* Logo and Tagline */}
          <div className="text-center space-y-6">
            <div className="flex justify-center">
              <img
                src={theme === 'dark' ? logoDark : logoLight}
                alt="Stash Logo"
                className="w-32 h-32 md:w-40 md:h-40"
              />
            </div>
            <h2 className="text-3xl md:text-4xl" style={{ fontWeight: 700 }}>
              The internet is the world's radio.
            </h2>
            <p className="text-xl md:text-2xl text-[#1DB954]" style={{ fontWeight: 600 }}>
              It just needs a save button.
            </p>
          </div>

          {/* Mission Statement */}
          <section className="glass-card rounded-2xl p-8 shadow-lg">
            <h2 className="mb-4" style={{ fontWeight: 600 }}>Our Mission</h2>
            <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
              Stash is designed to solve a universal problem: discovering amazing music across the internet but struggling to save it to your music library. Whether you find a song on YouTube, TikTok, Instagram, or any website, Stash makes it effortless to add it to your Spotify collection instantly.
            </p>
          </section>

          {/* Features */}
          <div className="grid md:grid-cols-3 gap-6">
            <div className="glass-card rounded-xl p-6 shadow-lg text-center">
              <div className="w-12 h-12 mx-auto mb-4 bg-[#1DB954]/10 rounded-xl flex items-center justify-center">
                <Music className="w-6 h-6 text-[#1DB954]" />
              </div>
              <h3 className="mb-2" style={{ fontWeight: 600 }}>Universal Discovery</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Find and save music from anywhere on the internet
              </p>
            </div>

            <div className="glass-card rounded-xl p-6 shadow-lg text-center">
              <div className="w-12 h-12 mx-auto mb-4 bg-[#1DB954]/10 rounded-xl flex items-center justify-center">
                <Zap className="w-6 h-6 text-[#1DB954]" />
              </div>
              <h3 className="mb-2" style={{ fontWeight: 600 }}>Lightning Fast</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                AI-powered matching finds your songs in seconds
              </p>
            </div>

            <div className="glass-card rounded-xl p-6 shadow-lg text-center">
              <div className="w-12 h-12 mx-auto mb-4 bg-[#1DB954]/10 rounded-xl flex items-center justify-center">
                <Heart className="w-6 h-6 text-[#1DB954]" />
              </div>
              <h3 className="mb-2" style={{ fontWeight: 600 }}>Simple & Clean</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Beautiful interface inspired by Apple and Spotify
              </p>
            </div>
          </div>

          {/* How It Works */}
          <section className="glass-card rounded-2xl p-8 shadow-lg">
            <h2 className="mb-6" style={{ fontWeight: 600 }}>How It Works</h2>
            <div className="space-y-4 text-gray-600 dark:text-gray-400 leading-relaxed">
              <div>
                <strong className="text-gray-900 dark:text-white">1. Find Music Anywhere</strong>
                <p>Discover songs on YouTube, TikTok, Instagram, or any website.</p>
              </div>
              <div>
                <strong className="text-gray-900 dark:text-white">2. Paste the Link</strong>
                <p>Copy the URL and paste it into Stash. Our AI instantly identifies the song.</p>
              </div>
              <div>
                <strong className="text-gray-900 dark:text-white">3. Save to Spotify</strong>
                <p>The track is automatically added to your Spotify library. Done!</p>
              </div>
            </div>
          </section>

          {/* About the Developer */}
          <section className="glass-card rounded-2xl p-8 shadow-lg">
            <h2 className="mb-4" style={{ fontWeight: 600 }}>About the Developer</h2>
            <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
              Stash was designed and developed by Sahil Sharma with a passion for music discovery and clean, intuitive design. The goal was to create a seamless bridge between the vast world of internet music and your personal Spotify library.
            </p>
          </section>

          {/* Contact */}
          <section className="glass-card rounded-2xl p-8 shadow-lg text-center">
            <h2 className="mb-4" style={{ fontWeight: 600 }}>Get in Touch</h2>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Have questions or feedback? We'd love to hear from you!
            </p>
            <Button
              onClick={() => window.location.href = 'mailto:worksahilsharma@gmail.com'}
              className="bg-[#1DB954] hover:bg-[#1ed760] text-black"
              style={{ fontWeight: 600 }}
            >
              Contact Us
            </Button>
          </section>
        </div>
      </div>
    </div>
  );
}