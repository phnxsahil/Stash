import { Sun, Moon, Music, ChevronDown } from 'lucide-react';
import { useState } from 'react';
import { useTheme } from '../contexts/ThemeContext';

interface SettingsViewProps {
  autoAddEnabled: boolean;
  onToggleAutoAdd: (enabled: boolean) => void;
}

export default function SettingsView({
  autoAddEnabled,
  onToggleAutoAdd,
}: SettingsViewProps) {
  const { theme, toggleTheme } = useTheme();
  const [selectedPlaylist, setSelectedPlaylist] = useState('smart-sort');

  const playlists = [
    { id: 'smart-sort', name: 'Smart Sort (Recommended)', disabled: false },
    { id: 'liked-songs', name: 'Liked Songs', disabled: false },
    { id: 'discover-weekly', name: 'Discover Weekly', disabled: true },
    { id: 'custom-playlist', name: 'My Stash Playlist', disabled: true },
  ];

  return (
    <div className="min-h-screen px-6 py-8 md:py-12">
      <div className="max-w-2xl mx-auto space-y-8">
        <h1 className="text-3xl md:text-4xl font-semibold">Settings</h1>

        {/* Appearance Section */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Appearance</h2>
          
          <div className="bg-[#1D1D1F] border border-gray-800 rounded-2xl p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                {theme === 'dark' ? (
                  <Moon className="w-6 h-6 text-[#1DB954]" />
                ) : (
                  <Sun className="w-6 h-6 text-[#1DB954]" />
                )}
                <div>
                  <h3 className="font-medium">Theme</h3>
                  <p className="text-sm text-gray-400">
                    {theme === 'dark' ? 'Dark mode' : 'Light mode'}
                  </p>
                </div>
              </div>
              
              {/* Desktop Toggle */}
              <div className="hidden md:block">
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={theme === 'dark'}
                    onChange={toggleTheme}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#1DB954]"></div>
                </label>
              </div>
            </div>

            {/* Mobile Full-Width Toggle */}
            <button
              onClick={toggleTheme}
              className="md:hidden w-full mt-4 py-3 px-4 rounded-lg bg-gray-800 hover:bg-gray-700 transition-colors text-sm font-medium"
            >
              Switch to {theme === 'dark' ? 'Light' : 'Dark'} Mode
            </button>
          </div>
        </div>

        {/* Behavior Section */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Behavior</h2>
          
          <div className="bg-[#1D1D1F] border border-gray-800 rounded-2xl p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Music className="w-6 h-6 text-[#1DB954]" />
                <div>
                  <h3 className="font-medium">Auto-add Top Match</h3>
                  <p className="text-sm text-gray-400">
                    Skip preview and automatically add best match
                  </p>
                </div>
              </div>
              
              {/* Desktop Toggle */}
              <div className="hidden md:block">
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={autoAddEnabled}
                    onChange={(e) => onToggleAutoAdd(e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#1DB954]"></div>
                </label>
              </div>
            </div>

            {/* Mobile Full-Width Toggle */}
            <button
              onClick={() => onToggleAutoAdd(!autoAddEnabled)}
              className="md:hidden w-full mt-4 py-3 px-4 rounded-lg bg-gray-800 hover:bg-gray-700 transition-colors text-sm font-medium"
            >
              {autoAddEnabled ? 'Disable' : 'Enable'} Auto-add
            </button>
          </div>
        </div>

        {/* Spotify Integration Section */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Spotify Integration</h2>
          
          <div className="bg-[#1D1D1F] border border-gray-800 rounded-2xl p-6 space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">
                Default Playlist
              </label>
              <p className="text-sm text-gray-400 mb-4">
                Choose where your stashed songs should be saved
              </p>
              
              <div className="relative">
                <select
                  value={selectedPlaylist}
                  onChange={(e) => setSelectedPlaylist(e.target.value)}
                  className="w-full appearance-none px-4 py-3 pr-10 rounded-lg bg-gray-800 border border-gray-700 focus:border-[#1DB954] focus:outline-none transition-colors cursor-pointer"
                >
                  {playlists.map((playlist) => (
                    <option
                      key={playlist.id}
                      value={playlist.id}
                      disabled={playlist.disabled}
                    >
                      {playlist.name}
                      {playlist.disabled ? ' (Coming Soon)' : ''}
                    </option>
                  ))}
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
              </div>
            </div>

            <div className="pt-4 border-t border-gray-700">
              <button className="text-sm text-[#1DB954] hover:text-[#1ed760] transition-colors">
                Reconnect Spotify Account
              </button>
            </div>
          </div>
        </div>

        {/* About Section */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">About</h2>
          
          <div className="bg-[#1D1D1F] border border-gray-800 rounded-2xl p-6 space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-400">Version</span>
              <span className="text-sm font-medium">1.0.0 (Beta)</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-400">Build</span>
              <span className="text-sm font-medium">2025.12.31</span>
            </div>
            <div className="pt-3 border-t border-gray-700 space-y-2">
              <button className="text-sm text-gray-400 hover:text-white transition-colors block w-full text-left">
                Privacy Policy
              </button>
              <button className="text-sm text-gray-400 hover:text-white transition-colors block w-full text-left">
                Terms of Service
              </button>
              <button className="text-sm text-gray-400 hover:text-white transition-colors block w-full text-left">
                Send Feedback
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}