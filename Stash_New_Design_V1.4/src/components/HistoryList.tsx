import { Trash2, Share2, ExternalLink } from 'lucide-react';
import { Button } from './ui/button';
import { Skeleton } from './ui/skeleton';
import { Badge } from './ui/badge';

interface Song {
  id: string;
  song: string;
  artist: string;
  source: string;
  album_art_url: string;
  preview_url?: string;
}

interface HistoryListProps {
  history: Song[];
  onDeleteSong: (id: string) => void;
  isLoading?: boolean;
}

export function HistoryList({ history, onDeleteSong, isLoading }: HistoryListProps) {
  if (isLoading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="flex gap-4 p-4 bg-white/5 backdrop-blur-sm rounded-xl border border-white/10">
            <Skeleton className="w-14 h-14 md:w-16 md:h-16 rounded-lg" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-5 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (history.length === 0) {
    return (
      <div className="text-center py-16 md:py-20">
        <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-white/5 flex items-center justify-center">
          <ExternalLink className="w-8 h-8 text-gray-600" />
        </div>
        <p className="text-gray-400">No songs stashed yet</p>
        <p className="text-gray-500 text-sm mt-2">Start by pasting a link above!</p>
      </div>
    );
  }

  const getSourceColor = (source: string) => {
    switch (source.toLowerCase()) {
      case 'youtube':
        return 'bg-red-500/20 text-red-400 border-red-500/30';
      case 'tiktok':
        return 'bg-pink-500/20 text-pink-400 border-pink-500/30';
      case 'instagram':
        return 'bg-purple-500/20 text-purple-400 border-purple-500/30';
      case 'twitter':
        return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
      default:
        return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    }
  };

  return (
    <div className="space-y-2 md:space-y-3">
      {history.map((song, index) => (
        <div
          key={song.id}
          className="group flex items-center gap-3 md:gap-4 p-3 md:p-4 bg-white/5 backdrop-blur-sm rounded-xl border border-white/10 hover:bg-white/10 hover:border-white/20 transition-all"
          style={{
            animationDelay: `${index * 50}ms`,
            animation: 'slideInUp 0.3s ease-out forwards',
          }}
        >
          <img
            src={song.album_art_url}
            alt={`${song.song} album art`}
            className="w-14 h-14 md:w-16 md:h-16 rounded-lg object-cover shadow-lg"
          />
          <div className="flex-1 min-w-0">
            <h4 className="truncate text-sm md:text-base">{song.song}</h4>
            <p className="text-gray-400 truncate text-sm">{song.artist}</p>
            <div className="flex items-center gap-2 mt-1.5">
              <Badge 
                variant="outline" 
                className={`text-xs border ${getSourceColor(song.source)}`}
              >
                {song.source}
              </Badge>
            </div>
          </div>
          <div className="flex items-center gap-1.5 md:gap-2">
            <Button
              variant="ghost"
              size="icon"
              className="opacity-30 pointer-events-none h-9 w-9 md:h-10 md:w-10"
              disabled
            >
              <Share2 className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onDeleteSong(song.id)}
              className="hover:bg-red-500/20 hover:text-red-400 transition-colors h-9 w-9 md:h-10 md:w-10"
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        </div>
      ))}
    </div>
  );
}