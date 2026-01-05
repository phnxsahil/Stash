import { ArrowLeft, Music, Zap, Heart } from 'lucide-react';
import { Button } from './ui/button';
import logoLight from '../assets/772b6607fed69ee0832a6f5e7102b5a6b45e84c2.png';
import logoDark from '../assets/b659e78a263c10d9b32767464e4b074fdb043c31.png';

interface AboutViewProps {
  onBack: () => void;
  theme: 'light' | 'dark';
}

export function AboutView({ onBack, theme }: AboutViewProps) {
  return (
    <div className="min-h-screen bg-white dark:bg-black text-gray-900 dark:text-white">
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
              <ArrowLeft className="w-5 h-5 transition-transform hover:-translate-x-1" />
            </Button>
            <h1 className="text-xl md:text-2xl" style={{ fontWeight: 600 }}>About Stash</h1>
          </div>
        </div>
      </header>

      {/* Content */}
      <div className="container mx-auto px-4 md:px-6 py-24 max-w-4xl">
        <div className="space-y-12">
          {/* Logo and Tagline */}
          <div className="text-center space-y-6">
            <div className="flex justify-center">
              <img
                src={theme === 'dark' ? logoDark : logoLight}
                alt="Stash Logo"
                className="w-32 h-32 md:w-40 md:h-40 object-contain drop-shadow-2xl"
              />
            </div>
            <h2 className="text-3xl md:text-5xl tracking-tight" style={{ fontWeight: 700 }}>
              The internet is the world's radio.
            </h2>
            <p className="text-xl md:text-2xl text-[#1DB954]" style={{ fontWeight: 600 }}>
              It just needs a save button.
            </p>
          </div>

          {/* Mission Statement */}
          <section className="glass-card rounded-2xl p-8 shadow-lg border border-gray-200 dark:border-white/10">
            <h2 className="text-2xl mb-4" style={{ fontWeight: 600 }}>Our Mission</h2>
            <p className="text-gray-600 dark:text-gray-400 leading-relaxed text-lg">
              Stash is designed to solve a universal problem: discovering amazing music across the internet but struggling to save it to your music library. Whether you find a song on YouTube, TikTok, Instagram, or any website, Stash makes it effortless to add it to your Spotify collection instantly.
            </p>
          </section>

          {/* Features */}
          <div className="grid md:grid-cols-3 gap-6">
            <div className="glass-card rounded-xl p-6 shadow-lg text-center border border-gray-200 dark:border-white/10">
              <div className="w-12 h-12 mx-auto mb-4 bg-[#1DB954]/10 rounded-xl flex items-center justify-center">
                <Music className="w-6 h-6 text-[#1DB954]" />
              </div>
              <h3 className="text-lg mb-2" style={{ fontWeight: 600 }}>Universal Discovery</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Find and save music from anywhere on the internet
              </p>
            </div>

            <div className="glass-card rounded-xl p-6 shadow-lg text-center border border-gray-200 dark:border-white/10">
              <div className="w-12 h-12 mx-auto mb-4 bg-[#1DB954]/10 rounded-xl flex items-center justify-center">
                <Zap className="w-6 h-6 text-[#1DB954]" />
              </div>
              <h3 className="text-lg mb-2" style={{ fontWeight: 600 }}>Lightning Fast</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                AI-powered matching finds your songs in seconds
              </p>
            </div>

            <div className="glass-card rounded-xl p-6 shadow-lg text-center border border-gray-200 dark:border-white/10">
              <div className="w-12 h-12 mx-auto mb-4 bg-[#1DB954]/10 rounded-xl flex items-center justify-center">
                <Heart className="w-6 h-6 text-[#1DB954]" />
              </div>
              <h3 className="text-lg mb-2" style={{ fontWeight: 600 }}>Simple & Clean</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Beautiful interface inspired by Apple and Spotify
              </p>
            </div>
          </div>

          {/* How It Works */}
          <section className="glass-card rounded-2xl p-8 shadow-lg border border-gray-200 dark:border-white/10">
            <h2 className="text-2xl mb-6" style={{ fontWeight: 600 }}>How It Works</h2>
            <div className="space-y-6 text-gray-600 dark:text-gray-400 leading-relaxed text-lg">
              <div className="flex gap-4">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-[#1DB954] text-black flex items-center justify-center font-bold">1</div>
                <div>
                  <strong className="text-gray-900 dark:text-white block mb-1">Find Music Anywhere</strong>
                  <p>Discover songs on YouTube, TikTok, Instagram, or any website.</p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-[#1DB954] text-black flex items-center justify-center font-bold">2</div>
                <div>
                  <strong className="text-gray-900 dark:text-white block mb-1">Paste the Link</strong>
                  <p>Copy the URL and paste it into Stash. Our AI instantly identifies the song.</p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-[#1DB954] text-black flex items-center justify-center font-bold">3</div>
                <div>
                  <strong className="text-gray-900 dark:text-white block mb-1">Save to Spotify</strong>
                  <p>The track is automatically added to your Spotify library. Done!</p>
                </div>
              </div>
            </div>
          </section>

          {/* About the Developer */}
          <section className="glass-card rounded-2xl p-8 shadow-lg border border-gray-200 dark:border-white/10 text-center md:text-left">
            <h2 className="text-2xl mb-4" style={{ fontWeight: 600 }}>About the Developer</h2>
            <p className="text-gray-600 dark:text-gray-400 leading-relaxed text-lg">
              Stash was designed and developed by <strong>Sahil Sharma</strong> with a passion for music discovery and clean, intuitive design. Driven by the belief that music discovery should be frictionless, Sahil built Stash to be the definitive bridge between social media curation and your personal Spotify library.
            </p>
          </section>

          {/* Contact */}
          <section className="glass-card rounded-2xl p-8 shadow-lg text-center border border-gray-200 dark:border-white/10">
            <h2 className="text-2xl mb-4" style={{ fontWeight: 600 }}>Get in Touch</h2>
            <p className="text-gray-600 dark:text-gray-400 mb-6 text-lg">
              Have questions or feedback? We'd love to hear from you!
            </p>
            <Button
              onClick={() => window.location.href = 'mailto:worksahilsharma@gmail.com'}
              className="bg-[#1DB954] hover:bg-[#1ed760] text-black px-10 py-6 rounded-full shadow-lg shadow-[#1DB954]/20"
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