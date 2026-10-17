import type { ReactNode } from 'react';
import { Sheet, SheetContent, SheetDescription, SheetTitle, SheetTrigger } from '../ui/sheet';
import { Switch } from '../ui/switch';
import { ComingSoon, Icon, StashBadge, StashLogo } from './StashUI';

export type StashDestination = 'capture' | 'library' | 'stats' | 'settings';
interface StashShellProps {
  active: StashDestination;
  children: ReactNode;
  userName: string;
  connected?: boolean;
  theme: 'dark' | 'light';
  onNavigate: (destination: StashDestination) => void;
  onToggleTheme?: (theme: 'dark' | 'light') => void;
  onLogout?: () => void;
  autoAddTopMatch?: boolean;
  onToggleAutoAdd?: (checked: boolean) => void;
}

const destinations = [
  { id: 'capture', label: 'Capture', desktop: 'Capture', icon: 'radio_button_checked' },
  { id: 'library', label: 'Library', desktop: 'Library', icon: 'library_music' },
  { id: 'stats', label: 'Stats', desktop: 'Stats', icon: 'equalizer' },
  { id: 'settings', label: 'Settings', desktop: 'Settings', icon: 'tune' },
] as const;

export function StashShell({ active, children, userName, connected = false, theme, onNavigate, onToggleTheme, onLogout, autoAddTopMatch, onToggleAutoAdd }: StashShellProps) {
  const nav = (mobile: boolean) => destinations.map(item => <button key={item.id} onClick={() => onNavigate(item.id)} aria-current={active === item.id ? 'page' : undefined}><Icon name={item.icon} size={mobile ? 24 : 20} filled={active === item.id} /><span>{mobile ? item.label : item.desktop}</span></button>);
  return <div className={`stitch-theme st-shell st-screen-${active}`}>
    <a className="st-skip" href="#st-main">Skip to main content</a>
    <aside className="st-sidebar" aria-label="Desktop navigation">
      <button className="st-brand-button" onClick={() => onNavigate('capture')} aria-label="Stash home"><StashLogo /></button>
      <p className="st-menu-label">Studio menu</p><nav aria-label="Main navigation">{nav(false)}</nav>
      <div className="st-sidebar-bottom"><button className="st-sidebar-profile" onClick={() => onNavigate('settings')}><span className="st-avatar"><Icon name="person" size={20} /></span><span>{userName || 'Your account'}<small>Your personal collection</small></span><Icon name="more_vert" size={18} /></button></div>
    </aside>
    <header className="st-topbar">
      <button className="st-mobile-brand st-brand-button" onClick={() => onNavigate('capture')} aria-label="Stash home"><StashLogo /></button>
      <div className="st-desktop-page"><div className="st-toolbar-search"><Icon name="search" size={16} /><input disabled aria-label="Search captures — coming soon" placeholder="Search captures, tags, or stems…" /><ComingSoon /></div></div>
      <StashBadge connected={connected}>{connected ? 'Spotify connected' : 'Spotify disconnected'}</StashBadge>
      <div className="st-toolbar-coming-soon"><button disabled aria-label="Audio monitoring — coming soon" title="Audio monitoring — coming soon"><Icon name="podcasts" size={20} /></button><button disabled aria-label="Notifications — coming soon" title="Notifications — coming soon"><Icon name="notifications" size={20} /></button><ComingSoon /></div>
      <Sheet><SheetTrigger asChild><button className="st-avatar" aria-label="Open account menu"><Icon name="person" size={18} /></button></SheetTrigger>
        <SheetContent className="stitch-theme st-account"><SheetTitle>Your Stash</SheetTitle><SheetDescription>Account and listening preferences</SheetDescription>
          <p className="st-account-name">{userName}</p>
          {onToggleTheme && <label className="st-account-preference">Dark mode<Switch checked={theme === 'dark'} onCheckedChange={checked => onToggleTheme(checked ? 'dark' : 'light')} /></label>}
          {onToggleAutoAdd && <label className="st-account-preference">Auto-add top match<Switch checked={autoAddTopMatch} onCheckedChange={onToggleAutoAdd} /></label>}
          <button onClick={() => onNavigate('settings')}><Icon name="tune" size={20} />Settings & Spotify</button>
          <button onClick={() => onNavigate('stats')}><Icon name="equalizer" size={20} />Stats</button>
          {onLogout && <button onClick={onLogout}><Icon name="logout" size={20} />Log out</button>}
        </SheetContent>
      </Sheet>
    </header>
    <main id="st-main" className="st-workspace">{children}</main>
    <nav className="st-bottom-nav" aria-label="Mobile navigation">{nav(true)}</nav>
  </div>;
}
