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
    const findTarget = () => Array.from(document.querySelectorAll<HTMLElement>('header .st-logo img, .st-sidebar .st-logo img, .st-topbar .st-logo img'))
      .map(element => element.getBoundingClientRect())
      .find(rect => rect.width > 0 && rect.top >= 0 && rect.bottom <= window.innerHeight);
    const startedAt = performance.now();
    let drawing: Animation | null = null;
    let background: Animation | null = null;
    let dismissTimer = 0;
    let retryTimer = 0;
    const start = (target?: DOMRect) => {
      if (drawing) return;
      const size = Math.min(window.innerWidth, window.innerHeight) * 0.18;
      const x = target?.x ?? (window.innerWidth - size) / 2;
      const y = target?.y ?? (window.innerHeight - size) / 2;
      const scale = target ? target.width / 96 : size / 96;
      mark.current!.style.transform = `translate(${x}px, ${y}px) scale(${scale})`;
      drawing = cut.current!.animate([{ strokeDashoffset: 1 }, { strokeDashoffset: 0 }], { duration: 460, delay: 60, easing: 'cubic-bezier(.22,1,.36,1)', fill: 'both' });
      background = overlay.current!.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 260, delay: 480, fill: 'both' });
      dismissTimer = window.setTimeout(dismiss, 820);
    };
    const seekTarget = () => {
      const target = findTarget();
      if (target || performance.now() - startedAt >= 420) {
        start(target);
        return;
      }
      retryTimer = window.setTimeout(seekTarget, 40);
    };
    seekTarget();
    reduced.addEventListener('change', onMotionChange);
    window.addEventListener('pointerdown', dismiss, { once: true });
    window.addEventListener('keydown', onKey);
    return () => {
      window.clearTimeout(dismissTimer);
      window.clearTimeout(retryTimer);
      drawing?.cancel(); background?.cancel();
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
