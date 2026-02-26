import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from './ui/dialog';
import { Button } from './ui/button';
import { SongMatch } from '../lib/api';

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
    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>Select a Song</DialogTitle>
                    <DialogDescription>
                        We found multiple matches. Please select the correct song.
                    </DialogDescription>
                </DialogHeader>
                <div className="space-y-3 max-h-[400px] overflow-y-auto">
                    {matches.map((match) => (
                        <button
                            key={match.id}
                            onClick={() => onSelectSong(match)}
                            className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-gray-100 dark:hover:bg-white/10 transition-colors text-left"
                        >
                            <img
                                src={match.album_art_url}
                                alt={match.song}
                                className="w-12 h-12 rounded object-cover"
                            />
                            <div className="flex-1 min-w-0">
                                <p className="font-medium truncate">{match.song}</p>
                                <p className="text-sm text-gray-600 dark:text-gray-400 truncate">
                                    {match.artist}
                                </p>
                                {match.confidence && (
                                    <p className="text-xs text-[#1DB954]">
                                        {Math.round(match.confidence * 100)}% match
                                    </p>
                                )}
                            </div>
                        </button>
                    ))}
                </div>
                <div className="flex justify-end gap-2 mt-4">
                    <Button variant="outline" onClick={onClose}>
                        Cancel
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}
