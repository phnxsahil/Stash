import { ArrowLeft } from 'lucide-react';
import { Button } from './ui/button';

interface PrivacyViewProps {
  onBack: () => void;
  theme: 'light' | 'dark';
}

export function PrivacyView({ onBack, theme }: PrivacyViewProps) {
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
            <h1 style={{ fontWeight: 600 }}>Privacy Policy</h1>
          </div>
        </div>
      </header>

      {/* Content */}
      <div className="container mx-auto px-4 md:px-6 py-24 max-w-4xl">
        <div className="space-y-8">
          <section className="glass-card rounded-2xl p-8 shadow-lg">
            <h2 className="mb-4" style={{ fontWeight: 600 }}>Introduction</h2>
            <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
              At Stash, we respect your privacy and are committed to protecting your personal data. This privacy policy explains how we collect, use, and safeguard your information when you use our music discovery application.
            </p>
          </section>

          <section className="glass-card rounded-2xl p-8 shadow-lg">
            <h2 className="mb-4" style={{ fontWeight: 600 }}>Information We Collect</h2>
            <div className="space-y-4 text-gray-600 dark:text-gray-400 leading-relaxed">
              <p><strong className="text-gray-900 dark:text-white">Spotify Account Information:</strong> When you connect your Spotify account, we collect your profile information including your name, email, and playlists to provide our service.</p>
              <p><strong className="text-gray-900 dark:text-white">Song History:</strong> We store information about songs you save through Stash, including song titles, artists, and source URLs.</p>
              <p><strong className="text-gray-900 dark:text-white">Usage Data:</strong> We collect data on how you interact with our application to improve your experience.</p>
            </div>
          </section>

          <section className="glass-card rounded-2xl p-8 shadow-lg">
            <h2 className="mb-4" style={{ fontWeight: 600 }}>How We Use Your Information</h2>
            <ul className="space-y-2 text-gray-600 dark:text-gray-400 leading-relaxed list-disc list-inside">
              <li>To provide and improve our music discovery service</li>
              <li>To save songs to your Spotify library</li>
              <li>To personalize your experience</li>
              <li>To communicate with you about service updates</li>
            </ul>
          </section>

          <section className="glass-card rounded-2xl p-8 shadow-lg">
            <h2 className="mb-4" style={{ fontWeight: 600 }}>Data Security</h2>
            <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
              We implement appropriate technical and organizational measures to protect your personal data against unauthorized access, alteration, disclosure, or destruction.
            </p>
          </section>

          <section className="glass-card rounded-2xl p-8 shadow-lg">
            <h2 className="mb-4" style={{ fontWeight: 600 }}>Third-Party Services</h2>
            <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
              Stash integrates with Spotify. Your use of Spotify is governed by Spotify's privacy policy. We do not share your personal information with third parties except as necessary to provide our service.
            </p>
          </section>

          <section className="glass-card rounded-2xl p-8 shadow-lg">
            <h2 className="mb-4" style={{ fontWeight: 600 }}>Your Rights</h2>
            <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
              You have the right to access, correct, or delete your personal data. You can disconnect your Spotify account at any time through the settings page.
            </p>
          </section>

          <section className="glass-card rounded-2xl p-8 shadow-lg">
            <h2 className="mb-4" style={{ fontWeight: 600 }}>Contact Us</h2>
            <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
              If you have questions about this Privacy Policy, please contact us at{' '}
              <a href="mailto:worksahilsharma@gmail.com" className="text-[#1DB954] hover:underline">
                worksahilsharma@gmail.com
              </a>
            </p>
          </section>

          <div className="text-center text-sm text-gray-500 dark:text-gray-500">
            Last updated: December 15, 2025
          </div>
        </div>
      </div>
    </div>
  );
}
