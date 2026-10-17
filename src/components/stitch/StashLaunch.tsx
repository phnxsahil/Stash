import { useEffect, useId, useRef, useState } from 'react';
import './launch.css';

/** Visual entrance only: routing, authentication and data loading run underneath. */
export function StashLaunch() {
  const [visible, setVisible] = useState(() => !window.matchMedia('(prefers-reduced-motion: reduce)').matches);
  const overlay = useRef<HTMLDivElement>(null);
  const mark = useRef<SVGSVGElement>(null);
  const cut = useRef<SVGPathElement>(null);
  const word = useRef<HTMLSpanElement>(null);
  const maskId = useId();

  useEffect(() => {
    if (!visible || !overlay.current || !mark.current || !cut.current || !word.current) return;
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
    const dismiss = () => setVisible(false);
    const onMotionChange = () => { if (reduced.matches) dismiss(); };
    const onKey = (event: KeyboardEvent) => { if (event.key === 'Escape') dismiss(); };
    const drawing = cut.current.animate([{ strokeDashoffset: 1 }, { strokeDashoffset: 0 }], { duration: 520, delay: 100, easing: 'cubic-bezier(.22,1,.36,1)', fill: 'both' });
    const background = overlay.current.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 420, delay: 650, fill: 'both' });
    const name = word.current.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 200, delay: 620, fill: 'both' });
    let frame = 0;
    const start = performance.now();
    const update = (now: number) => {
      const elapsed = now - start;
      const progress = Math.min(1, Math.max(0, (elapsed - 650) / 650));
      const ease = 1 - Math.pow(1 - progress, 4);
      const x = (window.innerWidth - 96) / 2;
      const y = Math.max(48, (window.innerHeight - 96) / 2 - 30);
      // Track the visible brand through authentication completion and viewport changes.
      const target = Array.from(document.querySelectorAll<HTMLElement>('header .st-logo img, .st-sidebar .st-logo img, .st-topbar .st-logo img'))
        .map(element => element.getBoundingClientRect())
        .find(rect => rect.width > 0 && rect.top >= 0 && rect.bottom <= window.innerHeight);
      if (mark.current) {
        mark.current.style.transform = target
          ? `translate(${x + (target.x - x) * ease}px, ${y + (target.y - y) * ease}px) scale(${1 + (target.width / 96 - 1) * ease})`
          : `translate(${x}px, ${y}px)`;
        mark.current.style.opacity = target ? '1' : String(1 - progress);
      }
      if (elapsed >= 1320) dismiss();
      else frame = requestAnimationFrame(update);
    };
    frame = requestAnimationFrame(update);
    reduced.addEventListener('change', onMotionChange);
    window.addEventListener('pointerdown', dismiss, { once: true });
    window.addEventListener('keydown', onKey);
    return () => {
      cancelAnimationFrame(frame);
      drawing.cancel(); background.cancel(); name.cancel();
      reduced.removeEventListener('change', onMotionChange);
      window.removeEventListener('pointerdown', dismiss);
      window.removeEventListener('keydown', onKey);
    };
  }, [visible]);

  if (!visible) return null;
  return <div className="st-launch" aria-hidden="true" data-testid="stash-launch">
    <div className="st-launch-backdrop" ref={overlay} />
    <svg className="st-launch-mark" ref={mark} viewBox="0 0 32 32">
      <defs><mask id={maskId} maskUnits="userSpaceOnUse" x="0" y="0" width="32" height="32">
        <rect width="32" height="32" fill="white" />
        <path ref={cut} d="M29 9H13a3 3 0 0 0 0 6h6a3 3 0 0 1 0 6H3" fill="none" stroke="black" strokeWidth="3" pathLength="1" strokeDasharray="1" />
      </mask></defs>
      <path d="M9 3h14a3 3 0 0 1 3 3v23l-10-5-10 5V6a3 3 0 0 1 3-3Z" fill="#1DB954" mask={`url(#${maskId})`} />
    </svg>
    <span className="st-launch-word" ref={word}>Stash</span>
  </div>;
}
