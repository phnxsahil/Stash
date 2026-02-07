import { useState, useEffect } from 'react';
import { Song } from '../types';
import { Play, Pause, Check } from 'lucide-react';

interface ConfirmationModalProps {
  isOpen: boolean;
  matches: Song[];
  currentAudio: HTMLAudioElement | null;
  onClose: () => void;
  onSelect: (index: number) => void;
  onPreviewPlay: (previewUrl: string) => void;
}

export default function ConfirmationModal({
  isOpen,
  matches,
  currentAudio,
  onClose,
  onSelect,
  onPreviewPlay,
}: ConfirmationModalProps) {
  const [playingUrl, setPlayingUrl] = useState<string | null>(null);

  // Update playing state when audio changes
  useEffect(() => {
    if (currentAudio) {
      setPlayingUrl(currentAudio.src);
      
      const handleEnded = () => setPlayingUrl(null);
      currentAudio.addEventListener('ended', handleEnded);
      
      return () => {
        currentAudio.removeEventListener('ended', handleEnded);
      };
    } else {
      setPlayingUrl(null);
    }
  }, [currentAudio]);

  // Handle ESC key to close modal
  useEffect(() => {
    if (!isOpen) return;

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    // Prevent body scroll when modal is open
    document.body.style.overflow = 'hidden';

    document.addEventListener('keydown', handleEscape);
    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const handlePlayClick = (previewUrl: string) => {
    onPreviewPlay(previewUrl);
  };

  return (
    <div
      className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-backdrop-fade-in"
      onClick={handleBackdropClick}
    >
      <div className="bg-[#1D1D1F] border border-gray-700 rounded-2xl max-w-2xl w-full max-h-[80vh] overflow-hidden flex flex-col animate-scale-in">
        {/* Header */}
        <div className="p-6 border-b border-gray-800">
          <h2 className="text-2xl font-semibold">Is this your song?</h2>
          <p className="text-sm text-gray-400 mt-1">
            Select the correct match to add to your library
          </p>
        </div>

        {/* Song List */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="space-y-3">
            {matches.map((song, index) => {
              const isPlaying = playingUrl === song.preview_url;
              
              return (
                <div
                  key={`${song.id}-${index}`}
                  className="flex items-center gap-4 p-4 bg-[#121212] rounded-lg border border-gray-800 hover:border-gray-700 transition-colors"
                >
                  {/* Album Art */}
                  <img
                    src={song.album_art_url}
                    alt={`${song.song} album art`}
                    className="w-20 h-20 rounded object-cover flex-shrink-0"
                  />

                  {/* Song Info */}
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium truncate text-lg">{song.song}</h3>
                    <p className="text-sm text-gray-400 truncate">{song.artist}</p>
                    <p className="text-xs text-gray-500 mt-1">{song.source}</p>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2">
                    {/* Play/Pause Button */}
                    {song.preview_url && (
                      <button
                        onClick={() => handlePlayClick(song.preview_url!)}
                        className="p-3 rounded-full bg-gray-800 hover:bg-gray-700 transition-colors"
                        title={isPlaying ? 'Pause preview' : 'Play preview'}
                      >
                        {isPlaying ? (
                          <Pause className="w-5 h-5" />
                        ) : (
                          <Play className="w-5 h-5" />
                        )}
                      </button>
                    )}

                    {/* Select Button */}
                    <button
                      onClick={() => onSelect(index)}
                      className="px-6 py-3 rounded-lg bg-[#1DB954] hover:bg-[#1ed760] transition-colors font-medium flex items-center gap-2"
                    >
                      <Check className="w-5 h-5" />
                      Select
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-6 py-3 rounded-lg bg-gray-800 hover:bg-gray-700 transition-colors"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}