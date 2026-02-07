import { ArrowLeft, User, Music2, Link2, LogOut, Trash2, BarChart3, HelpCircle, FileText, Sun, Moon } from 'lucide-react';
import { Button } from './ui/button';
import { Switch } from './ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Label } from './ui/label';
import { Avatar, AvatarFallback } from './ui/avatar';
import { Badge } from './ui/badge';
import { Separator } from './ui/separator';

interface Playlist {
  id: string;
  name: string;
}

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
}: SettingsViewProps) {
  return (
    <div className="min-h-screen bg-white dark:bg-black text-gray-900 dark:text-white pb-safe noise-texture">
      {/* Header */}
      <header className="sticky top-0 z-40 backdrop-blur-xl bg-white/80 dark:bg-black/80 border-b border-gray-200 dark:border-white/10">
        <div className="container mx-auto px-4 md:px-6 py-4">
          <div className="flex items-center gap-4">
            <Button
              onClick={onBack}
              variant="ghost"
              size="icon"
              className="hover:bg-gray-100 dark:hover:bg-white/10"
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <h1 style={{ fontWeight: 600 }}>Settings</h1>
          </div>
        </div>
      </header>

      {/* Content */}
      <div className="container mx-auto px-4 md:px-6 py-8 max-w-3xl space-y-8">
        {/* Profile Section */}
        <section className="glass-light rounded-2xl p-6 shadow-lg">
          <div className="flex items-center gap-2 mb-4">
            <User className="w-5 h-5 text-[#1DB954]" />
            <h2 style={{ fontWeight: 600 }}>Profile</h2>
          </div>
          <div className="flex items-center gap-4">
            <Avatar className="w-16 h-16">
              <AvatarFallback className="bg-[#1DB954]/20 text-[#1DB954] text-xl">
                {userName.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <p style={{ fontWeight: 500 }}>{userName}</p>
              <p className="text-gray-600 dark:text-gray-400 text-sm">{userEmail}</p>
              <Badge className="mt-2 bg-[#1DB954] text-black hover:bg-[#1ed760]">
                <Music2 className="w-3 h-3 mr-1" />
                Connected to Spotify
              </Badge>
            </div>
          </div>
        </section>

        {/* Stash Preferences */}
        <section className="glass-light rounded-2xl p-6 shadow-lg space-y-6">
          <div className="flex items-center gap-2 mb-4">
            <Music2 className="w-5 h-5 text-[#1DB954]" />
            <h2 style={{ fontWeight: 600 }}>Stash Preferences</h2>
          </div>

          {/* Auto-add Toggle */}
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              <Label htmlFor="settings-auto-add">Auto-add top match</Label>
              <p className="text-gray-600 dark:text-gray-400 text-sm mt-1">
                Automatically add the best match without confirmation
              </p>
            </div>
            <Switch
              id="settings-auto-add"
              checked={autoAddTopMatch}
              onCheckedChange={onToggleAutoAdd}
              className="data-[state=checked]:bg-[#1DB954] mt-1"
            />
          </div>

          <Separator className="bg-gray-200 dark:bg-white/10" />

          {/* Default Playlist */}
          <div className="space-y-3">
            <Label htmlFor="playlist-selector">Default Playlist</Label>
            <p className="text-gray-600 dark:text-gray-400 text-sm">
              Choose where your stashed songs will be saved
            </p>
            <Select value={defaultPlaylistId} onValueChange={onPlaylistChange}>
              <SelectTrigger 
                id="playlist-selector"
                className="w-full bg-white dark:bg-white/10 border-gray-300 dark:border-white/20 h-12 rounded-xl"
              >
                <SelectValue placeholder="Select a playlist" />
              </SelectTrigger>
              <SelectContent className="bg-white dark:bg-black border-gray-200 dark:border-white/10">
                {playlists.map((playlist) => (
                  <SelectItem key={playlist.id} value={playlist.id}>
                    {playlist.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </section>

        {/* Appearance */}
        <section className="glass-light rounded-2xl p-6 shadow-lg">
          <div className="flex items-center gap-2 mb-4">
            {theme === 'dark' ? (
              <Moon className="w-5 h-5 text-[#1DB954]" />
            ) : (
              <Sun className="w-5 h-5 text-[#1DB954]" />
            )}
            <h2 style={{ fontWeight: 600 }}>Appearance</h2>
          </div>

          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              <Label htmlFor="settings-theme">Theme</Label>
              <p className="text-gray-600 dark:text-gray-400 text-sm mt-1">
                {theme === 'dark' ? 'Dark mode enabled' : 'Light mode enabled'}
              </p>
            </div>
            <Switch
              id="settings-theme"
              checked={theme === 'dark'}
              onCheckedChange={(checked) => onToggleTheme(checked ? 'dark' : 'light')}
              className="data-[state=checked]:bg-[#1DB954] mt-1"
            />
          </div>
        </section>

        {/* Connected Services */}
        <section className="glass-light rounded-2xl p-6 shadow-lg">
          <div className="flex items-center gap-2 mb-4">
            <Link2 className="w-5 h-5 text-[#1DB954]" />
            <h2 style={{ fontWeight: 600 }}>Connected Services</h2>
          </div>

          <div className="space-y-4">
            {/* Spotify */}
            <div className="flex items-center justify-between p-4 rounded-xl bg-gray-100/50 dark:bg-white/5 border border-gray-200 dark:border-white/10">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-[#1DB954] rounded-lg flex items-center justify-center">
                  <svg className="w-5 h-5 text-black" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z"/>
                  </svg>
                </div>
                <div>
                  <p style={{ fontWeight: 500 }}>Spotify</p>
                  <p className="text-gray-600 dark:text-gray-400 text-sm">{userName}</p>
                </div>
              </div>
              <Badge className="bg-[#1DB954]/20 text-[#1DB954] border-[#1DB954]/30">
                Connected
              </Badge>
            </div>

            {/* Apple Music - Coming Soon */}
            <Button
              disabled
              variant="outline"
              className="w-full justify-start p-4 h-auto bg-gray-100/50 dark:bg-white/5 border border-gray-200 dark:border-white/10 opacity-50 cursor-not-allowed"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-pink-500 to-purple-500 rounded-lg flex items-center justify-center">
                  <svg className="w-6 h-6 text-white" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M23.997 6.124c0-.738-.065-1.47-.24-2.19-.317-1.31-1.062-2.31-2.18-3.043C21.003.517 20.373.285 19.7.164c-.517-.093-1.038-.135-1.564-.15-.04-.003-.083-.01-.124-.013H5.988c-.152.01-.303.017-.455.026C4.786.07 4.043.15 3.34.428 2.004.958 1.04 1.88.475 3.208c-.192.448-.292.925-.363 1.408a10.61 10.61 0 00-.111 1.628v11.315c0 .452.037.901.12 1.344.17 .914.505 1.754 1.097 2.478.723.883 1.636 1.476 2.733 1.79.476.137.966.207 1.46.239.29.019.58.024.87.024h12.278c.26 0 .521-.005.781-.024.927-.068 1.8-.306 2.604-.806 1.03-.64 1.76-1.542 2.177-2.689.2-.553.293-1.123.334-1.7.04-.569.052-1.14.051-1.711z"/></svg>
                </div>
                <div className="text-left">
                  <p style={{ fontWeight: 500 }}>Apple Music</p>
                  <p className="text-gray-600 dark:text-gray-400 text-sm">Coming Soon 🍎</p>
                </div>
              </div>
            </Button>
          </div>
        </section>

        {/* Other */}
        <section className="glass-light rounded-2xl p-6 shadow-lg">
          <div className="flex items-center gap-2 mb-4">
            <HelpCircle className="w-5 h-5 text-[#1DB954]" />
            <h2 style={{ fontWeight: 600 }}>Other</h2>
          </div>

          <div className="space-y-3">
            {/* Stats - Disabled */}
            <Button
              disabled
              variant="ghost"
              className="w-full justify-start gap-3 text-gray-600 dark:text-gray-400 opacity-50 cursor-not-allowed"
            >
              <BarChart3 className="w-5 h-5" />
              View Your Stash Stats
            </Button>

            {/* Support */}
            <Button
              variant="ghost"
              className="w-full justify-start gap-3 hover:bg-gray-100 dark:hover:bg-white/10"
              onClick={() => window.open('mailto:support@stash.app', '_blank')}
            >
              <HelpCircle className="w-5 h-5" />
              Help & Feedback
            </Button>

            {/* Legal */}
            <Button
              variant="ghost"
              className="w-full justify-start gap-3 hover:bg-gray-100 dark:hover:bg-white/10"
              onClick={() => alert('Privacy Policy & Terms - Coming Soon')}
            >
              <FileText className="w-5 h-5" />
              Privacy & Terms
            </Button>
          </div>
        </section>

        {/* Account Actions */}
        <section className="glass-light rounded-2xl p-6 shadow-lg space-y-3">
          <Button
            onClick={onLogout}
            variant="outline"
            className="w-full justify-center gap-2 border-red-500/30 text-red-500 hover:bg-red-500/10"
          >
            <LogOut className="w-5 h-5" />
            Logout
          </Button>

          <Button
            disabled
            variant="outline"
            className="w-full justify-center gap-2 border-red-500/20 text-red-500 opacity-50 cursor-not-allowed"
          >
            <Trash2 className="w-5 h-5" />
            Delete Account (Future)
          </Button>
        </section>

        {/* Version Info */}
        <div className="text-center text-gray-600 dark:text-gray-400 text-sm pb-8">
          Stash v1.0.0 (MVP)
        </div>
      </div>
    </div>
  );
}