import { useState, useRef, useEffect } from 'react';
import { Play, Pause, CheckCircle2 } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from './ui/dialog';
import { Button } from './ui/button';
import { Progress } from './ui/progress';

interface SongMatch {
  id: string;
  song: string;
  artist: string;
  album_art_url: string;
  preview_url?: string;
}

interface ConfirmationModalProps {
  isOpen: boolean;
  matches: SongMatch[];
  onClose: () => void;
  onSelectSong: (song: SongMatch) => void;
}

export function ConfirmationModal({
  isOpen,
  matches,
  onClose,
  onSelectSong,
}: ConfirmationModalProps) {
  const [playingId, setPlayingId] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    // Cleanup audio when modal closes
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
      setPlayingId(null);
      setProgress(0);
    };
  }, [isOpen]);

  const handlePlayPause = (match: SongMatch) => {
    if (!match.preview_url) return;

    // If clicking the same song that's playing, pause it
    if (playingId === match.id) {
      audioRef.current?.pause();
      setPlayingId(null);
      return;
    }

    // Stop current audio if any
    if (audioRef.current) {
      audioRef.current.pause();
    }

    // Play new audio
    const audio = new Audio(match.preview_url);
    audioRef.current = audio;
    setPlayingId(match.id);
    setProgress(0);

    audio.play();

    // Update progress
    audio.ontimeupdate = () => {
      const value = (audio.currentTime / audio.duration) * 100;
      setProgress(value);
    };

    // Reset playing state when audio ends
    audio.onended = () => {
      setPlayingId(null);
      setProgress(0);
    };
  };

  const handleSelect = (match: SongMatch) => {
    // Stop audio
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }
    setPlayingId(null);
    setProgress(0);
    onSelectSong(match);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-black/95 backdrop-blur-xl text-white border-white/20 max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-[#1DB954]" />
            Is this your song?
          </DialogTitle>
          <DialogDescription className="text-gray-400">
            Preview and select the correct match from the results below
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-2 md:space-y-3 mt-4 max-h-[60vh] overflow-y-auto pr-2 custom-scrollbar">
          {matches.map((match, index) => (
            <div
              key={match.id}
              className="group flex flex-col gap-3 p-4 bg-white/5 backdrop-blur-sm rounded-xl border border-white/10 hover:bg-white/10 hover:border-[#1DB954]/50 transition-all"
              style={{
                animationDelay: `${index * 100}ms`,
                animation: 'slideInUp 0.3s ease-out forwards',
              }}
            >
              <div className="flex items-center gap-3 md:gap-4">
                <img
                  src={match.album_art_url}
                  alt={`${match.song} album art`}
                  className="w-14 h-14 md:w-16 md:h-16 rounded-lg object-cover shadow-lg"
                />
                <div className="flex-1 min-w-0">
                  <h4 className="truncate text-sm md:text-base">{match.song}</h4>
                  <p className="text-gray-400 truncate text-sm">{match.artist}</p>
                </div>
                <div className="flex items-center gap-2">
                  {match.preview_url && (
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => handlePlayPause(match)}
                      className="bg-white/10 border-white/20 hover:bg-white/20 hover:border-[#1DB954] transition-all h-10 w-10"
                    >
                      {playingId === match.id ? (
                        <Pause className="w-4 h-4 text-[#1DB954]" />
                      ) : (
                        <Play className="w-4 h-4" />
                      )}
                    </Button>
                  )}
                  <Button
                    onClick={() => handleSelect(match)}
                    className="bg-[#1DB954] hover:bg-[#1ed760] text-black shadow-lg shadow-[#1DB954]/20 hover:shadow-[#1DB954]/40 transition-all"
                  >
                    Select
                  </Button>
                </div>
              </div>
              {playingId === match.id && (
                <Progress 
                  value={progress} 
                  className="h-1 bg-white/10"
                />
              )}
            </div>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}