import { ArrowUpRight, AudioLines } from 'lucide-react';
import { motion, useReducedMotion } from 'framer-motion';
import { CapturePanel, CaptureFlow } from './CapturePanel';
import '../styles/capture.css';

interface LandingViewProps {
  onConnect: () => void;
  onCapture: (url: string) => void | Promise<void>;
  theme: 'light' | 'dark';
  onToggleTheme: (value: 'light' | 'dark') => void;
  onNavigate?: (page: 'privacy' | 'about' | 'help') => void;
  pendingSharedUrl?: string | null;
}

export function LandingView({ onConnect, onCapture, onNavigate, pendingSharedUrl }: LandingViewProps) {
  const reduced = useReducedMotion();
  const focusCapture = () => {
    const input = document.querySelector<HTMLInputElement>('.stash-landing .capture-input-row input');
    input?.scrollIntoView({ behavior: reduced ? 'instant' : 'smooth', block: 'center' });
    input?.focus({ preventScroll: true });
  };
  return (
    <div className="stash-landing capture-theme">
      <a href="#main-content" className="capture-skip">Skip to main content</a>
      <header className="capture-header">
        <a className="capture-brand" href="#main-content" aria-label="Stash home">
          <AudioLines aria-hidden="true" /> stash<span>.</span>
        </a>
        <div className="landing-header-actions"><a href="#how-it-works">How it works</a><button className="capture-connect" onClick={onConnect}>Connect Spotify <ArrowUpRight size={16} aria-hidden="true" /></button></div>
      </header>
      <main id="main-content" className="landing-workspace">
        <CapturePanel onSubmit={onCapture} pendingSharedUrl={pendingSharedUrl} />
        <div id="how-it-works"><CaptureFlow /></div>
        <motion.section className="landing-closer" initial={reduced ? false : {opacity:0,y:24}} whileInView={{opacity:1,y:0}} viewport={{once:true,amount:.3}} transition={{duration:.6}}>
          <div className="closer-grooves" aria-hidden="true"><AudioLines /></div>
          <p className="capture-eyebrow">DON’T LET THE GOOD ONES GET AWAY.</p>
          <h2>A fleeting clip.<br /><span>A forever favorite.</span></h2>
          <p>Your next favorite song is hiding in your feed.<br />Give it a place in your playlist.</p>
          <button className="library-secondary landing-final-action" onClick={focusCapture}>Find your next favorite <ArrowUpRight size={18} /></button>
        </motion.section>
        <div className="capture-beta"><span aria-hidden="true" /> Private beta · Spotify access is currently invite-only.</div>
      </main>
      <footer className="capture-footer">
        <p>A home for your next favorite song.</p>
        <nav aria-label="Information">
          <button onClick={() => onNavigate?.('about')}>About</button>
          <button onClick={() => onNavigate?.('privacy')}>Privacy</button>
          <button onClick={() => onNavigate?.('help')}>Help</button>
        </nav>
      </footer>
    </div>
  );
}
