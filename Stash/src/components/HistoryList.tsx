import { Trash2 } from 'lucide-react';
import { Button } from './ui/button';
import { Song } from '../lib/api';

interface HistoryListProps {
    history: Song[];
    onDeleteSong: (id: string) => void;
}

export function HistoryList({ history, onDeleteSong }: HistoryListProps) {
    if (history.length === 0) {
        return (
            <div className="glass-card rounded-2xl p-12 text-center">
                <p className="text-gray-500 dark:text-gray-400">
                    No songs stashed yet. Start by pasting a link above!
                </p>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            <h2 className="text-xl font-semibold mb-4">Your Stash</h2>
            <div className="space-y-3">
                {history.map((song) => (
                    <div
                        key={song.id}
                        className="glass-card rounded-xl p-4 flex items-center gap-4 hover:bg-white/10 transition-colors group"
                    >
                        <img
                            src={song.album_art_url}
                            alt={song.song}
                            className="w-14 h-14 rounded-lg object-cover"
                        />
                        <div className="flex-1 min-w-0">
                            <p className="font-medium truncate">{song.song}</p>
                            <p className="text-sm text-gray-600 dark:text-gray-400 truncate">
                                {song.artist}
                            </p>
                            <p className="text-xs text-gray-500 dark:text-gray-500">
                                {song.source}
                            </p>
                        </div>
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => onDeleteSong(song.id)}
                            className="opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-500/10 hover:text-red-500"
                        >
                            <Trash2 className="w-4 h-4" />
                        </Button>
                    </div>
                ))}
            </div>
        </div>
    );
}
