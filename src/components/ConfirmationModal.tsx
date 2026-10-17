import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from './ui/dialog';
import { Button } from './ui/button';
import { SongMatch } from '../lib/api';
import { Check } from './stitch/StashIcons';
import { TrackArtwork } from './TrackArtwork';

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
            <DialogContent className="stitch-theme st-match confirmation-dialog sm:max-w-md p-0 overflow-hidden border-border/40 bg-background/95 backdrop-blur-2xl rounded-3xl shadow-2xl">
                <div className="p-6 md:p-8">
                    <DialogHeader className="mb-6">
                        <DialogTitle className="text-2xl font-bold tracking-tight">Select the best match</DialogTitle>
                        <DialogDescription className="text-muted-foreground font-medium">
                            Multiple tracks identified. Pick the one you want to stash.
                        </DialogDescription>
                    </DialogHeader>
                    
                    <div className="space-y-3 max-h-[420px] overflow-y-auto pr-2 custom-scrollbar">
                        {matches.map((match) => (
                            <button
                                key={match.id}
                                onClick={() => onSelectSong(match)}
                                className="match-choice"
                            >
                                <TrackArtwork url={match.album_art_url} />
                                <div className="flex-1 min-w-0">
                                    <p className="font-bold text-base truncate tracking-tight">{match.song}</p>
                                    <p className="text-sm text-muted-foreground font-semibold truncate mt-0.5">
                                        {match.artist}
                                    </p>
                                    {match.confidence && (
                                        <div className="inline-flex items-center gap-1 mt-2 px-2 py-0.5 rounded-lg bg-primary/10 border border-primary/20">
                                            <Check className="w-3 h-3 text-primary" />
                                            <p className="text-[10px] font-bold text-primary uppercase tracking-wider">
                                                {Math.round(match.confidence * 100)}% match
                                            </p>
                                        </div>
                                    )}
                                </div>
                            </button>
                        ))}
                    </div>
                    
                    <div className="flex justify-end mt-8">
                        <Button 
                            variant="ghost" 
                            onClick={onClose}
                            className="rounded-full font-bold px-8 hover:bg-muted/50"
                        >
                            Cancel
                        </Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
