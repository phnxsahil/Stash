import { motion } from 'framer-motion';
import {
  ArrowRight,
  CheckCircle2,
  Link2,
  Moon,
  Radio,
  Sparkles,
  Sun,
  Waves,
  Zap,
} from 'lucide-react';
import { Button } from './ui/button';
import { Switch } from './ui/switch';
import heroImage from '../assets/hero.jpg';
import logoLight from '../assets/stash_logo.png';
import logoDark from '../assets/logoDark_new.png';

interface LandingViewProps {
  onConnect: () => void;
  theme: 'light' | 'dark';
  onToggleTheme: (value: 'light' | 'dark') => void;
  onNavigate?: (page: 'privacy' | 'about' | 'help') => void;
  pendingSharedUrl?: string | null;
}

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.08, delayChildren: 0.04 } },
};

const item = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.45, ease: [0.22, 1, 0.36, 1] } },
};

export function LandingView({
  onConnect,
  theme,
  onToggleTheme,
  onNavigate,
  pendingSharedUrl,
}: LandingViewProps) {
  const activeLogo = theme === 'dark' ? logoDark : logoLight;

  return (
    <div className="relative min-h-screen overflow-hidden pb-safe text-foreground">
      <motion.div
        aria-hidden
        className="pointer-events-none absolute -top-16 -left-20 h-72 w-72 rounded-full bg-primary/22 blur-3xl"
        animate={{ x: [0, 12, -6, 0], y: [0, -10, 14, 0], scale: [1, 1.08, 1] }}
        transition={{ duration: 18, repeat: Infinity, ease: 'easeInOut' }}
      />
      <motion.div
        aria-hidden
        className="pointer-events-none absolute top-72 -right-24 h-80 w-80 rounded-full bg-primary/12 blur-3xl"
        animate={{ x: [0, -10, 8, 0], y: [0, 14, -10, 0], scale: [1, 1.07, 1] }}
        transition={{ duration: 20, repeat: Infinity, ease: 'easeInOut' }}
      />

      <header className="sticky top-0 z-50 border-b border-border/40 bg-background/72 backdrop-blur-3xl">
        <div className="container mx-auto px-4 py-4 md:px-8">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="grid h-12 w-12 place-items-center overflow-hidden rounded-2xl border border-border/50 bg-card/70 shadow-sm">
                <img src={activeLogo} alt="Stash logo" className="h-10 w-10 object-contain" />
              </div>
              <div className="hidden sm:block">
                <p className="mb-1 text-[11px] font-semibold uppercase leading-none tracking-[0.22em] text-muted-foreground">Stash</p>
                <p className="text-sm font-medium tracking-tight">The internet&apos;s save button</p>
              </div>
            </div>

            <div className="flex items-center gap-3 md:gap-4">
              <div className="flex items-center gap-2 rounded-full border border-border/50 bg-card/60 px-3 py-1.5 shadow-sm">
                <Sun className="h-3.5 w-3.5 text-muted-foreground" />
                <Switch
                  checked={theme === 'dark'}
                  onCheckedChange={(checked) => onToggleTheme(checked ? 'dark' : 'light')}
                  className="data-[state=checked]:bg-primary"
                />
                <Moon className="h-3.5 w-3.5 text-muted-foreground" />
              </div>

              <Button onClick={onConnect} size="sm" className="rounded-full bg-primary px-6 font-medium text-primary-foreground hover:opacity-90 outline-focus">
                Connect
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main>
        <motion.section variants={container} initial="hidden" animate="show" className="container mx-auto px-4 pb-12 pt-10 md:px-8 md:pb-24 md:pt-20">
          <div className="grid items-center gap-10 lg:grid-cols-[1.08fr_0.92fr] lg:gap-16">
            <motion.div variants={item} className="space-y-8 md:space-y-10">
              <div className="flex flex-wrap items-center gap-3">
                <div className="inline-flex items-center gap-2.5 rounded-full border border-primary/20 bg-primary/5 px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.22em] text-primary shadow-sm">
                  <Sparkles className="h-4 w-4" />
                  Discovery, cleaned up
                </div>
                <div className="beta-chip">
                  <Radio className="h-3.5 w-3.5" />
                  Private beta
                </div>
              </div>

              {pendingSharedUrl && (
                <div className="surface-muted p-4 md:p-5">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-primary">Shared reel captured</p>
                  <p className="mt-1 truncate text-sm font-medium text-foreground">{pendingSharedUrl}</p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Connect Spotify to finish the stash flow and move the match into your library.
                  </p>
                </div>
              )}

              <div className="space-y-4">
                <h1 className="section-heading max-w-[14ch] text-balance">
                  Stash songs from anywhere, instantly.
                </h1>

                <p className="max-w-xl text-base leading-relaxed text-muted-foreground md:text-[1.1rem]">
                  Identify music from Reels and Shorts, then move any discovery into Spotify with a calmer, cleaner mobile flow that feels built for real use.
                </p>
              </div>

              <div className="hero-line w-32" />

              <div className="flex flex-col items-start gap-4 sm:flex-row sm:items-center">
                <Button onClick={onConnect} className="green-glow h-14 rounded-full bg-primary px-10 text-base font-semibold text-primary-foreground transition-all hover:scale-[1.02] hover:opacity-90 active:scale-[0.98] outline-focus">
                  Start stashing now
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
                <Button
                  variant="ghost"
                  className="h-14 rounded-full px-8 font-medium hover:bg-muted/50"
                  onClick={() => document.getElementById('how-it-works')?.scrollIntoView({ behavior: 'smooth' })}
                >
                  See how it works
                </Button>
              </div>

              <motion.div variants={item} className="custom-scrollbar flex gap-3 overflow-x-auto pb-2">
                {['Instagram Reels', 'YouTube Shorts', 'Web Links'].map((source) => (
                  <span key={source} className="surface-muted whitespace-nowrap bg-card/35 px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                    {source}
                  </span>
                ))}
              </motion.div>

              <p className="max-w-lg text-sm leading-relaxed text-muted-foreground">
                Access is currently managed as a private beta while Stash stays within Spotify development-access limits.
              </p>
            </motion.div>

            <motion.div variants={item} className="surface-panel relative bg-gradient-to-br from-card/92 via-card/84 to-accent/28 p-4 md:p-6">
              <div className="absolute -right-4 -top-4 h-32 w-32 rounded-full bg-primary/16 blur-3xl" />
              <div className="absolute right-8 top-8 z-10 rounded-full border border-white/16 bg-black/22 px-4 py-1.5 text-[10px] font-semibold uppercase tracking-[0.2em] text-white/85 backdrop-blur-xl">
                Live Analysis
              </div>
              <div className="relative overflow-hidden rounded-2xl shadow-2xl">
                <img src={heroImage} alt="Music experience" className="aspect-[4/3] w-full scale-105 object-cover transition-transform duration-700 hover:scale-100" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-transparent to-transparent" />
              </div>

              <div className="mt-6 space-y-3">
                <div className="surface-muted group flex cursor-default items-center justify-between p-4 transition-colors hover:bg-primary/5">
                  <div>
                    <p className="mb-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">Active Workflow</p>
                    <p className="text-base font-semibold">Capture. Match. Save.</p>
                  </div>
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 transition-colors group-hover:bg-primary/20">
                    <ArrowRight className="h-5 w-5 text-primary" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="surface-muted p-4">
                    <p className="mb-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">Flow</p>
                    <p className="text-base font-semibold">Mobile-first handoff</p>
                  </div>
                  <div className="surface-muted p-4">
                    <p className="mb-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">Access</p>
                    <p className="text-base font-semibold">Beta-ready onboarding</p>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </motion.section>

        <section id="how-it-works" className="container mx-auto px-4 pb-16 md:px-8 md:pb-28">
          <div className="surface-panel subtle-grid p-6 md:p-14">
            <div className="mb-12 md:mb-16">
              <p className="mb-3 text-[11px] font-semibold uppercase tracking-[0.28em] text-primary">The Process</p>
              <h2 className="max-w-[20ch] text-3xl font-semibold leading-tight md:text-5xl">Bridging discovery and library without the mess</h2>
            </div>

            <div className="grid gap-6 md:grid-cols-3 md:gap-8">
              <article className="space-y-4">
                <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10">
                  <Link2 className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-xl font-semibold">Paste or share</h3>
                <p className="leading-relaxed text-muted-foreground">Bring in the reel or short before you lose it in the scroll.</p>
              </article>

              <article className="space-y-4">
                <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10">
                  <Waves className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-xl font-semibold">Match cleanly</h3>
                <p className="leading-relaxed text-muted-foreground">Fingerprinting and Spotify verification work together so the result feels dependable.</p>
              </article>

              <article className="space-y-4">
                <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10">
                  <CheckCircle2 className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-xl font-semibold">Stash with context</h3>
                <p className="leading-relaxed text-muted-foreground">The track lands in a workflow that stays organized from the first save.</p>
              </article>
            </div>
          </div>
        </section>

        <section className="container mx-auto px-4 pb-22 md:px-6 md:pb-24">
          <motion.div
            initial={{ opacity: 0, y: 14 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.4 }}
            transition={{ duration: 0.5 }}
            className="surface-panel bg-gradient-to-br from-card/92 via-card/86 to-accent/46 p-7 text-center md:p-12"
          >
            <p className="mb-3 text-xs uppercase tracking-[0.22em] text-muted-foreground">Ready</p>
            <h2 className="mb-3 text-2xl md:text-4xl">Give your discoveries a home that feels curated</h2>
            <p className="mx-auto mb-7 max-w-2xl text-muted-foreground">
              No more lost songs in screenshots, tabs, or DMs. Stash keeps the path from discovery to library clean and immediate.
            </p>
            <Button onClick={onConnect} className="h-12 rounded-full bg-primary px-8 font-medium text-primary-foreground hover:opacity-90 outline-focus shadow-[0_20px_44px_-18px_color-mix(in_oklch,var(--primary)_72%,transparent)]">
              Open your stash workflow
            </Button>
          </motion.div>
        </section>
      </main>

      <footer className="border-t border-border/70 py-6">
        <div className="container mx-auto flex flex-col justify-between gap-3 px-4 md:flex-row md:items-center md:px-6">
          <p className="text-xs text-muted-foreground">&#169; 2026 Stash. Designed and developed by Sahil Sharma.</p>
          <div className="flex items-center gap-4 text-xs">
            <button onClick={() => onNavigate?.('privacy')} className="rounded-md px-1 text-muted-foreground hover:text-foreground outline-focus">
              Privacy
            </button>
            <button onClick={() => onNavigate?.('about')} className="rounded-md px-1 text-muted-foreground hover:text-foreground outline-focus">
              About
            </button>
            <button onClick={() => onNavigate?.('help')} className="rounded-md px-1 text-muted-foreground hover:text-foreground outline-focus">
              Help
            </button>
          </div>
        </div>
      </footer>

      <div className="fixed bottom-3 left-4 right-4 z-40 md:hidden">
        <Button onClick={onConnect} className="green-glow h-12 w-full rounded-full bg-primary font-semibold text-primary-foreground shadow-xl hover:opacity-90">
          <Zap className="mr-2 h-4 w-4" />
          Connect Spotify and stash
        </Button>
      </div>
    </div>
  );
}
