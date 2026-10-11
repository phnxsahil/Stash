import { motion, useReducedMotion } from 'framer-motion';
import { ArrowRight, ArrowUpRight, Check, Link2, Moon, Music2, Sun } from 'lucide-react';
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

export function LandingView({ onConnect, theme, onToggleTheme, onNavigate, pendingSharedUrl }: LandingViewProps) {
  const reduceMotion = useReducedMotion();
  const reveal = { initial: reduceMotion ? false as const : { opacity: 0, y: 20 }, whileInView: { opacity: 1, y: 0 }, viewport: { once: true }, transition: { duration: 0.55 } };
  return (
    <div className="discovery-page min-h-screen text-foreground">
      <header className="discovery-header">
        <div className="discovery-shell flex items-center justify-between gap-3 py-4">
          <a href="#" aria-label="Stash home" className="flex items-center gap-3">
            <img src={theme === 'dark' ? logoDark : logoLight} alt="" className="size-10 object-contain" />
            <span className="text-xl font-bold tracking-tight">stash<span className="text-primary">.</span></span>
          </a>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <Sun aria-hidden className="hidden size-4 text-muted-foreground sm:block" />
              <Switch aria-label="Dark mode" checked={theme === 'dark'} onCheckedChange={checked => onToggleTheme(checked ? 'dark' : 'light')} />
              <Moon aria-hidden className="hidden size-4 text-muted-foreground sm:block" />
            </div>
            <Button onClick={onConnect} className="rounded-full px-5">Connect</Button>
          </div>
        </div>
      </header>
      <main>
        <section className="discovery-shell discovery-hero">
          <motion.div {...reveal} className="min-w-0">
            <p className="editorial-kicker"><span className="size-2 rounded-full bg-primary" /> For the songs you almost lost</p>
            <h1 className="discovery-title">Found in the feed.<br /><span>Kept for the feeling.</span></h1>
            <p className="mt-7 max-w-md text-lg leading-relaxed text-muted-foreground">That reel. That chorus. That one song you keep coming back to. Give it a place in your music library.</p>
            {pendingSharedUrl && <div className="mt-6 rounded-2xl border border-primary/30 p-4"><p className="font-semibold">Your shared link is ready</p><p className="mt-1 truncate text-sm text-muted-foreground">{pendingSharedUrl}</p><p className="mt-2 text-sm">Connect Spotify to find the track.</p></div>}
            <div className="mt-8 flex flex-wrap items-center gap-4">
              <Button onClick={onConnect} className="h-14 rounded-full px-7 text-base font-semibold">Start stashing now <ArrowUpRight className="ml-3 size-5" /></Button>
              <a href="#how-it-works" className="inline-flex min-h-11 items-center gap-2 text-sm font-semibold">How it works <ArrowRight className="size-4" /></a>
            </div>
            <p className="mt-5 text-xs leading-relaxed text-muted-foreground">Spotify connection required. Access is currently in private beta.</p>
          </motion.div>
          <motion.div {...reveal} className="record-scene" aria-label="Illustration of a music discovery saved to a collection">
            <div className="record-art"><img src={heroImage} alt="Abstract artwork for a music collection" /><span>THE NEXT<br />GOOD FIND.</span></div>
            <div className="vinyl-record" aria-hidden><div className="vinyl-label"><Music2 className="size-9" /><span>STASH / SIDE A</span></div></div>
            <div className="record-caption"><span>01 / YOUR NEW ROTATION</span><span>Keep listening <ArrowUpRight className="size-4" /></span></div>
            <div className="discovery-receipt"><span className="receipt-icon"><Check className="size-5" /></span><div><p className="text-sm font-bold">A good find deserves a home.</p><p className="mt-1 text-xs text-muted-foreground">From a passing moment to your collection.</p></div></div>
          </motion.div>
        </section>
        <section className="discovery-shell discovery-platforms" aria-label="Supported link sources">
          <span className="editorial-kicker">Bring the link</span><span>Instagram Reels</span><span>YouTube Shorts</span><span>Web links</span>
        </section>
        <section id="how-it-works" className="discovery-shell py-16 md:py-24">
          <motion.div {...reveal} className="flex flex-col justify-between gap-5 md:flex-row md:items-end">
            <div><p className="editorial-kicker mb-4">Less searching. More listening.</p><h2 className="text-4xl font-semibold tracking-tight md:text-5xl">Keep the song.<br />Leave the scroll.</h2></div>
            <p className="max-w-sm leading-relaxed text-muted-foreground">One link is all you need to start. Stash finds a match so you can decide what belongs in your rotation.</p>
          </motion.div>
          <div className="mt-12 grid gap-0 lg:grid-cols-3">
            {[{ n: '01', icon: Link2, title: 'Bring the moment', body: 'Copy a reel or short link and paste it into Stash. On iPhone, paste is the starting point.' }, { n: '02', icon: Music2, title: 'Find the track', body: 'Stash listens to the audio and looks for a Spotify match. Check the result before you keep it.' }, { n: '03', icon: Check, title: 'Make it yours', body: 'Save to Liked Songs or your selected playlist. Your Stash history keeps the discovery close.' }].map(step => <motion.article {...reveal} key={step.n} className="discovery-step"><div className="mb-8 flex items-center justify-between"><span className="editorial-kicker">{step.n}</span><step.icon className="size-6 text-primary" /></div><h3 className="text-xl font-semibold">{step.title}</h3><p className="mt-3 text-sm leading-relaxed text-muted-foreground">{step.body}</p></motion.article>)}
          </div>
        </section>
        <section className="discovery-shell pb-20"><motion.div {...reveal} className="discovery-outro"><p className="editorial-kicker">Your next favorite is out there.</p><h2 className="mt-5 text-4xl font-semibold tracking-tight md:text-6xl">Don't let it disappear.</h2><Button onClick={onConnect} className="mt-8 h-14 rounded-full px-8 text-base">Connect Spotify <ArrowUpRight className="ml-3 size-5" /></Button></motion.div></section>
      </main>
      <footer className="discovery-shell flex flex-col justify-between gap-5 border-t border-border py-7 md:flex-row"><p className="text-xs text-muted-foreground">Stash / Made by Sahil Sharma</p><nav className="flex gap-6" aria-label="Information">{(['privacy', 'about', 'help'] as const).map(page => <button key={page} onClick={() => onNavigate?.(page)} className="min-h-11 text-sm capitalize text-muted-foreground hover:text-foreground">{page.charAt(0).toUpperCase() + page.slice(1)}</button>)}</nav></footer>
    </div>
  );
}
