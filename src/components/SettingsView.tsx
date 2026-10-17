import { ComingSoon, Icon, StashBadge, StashCard, StashRow } from './stitch/StashUI';
import { StashShell, type StashDestination } from './stitch/StashShell';
import { Switch } from './ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Playlist } from '../lib/api';

interface SettingsViewProps {
  userName: string;
  userEmail: string;
  autoAddTopMatch: boolean;
  defaultPlaylistId: string;
  playlists: Playlist[];
  theme: 'light' | 'dark';
  onBack: () => void;
  onLogout: () => void;
  onToggleAutoAdd: (value: boolean) => void;
  onPlaylistChange: (playlistId: string) => void;
  onToggleTheme: (value: 'light' | 'dark') => void;
  onOpenStats: () => void;
  hasSpotifyToken: boolean;
  onReconnectSpotify: () => void;
  onNavigate?: (destination: StashDestination) => void;
}

export function SettingsView({
  userName,
  userEmail,
  autoAddTopMatch,
  defaultPlaylistId,
  playlists,
  theme,
  onBack,
  onLogout,
  onToggleAutoAdd,
  onPlaylistChange,
  onToggleTheme,
  onOpenStats,
  hasSpotifyToken,
  onReconnectSpotify,
  onNavigate,
}: SettingsViewProps) {
  const supportNavigate = (view: string) => (window as any).onNavigate?.(view);
  return <StashShell active="settings" userName={userName} connected={hasSpotifyToken} theme={theme} onNavigate={destination => onNavigate ? onNavigate(destination) : destination === 'stats' ? onOpenStats() : onBack()} onToggleTheme={onToggleTheme} onLogout={onLogout} autoAddTopMatch={autoAddTopMatch} onToggleAutoAdd={onToggleAutoAdd}>
    <div className="st-settings-content">
      <header className="st-settings-heading"><div><h1>Settings</h1><StashBadge connected={hasSpotifyToken}>{hasSpotifyToken ? 'Connected' : 'Reconnect'}</StashBadge></div><p>Preferences & sonic sync controls</p></header>
      <section className="st-settings-group" aria-labelledby="settings-account"><h2 id="settings-account" className="st-label">Account</h2><StashCard>
        <div className="st-settings-identity"><span className="st-avatar"><Icon name="person" size={24} /></span><div><div><strong>{userName}</strong><StashBadge connected={hasSpotifyToken}>{hasSpotifyToken ? 'Connected' : 'Disconnected'}</StashBadge></div><p>{userEmail}</p></div></div>
        <button className="st-settings-row-button" onClick={onReconnectSpotify}><StashRow icon="switch_account" title="Reconnect Spotify" description="Connect your Spotify profile" trailing={<Icon name="chevron_right" size={20} />} /></button>
        <button className="st-settings-row-button st-danger" onClick={onLogout}><StashRow icon="logout" title="Sign Out" description="Sign out of your Stash account" trailing={<Icon name="chevron_right" size={20} />} /></button>
      </StashCard></section>
      <section className="st-settings-group" aria-labelledby="settings-defaults"><h2 id="settings-defaults" className="st-label">Defaults</h2><StashCard>
        <StashRow icon="favorite" title={<label htmlFor="playlist">Default Destination</label>} description="Where newly identified tracks sync" trailing={<Select value={defaultPlaylistId} onValueChange={onPlaylistChange}><SelectTrigger id="playlist" className="st-settings-select" aria-label="Default destination"><SelectValue placeholder="Select playlist" /></SelectTrigger><SelectContent className="stitch-theme">{playlists.map(playlist => <SelectItem key={playlist.id} value={playlist.id}>{playlist.name}</SelectItem>)}</SelectContent></Select>} />
        <StashRow icon="bolt" title={<label htmlFor="auto-add">Auto-Add Top Match</label>} description="Save the strongest match immediately" trailing={<Switch id="auto-add" checked={autoAddTopMatch} onCheckedChange={onToggleAutoAdd} />} />
      </StashCard></section>
      <section className="st-settings-group" aria-labelledby="settings-preferences"><h2 id="settings-preferences" className="st-label">App preferences</h2><StashCard>
        <StashRow icon="notifications" title="Push Notifications" description="Coming soon" trailing={<Switch aria-label="Push notifications — coming soon" disabled checked={false} />} />
        <StashRow icon="vibration" title="Haptic Feedback" description="Coming soon" trailing={<Switch aria-label="Haptic feedback — coming soon" disabled checked={false} />} />
        <StashRow icon="palette" title={<label htmlFor="theme">Appearance</label>} description="Choose your soundstage theme" trailing={<Select value={theme} onValueChange={value => onToggleTheme(value as 'light' | 'dark')}><SelectTrigger id="theme" aria-label="Appearance" className="st-settings-select"><SelectValue /></SelectTrigger><SelectContent className="stitch-theme"><SelectItem value="dark">Obsidian</SelectItem><SelectItem value="light">Light</SelectItem></SelectContent></Select>} />
      </StashCard></section>
      <section className="st-settings-group" aria-labelledby="settings-data"><h2 id="settings-data" className="st-label">Data & storage</h2><StashCard>
        <button disabled className="st-settings-row-button"><StashRow icon="ios_share" title="Export Stash History" description="Download JSON or CSV" trailing={<ComingSoon />} /></button>
        <button disabled className="st-settings-row-button st-danger"><StashRow icon="delete_sweep" title="Clear Match History" description="Manage saved match history" trailing={<ComingSoon />} /></button>
      </StashCard></section>
      <section className="st-settings-group" aria-labelledby="settings-about"><h2 id="settings-about" className="st-label">About</h2><StashCard>
        <button className="st-settings-row-button" onClick={() => supportNavigate('about')}><StashRow icon="terminal" title="Stash for Mobile" description="About Stash" trailing={<Icon name="chevron_right" size={20} />} /></button>
        <button className="st-settings-row-button" onClick={() => supportNavigate('privacy')}><StashRow icon="verified_user" title="Privacy & Audio Processing" description="How Stash handles your data" trailing={<Icon name="chevron_right" size={20} />} /></button>
        <button className="st-settings-row-button" onClick={() => supportNavigate('help')}><StashRow icon="support" title="Help Center & Feedback" description="Tips, access, and issue reporting" trailing={<Icon name="chevron_right" size={20} />} /></button>
      </StashCard></section>
      <div className="st-settings-footer"><span><Icon name="graphic_eq" size={14} />Stash your music</span><p>Private beta · Spotify access is currently invite-only.</p></div>
    </div>
  </StashShell>;
}
