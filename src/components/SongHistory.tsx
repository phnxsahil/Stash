import { Song } from '../types';
import { Trash2, Share2, Search, Calendar, Music } from 'lucide-react';
import { useState, useEffect } from 'react';
import LoadingSkeleton from './LoadingSkeleton';
import { motion, AnimatePresence } from 'framer-motion';

interface SongHistoryProps {
    history: Song[];
    onDelete: (id: string) => void;
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
                    (song.source && song.source.toLowerCase().includes(searchQuery.toLowerCase()))
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
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-4"
            >
                <h2 className="text-xl font-bold tracking-tight">Recently Stashed</h2>
                <div className="glass-card rounded-[2.5rem] p-10 md:p-16 text-center border-2 border-dashed border-gray-200 dark:border-white/5 bg-gray-50/50 dark:bg-white/[0.02] backdrop-blur-3xl overflow-hidden relative">
                    {/* Background Glow */}
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-[#1DB954]/10 rounded-full blur-[80px] pointer-events-none" />

                    <div className="relative z-10 space-y-8 max-w-lg mx-auto">
                        <div className="w-24 h-24 mx-auto rounded-3xl bg-gradient-to-br from-[#1DB954]/20 to-purple-500/20 flex items-center justify-center shadow-2xl">
                            <Music className="w-12 h-12 text-[#1DB954]" />
                        </div>

                        <div className="space-y-3">
                            <h3 className="text-3xl font-black text-gray-900 dark:text-white tracking-tight">Your library is waiting.</h3>
                            <p className="text-gray-600 dark:text-gray-400 text-lg font-medium leading-relaxed">
                                Start capturing the soundtrack of your internet life.
                            </p>
                        </div>

                        {/* Quick Guide */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-left pt-4">
                            {[
                                { step: '1', title: 'Find', desc: 'Copy a link from Reels, TikTok, or YouTube' },
                                { step: '2', title: 'Stash', desc: 'Paste it above and hit the magic button' }
                            ].map((item) => (
                                <div key={item.step} className="p-4 rounded-2xl bg-white/50 dark:bg-white/5 border border-gray-200 dark:border-white/10">
                                    <div className="flex items-center gap-3 mb-2">
                                        <span className="w-6 h-6 rounded-full bg-[#1DB954] text-black text-[10px] font-black flex items-center justify-center">
                                            {item.step}
                                        </span>
                                        <span className="font-bold text-sm text-gray-900 dark:text-white uppercase tracking-wider">{item.title}</span>
                                    </div>
                                    <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">{item.desc}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </motion.div>
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
                        className="w-full pl-10 pr-4 py-2 rounded-lg bg-[#1D1D1F] border border-gray-700 focus:border-[#1DB954] focus:outline-none transition-colors text-sm placeholder:text-gray-500 shadow-inner"
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

            <div className="grid grid-cols-1 gap-3">
                <AnimatePresence mode="popLayout">
                    {filteredHistory.length === 0 ? (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="text-center py-8 text-gray-500"
                        >
                            <p className="text-sm">No songs match your search</p>
                        </motion.div>
                    ) : (
                        filteredHistory.map((song, index) => (
                            <motion.div
                                key={`${song.id}-${song.created_at}`}
                                layout
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.95 }}
                                transition={{ duration: 0.3, delay: Math.min(index * 0.05, 0.3) }}
                                className="flex items-center gap-4 p-4 bg-[#1D1D1F] rounded-lg border border-gray-800 hover:border-gray-700 transition-all hover:bg-gray-800/30 shadow-sm"
                            >
                                {/* Album Art */}
                                <div className="relative flex-shrink-0">
                                    <img
                                        src={song.album_art_url}
                                        alt={`${song.song} album art`}
                                        className="w-16 h-16 rounded-md object-cover shadow-lg hover:scale-105 transition-transform duration-300"
                                    />
                                    <div className="absolute inset-0 rounded-md ring-1 ring-inset ring-white/10" />
                                </div>

                                {/* Song Info */}
                                <div className="flex-1 min-w-0">
                                    <h3 className="font-bold truncate text-[#E5E5E5] hover:text-[#1DB954] transition-colors">{song.song}</h3>
                                    <p className="text-sm text-gray-400 truncate font-medium">{song.artist}</p>
                                    <div className="flex items-center gap-2 mt-1">
                                        <span className="text-[10px] font-black uppercase tracking-widest text-gray-500 bg-gray-800/50 px-2 py-0.5 rounded">
                                            {song.source}
                                        </span>
                                        {song.genre && (
                                            <span className="text-[10px] font-black uppercase tracking-widest text-[#1DB954]/70">
                                                {song.genre}
                                            </span>
                                        )}
                                    </div>
                                </div>

                                {/* Actions */}
                                <div className="flex items-center gap-1">
                                    <button
                                        onClick={() => onDelete(song.id)}
                                        className="p-3 rounded-full hover:bg-red-500/10 text-red-500/70 hover:text-red-500 transition-all hover:scale-110 active:scale-95"
                                        title="Remove from Spotify and history"
                                    >
                                        <Trash2 className="w-5 h-5" />
                                    </button>
                                </div>
                            </motion.div>
                        ))
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
}
