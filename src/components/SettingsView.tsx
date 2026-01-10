import { ArrowLeft, LogOut, Shield, Info, HelpCircle, ChevronRight, Radio } from 'lucide-react';
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
        <div className="min-h-screen bg-white dark:bg-black text-gray-900 dark:text-white">
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
                        <h1 className="text-xl font-semibold">Settings</h1>
                    </div>
                </div>
            </header>

            {/* Content */}
            <div className="container mx-auto px-4 md:px-6 py-8 max-w-2xl">
                {!hasSpotifyToken && (
                    <div className="mb-6 p-4 rounded-2xl bg-orange-500/10 border border-orange-500/20 flex flex-col md:flex-row items-center justify-between gap-4">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-orange-500/20 flex items-center justify-center">
                                <Radio className="w-5 h-5 text-orange-500" />
                            </div>
                            <div>
                                <p className="font-bold text-orange-500">Spotify Disconnected</p>
                                <p className="text-xs text-orange-500/70">Your session expired. Reconnect to access your playlists.</p>
                            </div>
                        </div>
                        <Button
                            onClick={onReconnectSpotify}
                            size="sm"
                            className="bg-orange-500 hover:bg-orange-600 text-white font-bold rounded-full px-6"
                        >
                            Reconnect
                        </Button>
                    </div>
                )}
                <div className="space-y-6">
                    {/* Account Section */}
                    <div className="glass-card rounded-2xl p-6 space-y-4">
                        <h2 className="text-lg font-semibold">Account</h2>
                        <div className="space-y-2">
                            <p className="text-sm text-gray-600 dark:text-gray-400">Name</p>
                            <p className="font-medium">{userName}</p>
                        </div>
                        <div className="space-y-2">
                            <p className="text-sm text-gray-600 dark:text-gray-400">Email</p>
                            <p className="font-medium">{userEmail}</p>
                        </div>
                    </div>

                    {/* Preferences Section */}
                    <div className="glass-card rounded-2xl p-6 space-y-6">
                        <h2 className="text-lg font-semibold">Preferences</h2>

                        {/* Auto-add Toggle */}
                        <div className="flex items-center justify-between">
                            <div className="space-y-1">
                                <Label htmlFor="auto-add">Auto-add top match</Label>
                                <p className="text-sm text-gray-600 dark:text-gray-400">
                                    Automatically save the best match without preview
                                </p>
                            </div>
                            <Switch
                                id="auto-add"
                                checked={autoAddTopMatch}
                                onCheckedChange={onToggleAutoAdd}
                                className="data-[state=checked]:bg-[#1DB954]"
                            />
                        </div>

                        {/* Default Playlist */}
                        <div className="space-y-2">
                            <Label htmlFor="playlist">Default Playlist</Label>
                            <Select value={defaultPlaylistId} onValueChange={onPlaylistChange}>
                                <SelectTrigger id="playlist">
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

                        {/* Theme Toggle */}
                        <div className="flex items-center justify-between">
                            <div className="space-y-1">
                                <Label htmlFor="theme">Dark Mode</Label>
                                <p className="text-sm text-gray-600 dark:text-gray-400">
                                    Toggle dark mode theme
                                </p>
                            </div>
                            <Switch
                                id="theme"
                                checked={theme === 'dark'}
                                onCheckedChange={(checked) => onToggleTheme(checked ? 'dark' : 'light')}
                                className="data-[state=checked]:bg-[#1DB954]"
                            />
                        </div>
                    </div>

                    {/* Navigation Section */}
                    <div className="glass-card rounded-2xl p-6 space-y-2">
                        <h2 className="text-lg font-semibold mb-2">Support</h2>
                        <button
                            onClick={() => (window as any).onNavigate?.('about')}
                            className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-gray-100 dark:hover:bg-white/5 transition-all text-left"
                        >
                            <div className="flex items-center gap-3">
                                <Info className="w-5 h-5 text-blue-500" />
                                <span>About Stash</span>
                            </div>
                            <ChevronRight className="w-4 h-4 text-gray-400" />
                        </button>
                        <button
                            onClick={() => (window as any).onNavigate?.('help')}
                            className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-gray-100 dark:hover:bg-white/5 transition-all text-left"
                        >
                            <div className="flex items-center gap-3">
                                <HelpCircle className="w-5 h-5 text-orange-500" />
                                <span>Help & Feedback</span>
                            </div>
                            <ChevronRight className="w-4 h-4 text-gray-400" />
                        </button>
                        <button
                            onClick={() => (window as any).onNavigate?.('privacy')}
                            className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-gray-100 dark:hover:bg-white/5 transition-all text-left"
                        >
                            <div className="flex items-center gap-3">
                                <Shield className="w-5 h-5 text-emerald-500" />
                                <span>Privacy Policy</span>
                            </div>
                            <ChevronRight className="w-4 h-4 text-gray-400" />
                        </button>
                    </div>

                    {/* Actions */}
                    <div className="space-y-4">
                        <Button
                            onClick={onOpenStats}
                            variant="outline"
                            className="w-full h-14 rounded-2xl border-gray-200 dark:border-white/10 hover:bg-gray-50 dark:hover:bg-white/5 font-semibold"
                        >
                            View Stats
                        </Button>
                        <Button
                            onClick={onLogout}
                            variant="destructive"
                            className="w-full h-14 rounded-2xl font-semibold"
                        >
                            <LogOut className="w-4 h-4 mr-2" />
                            Logout
                        </Button>
                    </div>

                    <div className="text-center py-8">
                        <p className="text-xs text-gray-500 font-mono">STASH v1.1.0 (Production)</p>
                    </div>
                </div>
            </div>
        </div>
    );
}
