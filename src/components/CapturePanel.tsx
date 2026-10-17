import { useEffect, useId, useRef, useState } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { ArrowRight, Check, ClipboardPaste, Heart, Link2, Music2, AudioLines, X } from './stitch/StashIcons';
import '../styles/capture.css';
import { RecordSleeve } from './RecordSleeve';
import { CaptureScreen } from './stitch/CaptureScreen';

export { Vinyl } from './Vinyl';
import { Vinyl } from './Vinyl';

export function CaptureFlow() {
  const reduced = useReducedMotion();
  return <section className="capture-flow" aria-labelledby="capture-flow-title">
    <div className="capture-flow-heading"><h2 id="capture-flow-title">Good music. Fewer steps.</h2><span>FROM FEED TO FAVORITES</span></div>
    <ol>
      {[
        { icon: Link2, title: 'Paste a link', text: 'That Reel or Short you can’t stop replaying.' },
        { icon: AudioLines, title: 'Find the track', text: 'We listen and look for a match on Spotify.' },
        { icon: Heart, title: 'Make it yours', text: 'Save to a playlist or straight to Liked Songs.' },
      ].map(({ icon: Icon, title, text }, index) => <motion.li key={title}
        initial={reduced ? false : { opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.2 }} transition={{ duration: 0.4, delay: index * 0.08 }}>
        <div className="flow-marker"><Icon size={21} aria-hidden="true" /><span>0{index + 1}</span></div>
        <h3>{title}</h3><p>{text}</p>
      </motion.li>)}
    </ol>
  </section>;
}

interface CapturePanelProps {
  onSubmit: (url: string) => void | Promise<void>;
  pendingSharedUrl?: string | null;
  connected?: boolean;
  destinationName?: string;
  onChangeDestination?: () => void;
  recentSong?: import('../types').Song;
}

export function CapturePanel({ onSubmit, pendingSharedUrl, connected = false, destinationName, onChangeDestination, recentSong }: CapturePanelProps) {
  const [url, setUrl] = useState(pendingSharedUrl || '');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);
  const submitting = useRef(false);
  const id = useId();
  const reduced = useReducedMotion();

  useEffect(() => { if (pendingSharedUrl) setUrl(pendingSharedUrl); }, [pendingSharedUrl]);

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (submitting.current) return;
    const value = url.trim();
    try {
      const parsed = new URL(value);
      if (!['https:', 'http:'].includes(parsed.protocol)) throw new Error();
    } catch {
      setError('Paste a complete link, starting with https://.');
      inputRef.current?.focus();
      return;
    }
    submitting.current = true;
    setBusy(true);
    setError('');
    try { await onSubmit(value); }
    catch { setError('That didn’t go through. Your link is still here — try again.'); }
    finally { setBusy(false); submitting.current = false; }
  };

  const paste = async () => {
    try {
      const text = await navigator.clipboard.readText();
      const link = text.match(/https?:\/\/[^\s]+/i)?.[0]?.replace(/[),.\]]+$/, '');
      if (!link) { setError('No link found. Copy a Reel or Short link, then try again.'); return; }
      setUrl(link);
      setError('');
    } catch { setError('Tap the field and paste your link manually. Clipboard access isn’t available.'); }
    finally { inputRef.current?.focus(); }
  };

  if (connected) return <CaptureScreen id={id} url={url} busy={busy} error={error} inputRef={inputRef} onSubmit={submit} onUrlChange={value => { setUrl(value); setError(''); }} onClear={() => { setUrl(''); setError(''); inputRef.current?.focus(); }} onPaste={paste} destinationName={destinationName} onChangeDestination={onChangeDestination} recentSong={recentSong} />;

  return <motion.section className={`capture-panel capture-theme ${connected ? 'capture-connected' : ''}`}
    initial={reduced ? false : { opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.45 }} aria-labelledby={`${id}-title`}>
    <div className="capture-intro">
      <div className="capture-copy">
        <p className="capture-eyebrow"><span /> YOUR NEXT FAVORITE IS OUT THERE</p>
        <h1 id={`${id}-title`}>Hear it.<br /><span>Stash it.</span></h1>
        <p className="capture-description">Less scrolling for that one song.<br />More listening to it on Spotify.</p>
      </div>
      {connected ? <div className="capture-record-scene"><Vinyl /><span className="record-caption">GOOD FINDS DESERVE A REPLAY.</span></div> : <RecordSleeve />}
    </div>

    <form className="capture-form" onSubmit={submit} noValidate aria-busy={busy}>
      <div className="capture-form-heading"><label htmlFor={`${id}-url`}>Found something good?</label><span>LET’S KEEP IT.</span></div>
      <div className={`capture-input-row ${error ? 'has-error' : ''}`}>
        <Link2 size={21} aria-hidden="true" />
        <input ref={inputRef} id={`${id}-url`} type="url" inputMode="url" autoComplete="off" autoCapitalize="none" spellCheck={false}
          placeholder="Paste a Reel or Short link" value={url} disabled={busy} aria-label="Music source URL"
          aria-invalid={!!error} aria-describedby={`${id}-feedback ${id}-hint`}
          onChange={event => { setUrl(event.target.value); setError(''); }} />
        {url ? <button type="button" className="capture-icon-button" disabled={busy} aria-label="Clear link" onClick={() => { setUrl(''); setError(''); inputRef.current?.focus(); }}><X size={18} /></button>
          : <button type="button" className="capture-paste" aria-label="Paste" onClick={paste} disabled={busy}><ClipboardPaste size={16} aria-hidden="true" /><span>Paste</span></button>}
      </div>
      <div id={`${id}-feedback`} className="capture-feedback" aria-live="polite">
        {error || (pendingSharedUrl ? <><Check size={14} aria-hidden="true" /> Shared link ready. Let’s find your song.</> : 'Instagram Reels, YouTube Shorts, and TikTok links')}
      </div>
      <button type="submit" className="capture-primary" disabled={busy}>
        {busy ? <><span className="capture-equalizer" aria-hidden="true"><i /><i /><i /><i /></span>{connected ? 'Finding your song…' : 'Opening Spotify…'}</> : <>Stash this song <ArrowRight size={20} aria-hidden="true" /></>}
      </button>
      {connected ? <div className="capture-destination" id={`${id}-hint`}>
        <Music2 size={18} aria-hidden="true" /><div><span>YOUR SPOTIFY DESTINATION</span><strong>{destinationName}</strong></div>
        <button type="button" onClick={onChangeDestination}>Change</button>
      </div> : <p className="capture-connect-note" id={`${id}-hint`}>Connect Spotify next. We’ll keep your link ready.</p>}
    </form>
  </motion.section>;
}
