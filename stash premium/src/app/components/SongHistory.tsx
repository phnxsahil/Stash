import { Song } from '../types';
import { Trash2, Share2, Search, Calendar } from 'lucide-react';
import { useState, useEffect } from 'react';
import LoadingSkeleton from './LoadingSkeleton';

interface SongHistoryProps {
  history: Song[];
  onDelete: (index: number) => void;
}

export default function SongHistory({ history, onDelete }: SongHistoryProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredHistory, setFilteredHistory] = useState<Song[]>(history);

  useEffect(() => {
    // Simulate initial loading
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  // Filter history based on search query
  useEffect(() => {
    if (searchQuery.trim() === '') {
      setFilteredHistory(history);
    } else {
      const filtered = history.filter(
        (song) =>
          song.song.toLowerCase().includes(searchQuery.toLowerCase()) ||
          song.artist.toLowerCase().includes(searchQuery.toLowerCase()) ||
          song.source.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredHistory(filtered);
    }
  }, [searchQuery, history]);

  if (isLoading) {
    return (
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Recently Stashed</h2>
        <LoadingSkeleton />
      </div>
    );
  }

  if (history.length === 0) {
    return (
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Recently Stashed</h2>
        <div className="text-center py-16 space-y-6">
          {/* Empty State Illustration */}
          <div className="relative w-32 h-32 mx-auto">
            <div className="absolute inset-0 rounded-full bg-gradient-to-br from-[#1DB954]/20 to-purple-500/20 blur-xl"></div>
            <div className="relative w-32 h-32 rounded-full bg-gradient-to-br from-[#1DB954]/10 to-purple-500/10 border border-gray-700 flex items-center justify-center">
              <Search className="w-16 h-16 text-gray-600" />
            </div>
          </div>
          
          <div className="space-y-2">
            <p className="text-lg text-gray-400">No songs stashed yet</p>
            <p className="text-sm text-gray-500 max-w-md mx-auto">
              Paste a link from YouTube, TikTok, Instagram, or any music platform above to start building your collection
            </p>
          </div>
          
          <div className="flex flex-wrap justify-center gap-2 text-xs text-gray-600">
            <span className="px-3 py-1 rounded-full bg-gray-800/50 border border-gray-700">YouTube</span>
            <span className="px-3 py-1 rounded-full bg-gray-800/50 border border-gray-700">TikTok</span>
            <span className="px-3 py-1 rounded-full bg-gray-800/50 border border-gray-700">Instagram</span>
            <span className="px-3 py-1 rounded-full bg-gray-800/50 border border-gray-700">SoundCloud</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-4">
        <h2 className="text-xl font-semibold">Recently Stashed</h2>
        
        {/* Search Bar */}
        <div className="relative flex-1 max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search songs..."
            className="w-full pl-10 pr-4 py-2 rounded-lg bg-[#1D1D1F] border border-gray-700 focus:border-[#1DB954] focus:outline-none transition-colors text-sm placeholder:text-gray-500"
          />
        </div>

        {/* Date Filter (Disabled for now) */}
        <button
          disabled
          className="p-2 rounded-lg text-gray-600 cursor-not-allowed opacity-50 hidden md:block"
          title="Coming soon"
        >
          <Calendar className="w-5 h-5" />
        </button>
      </div>

      {/* Results count */}
      {searchQuery && (
        <p className="text-sm text-gray-400">
          Found {filteredHistory.length} {filteredHistory.length === 1 ? 'song' : 'songs'}
        </p>
      )}

      <div className="space-y-3">
        {filteredHistory.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <p className="text-sm">No songs match your search</p>
          </div>
        ) : (
          filteredHistory.map((song, index) => {
            // Find original index for delete functionality
            const originalIndex = history.findIndex((s) => s.id === song.id);
            
            return (
              <div
                key={`${song.id}-${index}`}
                className={`flex items-center gap-4 p-4 bg-[#1D1D1F] rounded-lg border border-gray-800 hover:border-gray-700 transition-colors group ${
                  index === 0 ? 'animate-fade-in' : ''
                }`}
              >
                {/* Album Art */}
                <img
                  src={song.album_art_url}
                  alt={`${song.song} album art`}
                  className="w-16 h-16 rounded object-cover flex-shrink-0"
                />

                {/* Song Info */}
                <div className="flex-1 min-w-0">
                  <h3 className="font-medium truncate">{song.song}</h3>
                  <p className="text-sm text-gray-400 truncate">{song.artist}</p>
                  <p className="text-xs text-gray-500 mt-1">
                    From {song.source}
                  </p>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2">
                  {/* Share Button (Disabled/Future Feature) */}
                  <button
                    disabled
                    className="p-2 rounded-lg text-gray-600 cursor-not-allowed opacity-50"
                    title="Coming soon"
                  >
                    <Share2 className="w-5 h-5" />
                  </button>

                  {/* Delete Button */}
                  <button
                    onClick={() => onDelete(originalIndex)}
                    className="p-2 rounded-lg hover:bg-red-500/10 text-gray-400 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100"
                    title="Remove from history"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}