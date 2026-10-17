import type { ButtonHTMLAttributes, HTMLAttributes, ReactNode } from 'react';

export function Icon({ name, size = 24, filled = false, className = '', ...props }: HTMLAttributes<HTMLSpanElement> & { name: string; size?: number | string; filled?: boolean }) {
  return <span {...props} aria-hidden="true" className={`stash-icon ${className}`} style={{ fontSize: size, fontVariationSettings: `'FILL' ${filled ? 1 : 0}`, ...props.style }}>{name}</span>;
}

export function StashLogo({ wordmark = true, size = 32 }: { wordmark?: boolean; size?: number }) {
  return <span className="st-logo"><img src="/stash-logo.svg" width={size} height={size} style={{ width: size, height: size }} alt="" />{wordmark && <span>Stash</span>}</span>;
}

export function StashButton({ variant = 'secondary', className = '', ...props }: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: 'primary' | 'secondary' | 'ghost' | 'icon' }) {
  return <button {...props} className={`st-button st-button-${variant} ${className}`} />;
}

export function StashCard({ className = '', ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div {...props} className={`st-card ${className}`} />;
}

export function StashBadge({ children, connected = true }: { children: ReactNode; connected?: boolean }) {
  return <span className={`st-badge ${connected ? 'is-connected' : ''}`}><i aria-hidden="true" />{children}</span>;
}

export function StashRow({ icon, title, description, trailing, className = '', ...props }: Omit<HTMLAttributes<HTMLDivElement>, 'title'> & { icon: string; title: ReactNode; description?: ReactNode; trailing?: ReactNode }) {
  return <div {...props} className={`st-row ${className}`}><span className="st-row-icon"><Icon name={icon} size={20} /></span><div className="st-row-copy"><strong>{title}</strong>{description && <p>{description}</p>}</div>{trailing && <div className="st-row-trailing">{trailing}</div>}</div>;
}

export function ComingSoon() { return <span className="st-coming-soon">Coming soon</span>; }

export function relativeStashDate(value?: string) {
  if (!value || Number.isNaN(Date.parse(value))) return '';
  const seconds = Math.max(0, Math.floor((Date.now() - Date.parse(value)) / 1000));
  if (seconds < 60) return 'Just now';
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  if (seconds < 172800) return 'Yesterday';
  return `${Math.floor(seconds / 86400)}d ago`;
}
