import { ArrowLeft, ChevronRight, HelpCircle, Info, LogOut, Radio, Shield } from 'lucide-react';
import { Button } from './ui/button';
import { Label } from './ui/label';
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
}: SettingsViewProps) {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="sticky top-0 z-40 border-b border-border/40 bg-background/70 backdrop-blur-3xl">
        <div className="container mx-auto px-4 md:px-8 py-4">
          <div className="flex items-center gap-4">
            <Button onClick={onBack} variant="ghost" size="icon" className="rounded-full hover:bg-muted/50">
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div>
              <p className="text-[10px] uppercase tracking-[0.22em] font-bold text-muted-foreground">Settings</p>
              <h1 className="text-xl font-semibold tracking-tight">Preferences and access</h1>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto max-w-3xl px-4 py-8 md:px-8 md:py-12">
        <div className="space-y-6">
          <section className="surface-panel p-5 md:p-7">
            <div className="mb-5 flex items-start justify-between gap-4">
              <div>
                <p className="text-[11px] uppercase tracking-[0.18em] font-bold text-muted-foreground">Account</p>
                <h2 className="mt-1 text-xl font-bold tracking-tight">{userName}</h2>
                <p className="text-sm text-muted-foreground">{userEmail}</p>
              </div>
              <div className="beta-chip">
                <Radio className="h-3.5 w-3.5" />
                Private beta
              </div>
            </div>

            {!hasSpotifyToken && (
              <div className="surface-muted mb-5 flex flex-col gap-4 p-4 md:flex-row md:items-center md:justify-between">
                <div>
                  <p className="font-semibold text-foreground">Spotify connection required</p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Your session expired or access is paused. Reconnect to restore playlist sync and save behavior.
                  </p>
                </div>
                <Button onClick={onReconnectSpotify} className="rounded-full bg-primary text-primary-foreground hover:opacity-90">
                  Reconnect Spotify
                </Button>
              </div>
            )}

            <div className="surface-muted p-4">
              <p className="font-semibold text-foreground">Access note</p>
              <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                Stash currently runs as a limited private beta while staying within Spotify development-access limits. This does not affect your saved history once access is granted.
              </p>
            </div>
          </section>

          <section className="surface-panel p-5 md:p-7 space-y-6">
            <div>
              <p className="text-[11px] uppercase tracking-[0.18em] font-bold text-muted-foreground">Preferences</p>
              <h2 className="mt-1 text-xl font-bold tracking-tight">Default behavior</h2>
            </div>

            <div className="flex items-center justify-between gap-6">
              <div className="space-y-1">
                <Label htmlFor="auto-add" className="font-semibold">Auto-add top match</Label>
                <p className="text-sm text-muted-foreground">Save the strongest match immediately for a faster stash flow.</p>
              </div>
              <Switch
                id="auto-add"
                checked={autoAddTopMatch}
                onCheckedChange={onToggleAutoAdd}
                className="data-[state=checked]:bg-primary"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="playlist" className="font-semibold">Default playlist</Label>
              <Select value={defaultPlaylistId} onValueChange={onPlaylistChange}>
                <SelectTrigger id="playlist" className="h-12 rounded-2xl bg-background/50">
                  <SelectValue placeholder="Select a playlist" />
                </SelectTrigger>
                <SelectContent>
                  {playlists.map((playlist) => (
                    <SelectItem key={playlist.id} value={playlist.id}>
                      {playlist.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center justify-between gap-6">
              <div className="space-y-1">
                <Label htmlFor="theme" className="font-semibold">Dark mode</Label>
                <p className="text-sm text-muted-foreground">Use the current premium dark theme across mobile and desktop.</p>
              </div>
              <Switch
                id="theme"
                checked={theme === 'dark'}
                onCheckedChange={(checked) => onToggleTheme(checked ? 'dark' : 'light')}
                className="data-[state=checked]:bg-primary"
              />
            </div>
          </section>

          <section className="surface-panel p-5 md:p-7 space-y-2">
            <div>
              <p className="text-[11px] uppercase tracking-[0.18em] font-bold text-muted-foreground">Support</p>
              <h2 className="mt-1 text-xl font-bold tracking-tight">Docs and feedback</h2>
            </div>

            {[
              { label: 'About Stash', icon: Info, color: 'text-sky-500', target: 'about' },
              { label: 'Help & Feedback', icon: HelpCircle, color: 'text-primary', target: 'help' },
              { label: 'Privacy Policy', icon: Shield, color: 'text-emerald-500', target: 'privacy' },
            ].map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.label}
                  onClick={() => (window as any).onNavigate?.(item.target)}
                  className="surface-muted flex w-full items-center justify-between p-3.5 text-left transition-colors hover:bg-card/80"
                >
                  <div className="flex items-center gap-3">
                    <div className={`grid h-10 w-10 place-items-center rounded-2xl bg-card/55 ${item.color}`}>
                      <Icon className="h-5 w-5" />
                    </div>
                    <span className="font-medium">{item.label}</span>
                  </div>
                  <ChevronRight className="h-4 w-4 text-muted-foreground" />
                </button>
              );
            })}
          </section>

          <div className="space-y-3">
            <Button
              onClick={onOpenStats}
              variant="outline"
              className="w-full h-12 rounded-2xl font-semibold"
            >
              View stats
            </Button>
            <Button
              onClick={onLogout}
              variant="destructive"
              className="w-full h-12 rounded-2xl font-semibold"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
