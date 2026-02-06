import { motion } from 'motion/react';
import { TrendingUp, Trophy, Music2, Sparkles } from 'lucide-react';
import { InstagramExport } from './InstagramExport';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';

interface StatsViewProps {
  history?: any[];
}

export function StatsView({ history = [] }: StatsViewProps) {
  // Mock data for demonstration
  const genreData = [
    { name: 'Pop', value: 35, color: '#1DB954' },
    { name: 'Hip-Hop', value: 25, color: '#9333EA' },
    { name: 'Rock', value: 20, color: '#F59E0B' },
    { name: 'Electronic', value: 12, color: '#3B82F6' },
    { name: 'Other', value: 8, color: '#6B7280' },
  ];

  const topArtists = [
    { name: 'The Weeknd', image: '🎤', color: 'from-purple-500 to-pink-500' },
    { name: 'Drake', image: '🦉', color: 'from-blue-500 to-cyan-500' },
    { name: 'Taylor Swift', image: '✨', color: 'from-pink-500 to-rose-500' },
  ];

  const achievements = [
    { title: 'First Stash', progress: 100, icon: Sparkles },
    { title: '10 Songs Milestone', progress: 70, icon: Music2 },
    { title: 'Week Streak', progress: 40, icon: Trophy },
  ];

  return (
    <div className="min-h-screen bg-white dark:bg-black text-gray-900 dark:text-white pb-safe noise-texture">
      <div className="container mx-auto px-4 md:px-6 py-8 md:py-12 max-w-6xl">
        
        {/* Vibe Header with Animated Orbs */}
        <div className="relative mb-12 overflow-hidden rounded-3xl bg-gradient-to-br from-[#1DB954]/10 via-purple-500/10 to-blue-500/10 p-12 text-center border border-white/10">
          {/* Floating Orbs */}
          {[...Array(3)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-32 h-32 rounded-full blur-3xl opacity-30"
              style={{
                background: i === 0 ? '#1DB954' : i === 1 ? '#9333EA' : '#3B82F6',
                left: `${20 + i * 30}%`,
                top: `${10 + i * 20}%`,
              }}
              animate={{
                y: [0, -20, 0],
                x: [0, 10, 0],
              }}
              transition={{
                duration: 3 + i,
                repeat: Infinity,
                ease: 'easeInOut',
              }}
            />
          ))}

          <div className="relative z-10">
            <h1 className="text-4xl md:text-5xl mb-4 bg-gradient-to-r from-[#1DB954] via-purple-400 to-blue-400 bg-clip-text text-transparent" style={{ fontWeight: 700 }}>
              Euphoric & Melodic
            </h1>
            <p className="text-gray-600 dark:text-gray-400 text-lg">
              Your music vibe this week
            </p>
          </div>
        </div>

        {/* Main Grid */}
        <div className="grid lg:grid-cols-3 gap-6 mb-8">
          
          {/* Genre Architecture - Takes 2 columns */}
          <div className="lg:col-span-2 glass-card rounded-2xl p-8 border border-white/5 backdrop-blur-sm">
            <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
              <Music2 className="w-5 h-5 text-[#1DB954]" />
              Genre Distribution
            </h2>
            
            <div className="flex flex-col md:flex-row items-center justify-between gap-8">
              {/* Pie Chart */}
              <div className="w-full md:w-1/2">
                <ResponsiveContainer width="100%" height={250}>
                  <PieChart>
                    <Pie
                      data={genreData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={90}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {genreData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
              </div>

              {/* Legend */}
              <div className="w-full md:w-1/2 space-y-3">
                {genreData.map((genre) => (
                  <div key={genre.name} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div 
                        className="w-4 h-4 rounded-full" 
                        style={{ background: genre.color }}
                      />
                      <span className="text-sm font-medium">{genre.name}</span>
                    </div>
                    <span className="text-sm text-gray-500 dark:text-gray-400">
                      {genre.value}%
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Activity Board - Stacked */}
          <div className="space-y-6">
            {/* Songs This Week */}
            <div className="glass-card rounded-2xl p-6 border border-white/5 backdrop-blur-sm">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  Songs This Week
                </h3>
                <TrendingUp className="w-4 h-4 text-emerald-500" />
              </div>
              <p className="text-4xl font-bold text-[#1DB954]">
                {history.length || '--'}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                +12% from last week
              </p>
            </div>

            {/* Streak */}
            <div className="glass-card rounded-2xl p-6 border border-white/5 backdrop-blur-sm">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  Current Streak
                </h3>
                <Trophy className="w-4 h-4 text-yellow-500" />
              </div>
              <p className="text-4xl font-bold text-yellow-500">7</p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                Days in a row 🔥
              </p>
            </div>
          </div>
        </div>

        {/* Top Artists */}
        <div className="glass-card rounded-2xl p-8 border border-white/5 backdrop-blur-sm mb-8">
          <h2 className="text-xl font-semibold mb-6">Top Artists</h2>
          <div className="space-y-4">
            {topArtists.map((artist, index) => (
              <motion.div
                key={artist.name}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="flex items-center gap-4 p-4 rounded-xl bg-white/5 hover:bg-white/10 transition-all"
              >
                <div className="flex items-center gap-4 flex-1">
                  <span className="text-2xl font-bold text-gray-500 dark:text-gray-600 w-8">
                    #{index + 1}
                  </span>
                  <div className={`w-12 h-12 rounded-full bg-gradient-to-br ${artist.color} flex items-center justify-center text-2xl shadow-lg`}>
                    {artist.image}
                  </div>
                  <div>
                    <p className="font-semibold">{artist.name}</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {Math.floor(Math.random() * 50) + 10} plays
                    </p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Recent Achievements */}
        <div className="glass-card rounded-2xl p-8 border border-white/5 backdrop-blur-sm">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold">Recent Achievements</h2>
            <InstagramExport
              totalSongs={history.length}
              genreData={genreData}
              topArtists={topArtists}
              streak={7}
            />
          </div>
          
          <div className="space-y-4">
            {achievements.map((achievement, index) => {
              const Icon = achievement.icon;
              return (
                <motion.div
                  key={achievement.title}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className={`
                    p-4 rounded-xl border transition-all
                    ${achievement.progress === 100 
                      ? 'bg-[#1DB954]/10 border-[#1DB954]/30 shadow-lg shadow-[#1DB954]/20' 
                      : 'bg-white/5 border-white/10'
                    }
                  `}
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className={`
                        w-10 h-10 rounded-lg flex items-center justify-center
                        ${achievement.progress === 100 
                          ? 'bg-[#1DB954]/20' 
                          : 'bg-white/10'
                        }
                      `}>
                        <Icon className={`
                          w-5 h-5
                          ${achievement.progress === 100 
                            ? 'text-[#1DB954]' 
                            : 'text-gray-400'
                          }
                        `} />
                      </div>
                      <div>
                        <p className="font-semibold">{achievement.title}</p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          {achievement.progress}% Complete
                        </p>
                      </div>
                    </div>
                    {achievement.progress === 100 && (
                      <span className="text-2xl">🎉</span>
                    )}
                  </div>
                  
                  {/* Progress Bar */}
                  <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
                    <motion.div
                      className="h-full bg-gradient-to-r from-[#1DB954] to-emerald-400"
                      initial={{ width: 0 }}
                      animate={{ width: `${achievement.progress}%` }}
                      transition={{ duration: 1, delay: index * 0.2 }}
                    />
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>

      </div>
    </div>
  );
}