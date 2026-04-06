import { ArrowLeft, LockKeyhole, Radio, ShieldCheck } from 'lucide-react';
import { Button } from './ui/button';

interface PrivacyViewProps {
  onBack: () => void;
  theme: 'light' | 'dark';
}

const sections = [
  {
    title: 'What Stash stores',
    body: 'When you connect Spotify, Stash uses the minimum account and playlist information needed to provide the save flow. Song history is stored so your stash remains available across sessions.',
  },
  {
    title: 'How the data is used',
    body: 'Your data is used to identify tracks, save matches, personalize the app experience, and improve reliability across the stash workflow. It is not there to create noise around your account.',
  },
  {
    title: 'Third-party services',
    body: 'Stash integrates with Spotify and supporting infrastructure for authentication, storage, and recognition. Their own terms and policies still apply when those services are involved.',
  },
  {
    title: 'Your control',
    body: 'You can disconnect Spotify access and stop using the app at any time. If you need help with data questions or beta access, reach out directly through the support flow.',
  },
];

export function PrivacyView({ onBack }: PrivacyViewProps) {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="sticky top-0 z-40 border-b border-border/40 bg-background/70 backdrop-blur-3xl">
        <div className="container mx-auto px-4 py-4 md:px-8">
          <div className="flex items-center gap-4">
            <Button onClick={onBack} variant="ghost" size="icon" className="rounded-full hover:bg-muted/50">
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-muted-foreground">Privacy</p>
              <h1 className="text-xl font-medium tracking-tight">Data, kept straightforward</h1>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto max-w-4xl px-4 py-8 md:px-8 md:py-12">
        <div className="space-y-6">
          <section className="surface-panel p-6 md:p-8">
            <div className="flex flex-col gap-5 md:flex-row md:items-start md:justify-between">
              <div className="max-w-2xl">
                <div className="beta-chip">
                  <Radio className="h-3.5 w-3.5" />
                  Private beta policy
                </div>
                <h2 className="mt-4 text-3xl font-semibold tracking-tight md:text-4xl">
                  The product should feel trustworthy before it feels clever.
                </h2>
                <p className="mt-3 leading-relaxed text-muted-foreground">
                  This summary explains what Stash collects, why it exists, and how the app approaches your information while the product is still operating as a private beta.
                </p>
              </div>

              <div className="surface-muted flex items-center gap-3 p-4 md:min-w-[240px]">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                  <ShieldCheck className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-sm font-medium text-foreground">Built around essential data only</p>
                  <p className="mt-1 text-sm text-muted-foreground">No unnecessary account noise.</p>
                </div>
              </div>
            </div>
          </section>

          <section className="grid gap-4 md:grid-cols-2">
            {sections.map((section) => (
              <article key={section.title} className="surface-panel p-5 md:p-6">
                <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                  <LockKeyhole className="h-4.5 w-4.5" />
                </div>
                <h3 className="mt-4 text-lg font-semibold">{section.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{section.body}</p>
              </article>
            ))}
          </section>

          <section className="surface-panel p-6 md:p-8">
            <h2 className="text-2xl font-semibold tracking-tight">Contact</h2>
            <p className="mt-3 max-w-2xl text-sm leading-relaxed text-muted-foreground">
              Questions about privacy, beta access, or stored history can be sent to{' '}
              <a href="mailto:worksahilsharma@gmail.com" className="font-medium text-primary hover:underline">
                worksahilsharma@gmail.com
              </a>
              .
            </p>
            <p className="mt-5 text-xs uppercase tracking-[0.18em] text-muted-foreground">
              Last updated: April 6, 2026
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
