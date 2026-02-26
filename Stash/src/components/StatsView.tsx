import { motion } from 'framer-motion';
import { TrendingUp, Trophy, Music2, Sparkles, Music, Layers, Activity } from 'lucide-react';
import { InstagramExport } from './InstagramExport';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { useEffect, useState } from 'react';
import { Song, api } from '../lib/api';

interface StatsViewProps {
  history: Song[];
  userName: string;
  songsThisWeek: number;
  streak: number;
}

const COLORS = ['#1DB954', '#1ed760', '#22c55e', '#4ade80', '#86efac'];

export function StatsView({ history, userName, songsThisWeek, streak }: StatsViewProps) {
  const [vibe, setVibe] = useState<string>("Analyzing your vibe...");

  // Generate Genre Data
  const genreCounts: Record<string, number> = {};
  history.forEach(song => {
    const g = song.genre || 'Unknown';
    genreCounts[g] = (genreCounts[g] || 0) + 1;
  });

  const genreData = Object.entries(genreCounts)
    .map(([name, value], idx) => ({
      name,
      value: Math.round((value / history.length) * 100),
      count: value,
      color: COLORS[idx % COLORS.length]
    }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);

  // Generate Top Artists Data
  const artistCounts: Record<string, { count: number, art: string }> = {};
  history.forEach(song => {
    if (!artistCounts[song.artist]) {
      artistCounts[song.artist] = { count: 0, art: song.album_art_url };
    }
    artistCounts[song.artist].count += 1;
  });

  const topArtists = Object.entries(artistCounts)
    .map(([name, data]) => ({
      name,
      count: data.count,
      art: data.art,
      image: data.art
    }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 3);

  // Achievements
  const achievements = [
    { title: 'First Stash', target: 1, current: history.length, icon: Sparkles },
    { title: 'Collector', target: 10, current: history.length, icon: Music },
    { title: 'Music Lover', target: 25, current: history.length, icon: Trophy },
  ];

  useEffect(() => {
    if (history.length > 0) {
      api.getVibeAnalysis(history)
        .then(setVibe)
        .catch(() => setVibe("Eclectic & Curious"));
    } else {
      setVibe("No songs yet. Start stashing!");
    }
  }, [history]);

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-20">

      {/* Vibe Header with Animated Orbs (v1.4 Restoration) */}
      <div className="relative overflow-hidden rounded-[2.5rem] border border-gray-200 dark:border-white/10 shadow-2xl bg-white/50 dark:bg-zinc-900/40 backdrop-blur-3xl p-10 md:p-16 text-center">
        {/* Animated Background Orbs */}
        {[...Array(3)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-64 h-64 rounded-full blur-[100px] opacity-20 pointer-events-none"
            style={{
              background: i === 0 ? '#1DB954' : i === 1 ? '#9333EA' : '#3B82F6',
              left: `${20 + i * 30}%`,
              top: `${10 + i * 20}%`,
            }}
            animate={{
              y: [0, -30, 0],
              x: [0, 20, 0],
              scale: [1, 1.2, 1],
            }}
            transition={{
              duration: 5 + i * 2,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
          />
        ))}

        <div className="relative z-10 space-y-6">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-gray-100 dark:bg-white/5 border border-gray-200 dark:border-white/10 backdrop-blur-md">
            <Sparkles className="w-3.5 h-3.5 text-[#1DB954]" />
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-[#1DB954]">Your Musical Identity</span>
          </div>

          <h2 className="text-5xl md:text-7xl font-black text-gray-900 dark:text-white leading-tight tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-gray-900 via-gray-800 to-gray-500 dark:from-white dark:via-white dark:to-white/60">
            {vibe}
          </h2>

          <p className="text-gray-600 dark:text-gray-400 text-lg md:text-xl font-medium max-w-2xl mx-auto leading-relaxed">
            A sonic fingerprint of your latest discoveries. You're currently leaning into <span className="text-gray-900 dark:text-white">{genreData[0]?.name || 'new sounds'}</span>.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Genre Architecture - v1.4 Restoration */}
        <div className="lg:col-span-2 glass-card rounded-[2rem] p-8 border border-gray-200 dark:border-white/10 relative overflow-hidden bg-white/50 dark:bg-zinc-900/40 backdrop-blur-xl">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-gray-100 dark:bg-white/5 border border-gray-200 dark:border-white/10 flex items-center justify-center">
                <Layers className="w-5 h-5 text-[#1DB954]" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white tracking-tight">Genre Architecture</h3>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-8 items-center">
            <div className="h-[240px] w-full relative">
              {genreData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={genreData}
                      cx="50%"
                      cy="50%"
                      innerRadius={70}
                      outerRadius={95}
                      paddingAngle={4}
                      dataKey="count"
                      stroke="none"
                    >
                      {genreData.map((_, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} className="focus:outline-none" />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'rgba(24, 24, 27, 0.95)',
                        borderRadius: '16px',
                        border: '1px solid rgba(255,255,255,0.1)',
                        backdropFilter: 'blur(10px)',
                        boxShadow: '0 10px 30px rgba(0,0,0,0.5)'
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex items-center justify-center text-gray-500 text-sm font-medium">No data yet</div>
              )}
              {/* Center Label */}
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <span className="text-3xl font-black text-gray-900 dark:text-white">{genreData.length}</span>
                <span className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">Genres</span>
              </div>
            </div>

            <div className="space-y-4">
              {genreData.map((genre, idx) => (
                <div key={genre.name} className="flex items-center justify-between group cursor-default">
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 rounded-full" style={{ backgroundColor: COLORS[idx % COLORS.length] }} />
                    <span className="text-sm font-bold text-gray-500 dark:text-gray-400 group-hover:text-gray-900 dark:group-hover:text-white transition-colors">{genre.name}</span>
                  </div>
                  <span className="text-sm font-mono text-gray-600 dark:text-gray-500">{genre.value}%</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Activity Board - v1.4 Restoration */}
        <div className="space-y-6">
          <div className="glass-card rounded-[2rem] p-8 border border-gray-200 dark:border-white/10 relative bg-white/50 dark:bg-zinc-900/40 backdrop-blur-xl border-l-4 border-l-[#1DB954]">
            <div className="flex items-center justify-between mb-6">
              <div className="w-12 h-12 rounded-2xl bg-[#1DB954]/20 flex items-center justify-center shadow-lg shadow-[#1DB954]/10">
                <Activity className="w-6 h-6 text-[#1DB954]" />
              </div>
              <div className="text-right">
                <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest leading-none mb-1">Activity</p>
                <p className="text-sm font-bold text-gray-900 dark:text-white">This Week</p>
              </div>
            </div>

            <div className="flex items-baseline gap-2 mb-4">
              <span className="text-6xl font-black text-gray-900 dark:text-white tracking-tighter">{songsThisWeek}</span>
              <span className="text-xl font-bold text-[#1DB954]">songs</span>
            </div>

            <div className="flex items-center gap-2 text-emerald-400 text-xs font-bold bg-emerald-400/10 w-fit px-3 py-1 rounded-full border border-emerald-400/20">
              <TrendingUp className="w-3.5 h-3.5" />
              <span className="uppercase tracking-wider">Trending Up</span>
            </div>
          </div>

          <div className="glass-card rounded-[2rem] p-8 border border-gray-200 dark:border-white/10 bg-white/50 dark:bg-zinc-900/40 backdrop-blur-xl border-l-4 border-l-orange-500">
            <div className="flex items-center justify-between mb-6">
              <div className="w-12 h-12 rounded-2xl bg-orange-500/20 flex items-center justify-center shadow-lg shadow-orange-500/10">
                <Trophy className="w-6 h-6 text-orange-400" />
              </div>
              <div className="text-right">
                <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest leading-none mb-1">Streak</p>
                <p className="text-sm font-bold text-gray-900 dark:text-white">Keep going!</p>
              </div>
            </div>
            <div className="flex items-baseline gap-2">
              <p className="text-6xl font-black text-gray-900 dark:text-white tracking-tighter">{streak}</p>
              <span className="text-xl font-bold text-orange-400 uppercase tracking-wider">Days</span>
            </div>
          </div>
        </div>

        {/* Top Artists & Achievements Row */}
        <div className="lg:col-span-3 grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Top Artists - v1.4 Restored Card */}
          <div className="glass-card rounded-[2rem] p-8 border border-gray-200 dark:border-white/10 bg-white/50 dark:bg-zinc-900/40 backdrop-blur-xl">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-8 flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-purple-500/20 flex items-center justify-center">
                <Music2 className="w-4 h-4 text-purple-400" />
              </div>
              Top Artists
            </h3>
            <div className="space-y-4">
              {topArtists.map((artist, i) => (
                <motion.div
                  key={artist.name}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.1 }}
                  className="flex items-center justify-between p-4 rounded-2xl bg-gray-50 dark:bg-white/5 hover:bg-gray-100 dark:hover:bg-white/10 transition-all group"
                >
                  <div className="flex items-center gap-5">
                    <span className="text-lg font-black text-gray-400 group-hover:text-[#1DB954] w-6 transition-colors font-mono">#{i + 1}</span>
                    <div className="relative">
                      <img src={artist.art} alt={artist.name} className="w-14 h-14 rounded-2xl object-cover shadow-2xl group-hover:scale-105 transition-transform" />
                      <div className="absolute inset-0 rounded-2xl ring-1 ring-inset ring-black/10 dark:ring-white/10" />
                    </div>
                    <div>
                      <span className="font-bold text-gray-900 dark:text-white group-hover:text-[#1DB954] transition-colors">{artist.name}</span>
                      <p className="text-xs text-gray-500 font-medium mt-0.5">{artist.count} stashes</p>
                    </div>
                  </div>
                  <div className="w-8 h-8 rounded-full bg-gray-200 dark:bg-white/5 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <TrendingUp className="w-3.5 h-3.5 text-[#1DB954]" />
                  </div>
                </motion.div>
              ))}
              {topArtists.length === 0 && (
                <div className="py-12 text-center space-y-3">
                  <div className="w-12 h-12 rounded-full bg-gray-100 dark:bg-white/5 mx-auto flex items-center justify-center">
                    <Music className="w-6 h-6 text-gray-500 dark:text-gray-600" />
                  </div>
                  <p className="text-gray-500 text-sm font-medium">No stashes found yet.</p>
                </div>
              )}
            </div>
          </div>

          {/* Achievements - v1.4 Restored Card with Export */}
          <div className="glass-card rounded-[2rem] p-8 border border-gray-200 dark:border-white/10 bg-white/50 dark:bg-zinc-900/40 backdrop-blur-xl">
            <div className="flex items-center justify-between mb-8">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-orange-500/20 flex items-center justify-center">
                  <Sparkles className="w-4 h-4 text-orange-400" />
                </div>
                Achievements
              </h3>
              <InstagramExport
                totalSongs={history.length}
                genreData={genreData}
                topArtists={topArtists}
                streak={streak}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              {achievements.map((ach, i) => {
                const isComplete = ach.current >= ach.target;
                const progress = Math.min((ach.current / ach.target) * 100, 100);
                const Icon = ach.icon;
                return (
                  <motion.div
                    key={ach.title}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.1 + 0.3 }}
                    className={`p-6 rounded-3xl border ${isComplete ? 'bg-[#1DB954]/10 border-[#1DB954]/30 shadow-lg shadow-[#1DB954]/10' : 'bg-gray-50 dark:bg-white/5 border-gray-200 dark:border-white/5'} transition-all group overflow-hidden relative`}
                  >
                    {isComplete && (
                      <div className="absolute top-0 right-0 p-3">
                        <div className="bg-[#1DB954] rounded-full p-1">
                          <Sparkles className="w-3 h-3 text-black" />
                        </div>
                      </div>
                    )}
                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-4 ${isComplete ? 'bg-[#1DB954]/20' : 'bg-gray-200 dark:bg-white/5'}`}>
                      <Icon className={`w-6 h-6 ${isComplete ? 'text-[#1DB954]' : 'text-gray-500 dark:text-gray-600'}`} />
                    </div>
                    <h4 className="font-bold text-gray-900 dark:text-white text-sm mb-1">{ach.title}</h4>
                    <p className="text-[10px] text-gray-500 font-bold uppercase tracking-wider mb-4">
                      {isComplete ? 'Complete ✅' : `${ach.current}/${ach.target} Songs`}
                    </p>

                    <div className="w-full h-1.5 bg-gray-200 dark:bg-white/5 rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${progress}%` }}
                        transition={{ duration: 1, delay: i * 0.2 + 0.5 }}
                        className={`h-full rounded-full ${isComplete ? 'bg-[#1DB954]' : 'bg-gray-400 dark:bg-gray-700'}`}
                      />
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}