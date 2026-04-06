import { ArrowLeft, Heart, Music, Radio, Waves } from 'lucide-react';
import { Button } from './ui/button';
import logoLight from '../assets/772b6607fed69ee0832a6f5e7102b5a6b45e84c2.png';
import logoDark from '../assets/b659e78a263c10d9b32767464e4b074fdb043c31.png';

interface AboutViewProps {
  onBack: () => void;
  theme: 'light' | 'dark';
}

const pillars = [
  {
    title: 'Discovery without clutter',
    description: 'Stash turns scattered finds across feeds and links into a clean saving flow.',
    icon: Music,
  },
  {
    title: 'A calmer mobile rhythm',
    description: 'The product is built around quick capture, reliable matching, and a simple path into your library.',
    icon: Waves,
  },
  {
    title: 'Private beta, carefully shaped',
    description: 'Access is intentionally limited while the experience is refined within Spotify development access.',
    icon: Heart,
  },
];

export function AboutView({ onBack, theme }: AboutViewProps) {
  const activeLogo = theme === 'dark' ? logoDark : logoLight;

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="sticky top-0 z-40 border-b border-border/40 bg-background/70 backdrop-blur-3xl">
        <div className="container mx-auto px-4 py-4 md:px-8">
          <div className="flex items-center gap-4">
            <Button onClick={onBack} variant="ghost" size="icon" className="rounded-full hover:bg-muted/50">
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-muted-foreground">About</p>
              <h1 className="text-xl font-medium tracking-tight">Why Stash exists</h1>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto max-w-4xl px-4 py-8 md:px-8 md:py-12">
        <div className="space-y-6">
          <section className="surface-panel overflow-hidden p-6 md:p-10">
            <div className="flex flex-col gap-8 md:flex-row md:items-center md:justify-between">
              <div className="max-w-2xl space-y-4">
                <div className="beta-chip">
                  <Radio className="h-3.5 w-3.5" />
                  Minimal private beta
                </div>
                <h2 className="max-w-[14ch] text-3xl font-semibold leading-tight md:text-5xl">
                  The internet is full of songs that deserve a cleaner save flow.
                </h2>
                <p className="max-w-xl leading-relaxed text-muted-foreground">
                  Stash was created for the real moment of discovery: hearing something in a reel, a short, or a random link and wanting to keep it before it disappears into the scroll.
                </p>
              </div>

              <div className="surface-muted flex min-w-[220px] flex-col items-center gap-4 p-6 text-center">
                <img src={activeLogo} alt="Stash logo" className="h-24 w-24 object-contain md:h-28 md:w-28" />
                <div>
                  <p className="text-sm font-medium text-foreground">Music discovery, simplified</p>
                  <p className="mt-1 text-sm text-muted-foreground">Designed and developed by Sahil Sharma.</p>
                </div>
              </div>
            </div>
          </section>

          <section className="surface-panel p-6 md:p-8">
            <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-primary">Mission</p>
            <div className="mt-4 grid gap-6 md:grid-cols-[1.1fr_0.9fr]">
              <div>
                <h2 className="text-2xl font-semibold tracking-tight">Bring order to modern music discovery.</h2>
                <p className="mt-3 leading-relaxed text-muted-foreground">
                  The goal is not to make discovery louder. It is to make it easier to act on. Stash keeps the distance between finding a song and saving it as short and dependable as possible.
                </p>
              </div>
              <div className="surface-muted p-5">
                <p className="text-sm font-medium text-foreground">Current product stance</p>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                  Stash is intentionally operating as a private beta while backend reliability, share handling, and Spotify access limits are managed responsibly.
                </p>
              </div>
            </div>
          </section>

          <section className="grid gap-4 md:grid-cols-3">
            {pillars.map((pillar) => {
              const Icon = pillar.icon;
              return (
                <article key={pillar.title} className="surface-panel p-5 md:p-6">
                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                    <Icon className="h-5 w-5" />
                  </div>
                  <h3 className="mt-5 text-lg font-semibold">{pillar.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{pillar.description}</p>
                </article>
              );
            })}
          </section>

          <section className="surface-panel p-6 md:p-8">
            <h2 className="text-2xl font-semibold tracking-tight">How Stash works today</h2>
            <div className="mt-6 space-y-4">
              {[
                'Capture a reel, short, or web link before it disappears.',
                'Identify the track through the matching flow and verify it against Spotify.',
                'Move the match into your stash workflow with a history that stays organized.',
              ].map((step, index) => (
                <div key={step} className="surface-muted flex items-start gap-4 p-4">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary text-sm font-semibold text-primary-foreground">
                    {index + 1}
                  </div>
                  <p className="pt-1 text-sm leading-relaxed text-muted-foreground">{step}</p>
                </div>
              ))}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
