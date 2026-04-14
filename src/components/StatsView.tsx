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

const COLORS = ['#1DB954', '#17c964', '#22c55e', '#7dd3a4', '#b7f0cb'];

export function StatsView({ history, userName, songsThisWeek, streak }: StatsViewProps) {
  const [vibe, setVibe] = useState<string>('Analyzing your vibe...');

  const genreCounts: Record<string, number> = {};
  history.forEach((song) => {
    const g = song.genre || 'Unknown';
    genreCounts[g] = (genreCounts[g] || 0) + 1;
  });

  const genreData = Object.entries(genreCounts)
    .map(([name, value], idx) => ({
      name,
      value: Math.round((value / history.length) * 100),
      count: value,
      color: COLORS[idx % COLORS.length],
    }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);

  const artistCounts: Record<string, { count: number; art: string }> = {};
  history.forEach((song) => {
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
    }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 3);

  const achievements = [
    { title: 'First Stash', target: 1, current: history.length, icon: Sparkles },
    { title: 'Collector', target: 10, current: history.length, icon: Music },
    { title: 'Music Lover', target: 25, current: history.length, icon: Trophy },
  ];

  useEffect(() => {
    if (history.length > 0) {
      api.getVibeAnalysis(history)
        .then(setVibe)
        .catch(() => setVibe('Eclectic and curious.'));
    } else {
      setVibe('No songs yet. Start stashing.');
    }
  }, [history]);

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-20">
      <div className="surface-panel relative overflow-hidden bg-gradient-to-br from-card/95 via-card/88 to-accent/18 p-6 md:p-10">
        {[...Array(3)].map((_, i) => (
          <motion.div
            key={i}
            className="pointer-events-none absolute h-64 w-64 rounded-full opacity-20 blur-[100px]"
            style={{
              background: i === 0 ? '#1DB954' : i === 1 ? '#86efac' : '#22c55e',
              left: `${12 + i * 24}%`,
              top: `${8 + i * 16}%`,
            }}
            animate={{
              y: [0, -30, 0],
              x: [0, 20, 0],
              scale: [1, 1.14, 1],
            }}
            transition={{
              duration: 5 + i * 2,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
          />
        ))}

        <div className="relative z-10 space-y-5 text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-border/50 bg-background/70 px-4 py-1.5 backdrop-blur-md">
            <Sparkles className="h-3.5 w-3.5 text-primary" />
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-primary">Your Listening Snapshot</span>
          </div>

          <h2 className="text-4xl font-black leading-tight tracking-tight text-foreground md:text-6xl">
            {vibe}
          </h2>

          <p className="mx-auto max-w-2xl text-base font-medium leading-relaxed text-muted-foreground md:text-lg">
            {userName}&apos;s recent saves are leaning into <span className="text-foreground">{genreData[0]?.name || 'new sounds'}</span>, with a player-style snapshot that feels closer to a listening app than a dashboard.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="surface-panel bg-gradient-to-br from-card/94 via-card/88 to-background/75 p-6 md:p-8 lg:col-span-2">
          <div className="mb-8 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl border border-border/40 bg-background/50">
              <Layers className="h-5 w-5 text-primary" />
            </div>
            <h3 className="text-xl font-bold tracking-tight text-foreground">Genre breakdown</h3>
          </div>

          <div className="grid items-center gap-8 md:grid-cols-2">
            <div className="relative h-[240px] w-full">
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
                        backgroundColor: 'rgba(24, 24, 27, 0.92)',
                        borderRadius: '16px',
                        border: '1px solid rgba(255,255,255,0.1)',
                        backdropFilter: 'blur(10px)',
                        boxShadow: '0 10px 30px rgba(0,0,0,0.5)',
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex h-full items-center justify-center text-sm font-medium text-muted-foreground">No data yet</div>
              )}

              <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-3xl font-black text-foreground">{genreData.length}</span>
                <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Genres</span>
              </div>
            </div>

            <div className="space-y-4">
              {genreData.map((genre, idx) => (
                <div key={genre.name} className="group flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="h-2 w-2 rounded-full" style={{ backgroundColor: COLORS[idx % COLORS.length] }} />
                    <span className="text-sm font-bold text-muted-foreground transition-colors group-hover:text-foreground">{genre.name}</span>
                  </div>
                  <span className="text-sm font-mono text-muted-foreground">{genre.value}%</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="surface-panel border-l-4 border-l-primary bg-gradient-to-br from-card/96 to-primary/6 p-6 md:p-8">
            <div className="mb-6 flex items-center justify-between">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/20 shadow-lg shadow-primary/10">
                <Activity className="h-6 w-6 text-primary" />
              </div>
              <div className="text-right">
                <p className="mb-1 text-[10px] font-black uppercase leading-none tracking-widest text-muted-foreground">Activity</p>
                <p className="text-sm font-bold text-foreground">This Week</p>
              </div>
            </div>

            <div className="mb-4 flex items-baseline gap-2">
              <span className="text-6xl font-black tracking-tighter text-foreground">{songsThisWeek}</span>
              <span className="text-xl font-bold text-primary">songs</span>
            </div>

            <div className="flex w-fit items-center gap-2 rounded-full border border-emerald-400/20 bg-emerald-400/10 px-3 py-1 text-xs font-bold uppercase tracking-wider text-emerald-400">
              <TrendingUp className="h-3.5 w-3.5" />
              <span>Trending Up</span>
            </div>
          </div>

          <div className="surface-panel border-l-4 border-l-orange-500 bg-gradient-to-br from-card/96 to-orange-500/8 p-6 md:p-8">
            <div className="mb-6 flex items-center justify-between">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-orange-500/20 shadow-lg shadow-orange-500/10">
                <Trophy className="h-6 w-6 text-orange-400" />
              </div>
              <div className="text-right">
                <p className="mb-1 text-[10px] font-black uppercase tracking-widest leading-none text-muted-foreground">Streak</p>
                <p className="text-sm font-bold text-foreground">Keep going</p>
              </div>
            </div>
            <div className="flex items-baseline gap-2">
              <p className="text-6xl font-black tracking-tighter text-foreground">{streak}</p>
              <span className="text-xl font-bold uppercase tracking-wider text-orange-400">Days</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6 lg:col-span-3 lg:grid-cols-2">
          <div className="surface-panel bg-gradient-to-br from-card/95 via-card/88 to-background/72 p-6 md:p-8">
            <h3 className="mb-8 flex items-center gap-3 text-xl font-bold text-foreground">
              <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-purple-500/20">
                <Music2 className="h-4 w-4 text-purple-400" />
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
                  className="group flex items-center justify-between rounded-2xl border border-border/40 bg-background/46 p-4 transition-all hover:bg-background/76"
                >
                  <div className="flex items-center gap-5">
                    <span className="w-6 font-mono text-lg font-black text-muted-foreground transition-colors group-hover:text-primary">#{i + 1}</span>
                    <div className="relative">
                      <img src={artist.art} alt={artist.name} className="h-14 w-14 rounded-2xl object-cover shadow-2xl transition-transform group-hover:scale-105" />
                      <div className="absolute inset-0 rounded-2xl ring-1 ring-inset ring-black/10 dark:ring-white/10" />
                    </div>
                    <div>
                      <span className="font-bold text-foreground transition-colors group-hover:text-primary">{artist.name}</span>
                      <p className="mt-0.5 text-xs font-medium text-muted-foreground">{artist.count} stashes</p>
                    </div>
                  </div>
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-background/60 opacity-0 transition-opacity group-hover:opacity-100">
                    <TrendingUp className="h-3.5 w-3.5 text-primary" />
                  </div>
                </motion.div>
              ))}
              {topArtists.length === 0 && (
                <div className="space-y-3 py-12 text-center">
                  <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-background/60">
                    <Music className="h-6 w-6 text-muted-foreground" />
                  </div>
                  <p className="text-sm font-medium text-muted-foreground">No stashes found yet.</p>
                </div>
              )}
            </div>
          </div>

          <div className="surface-panel bg-gradient-to-br from-card/95 via-card/88 to-background/72 p-6 md:p-8">
            <div className="mb-8 flex items-center justify-between gap-3">
              <h3 className="flex items-center gap-3 text-xl font-bold text-foreground">
                <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-orange-500/20">
                  <Sparkles className="h-4 w-4 text-orange-400" />
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
                    className={`relative overflow-hidden rounded-3xl border p-5 transition-all ${isComplete ? 'border-primary/30 bg-primary/10 shadow-lg shadow-primary/10' : 'border-border/40 bg-background/45'}`}
                  >
                    {isComplete && (
                      <div className="absolute right-0 top-0 p-3">
                        <div className="rounded-full bg-primary p-1">
                          <Sparkles className="h-3 w-3 text-black" />
                        </div>
                      </div>
                    )}

                    <div className={`mb-4 flex h-12 w-12 items-center justify-center rounded-2xl ${isComplete ? 'bg-primary/20' : 'bg-background/60'}`}>
                      <Icon className={`h-6 w-6 ${isComplete ? 'text-primary' : 'text-muted-foreground'}`} />
                    </div>
                    <h4 className="mb-1 text-sm font-bold text-foreground">{ach.title}</h4>
                    <p className="mb-4 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                      {isComplete ? 'Complete' : `${ach.current}/${ach.target} Songs`}
                    </p>

                    <div className="h-1.5 w-full overflow-hidden rounded-full bg-background/75">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${progress}%` }}
                        transition={{ duration: 1, delay: i * 0.2 + 0.5 }}
                        className={`h-full rounded-full ${isComplete ? 'bg-primary' : 'bg-muted-foreground/50'}`}
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
