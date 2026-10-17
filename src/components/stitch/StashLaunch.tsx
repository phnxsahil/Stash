import { useEffect, useId, useRef, useState } from 'react';
import './launch.css';

/** Visual entrance only: routing, authentication and data loading run underneath. */
export function StashLaunch() {
  const [visible, setVisible] = useState(() => !window.matchMedia('(prefers-reduced-motion: reduce)').matches);
  const overlay = useRef<HTMLDivElement>(null);
  const mark = useRef<SVGSVGElement>(null);
  const cut = useRef<SVGPathElement>(null);
  const maskId = useId();

  useEffect(() => {
    if (!visible || !overlay.current || !mark.current || !cut.current) return;
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
    const dismiss = () => setVisible(false);
    const onMotionChange = () => { if (reduced.matches) dismiss(); };
    const onKey = (event: KeyboardEvent) => { if (event.key === 'Escape') dismiss(); };
    const target = Array.from(document.querySelectorAll<HTMLElement>('header .st-logo img, .st-sidebar .st-logo img, .st-topbar .st-logo img'))
      .map(element => element.getBoundingClientRect())
      .find(rect => rect.width > 0 && rect.top >= 0 && rect.bottom <= window.innerHeight);
    if (!target) { dismiss(); return; }
    mark.current.style.transform = `translate(${target.x}px, ${target.y}px) scale(${target.width / 96})`;
    const drawing = cut.current.animate([{ strokeDashoffset: 1 }, { strokeDashoffset: 0 }], { duration: 520, delay: 80, easing: 'cubic-bezier(.22,1,.36,1)', fill: 'both' });
    const background = overlay.current.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 280, delay: 520, fill: 'both' });
    const dismissTimer = window.setTimeout(dismiss, 860);
    reduced.addEventListener('change', onMotionChange);
    window.addEventListener('pointerdown', dismiss, { once: true });
    window.addEventListener('keydown', onKey);
    return () => {
      window.clearTimeout(dismissTimer);
      drawing.cancel(); background.cancel();
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
  </div>;
}
