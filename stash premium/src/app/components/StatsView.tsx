import { Trophy, TrendingUp, Music2 } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend } from 'recharts';
import { motion } from 'motion/react';

interface StatsViewProps {
  history: any[];
}

export default function StatsView({ history }: StatsViewProps) {
  // Mock data for demonstration
  const genreData = [
    { name: 'Pop', value: 35, color: '#1DB954' },
    { name: 'Hip-Hop', value: 25, color: '#9333EA' },
    { name: 'Electronic', value: 20, color: '#10B981' },
    { name: 'R&B', value: 12, color: '#F59E0B' },
    { name: 'Other', value: 8, color: '#6B7280' },
  ];

  const songsThisWeek = 12;
  const currentStreak = 5;

  return (
    <div className="min-h-screen px-6 py-8 md:py-12">
      <div className="max-w-5xl mx-auto space-y-8">
        {/* Vibe Header with Animated Orbs */}
        <div className="relative overflow-hidden bg-gradient-to-br from-[#1DB954]/10 via-purple-500/10 to-emerald-500/10 rounded-3xl p-8 md:p-12 border border-gray-800">
          {/* Animated Background Orbs */}
          <motion.div
            className="absolute top-0 right-0 w-64 h-64 bg-[#1DB954]/20 rounded-full blur-3xl"
            animate={{
              x: [0, 30, 0],
              y: [0, -20, 0],
              scale: [1, 1.1, 1],
            }}
            transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
          />
          <motion.div
            className="absolute bottom-0 left-0 w-80 h-80 bg-purple-500/20 rounded-full blur-3xl"
            animate={{
              x: [0, -20, 0],
              y: [0, 30, 0],
              scale: [1, 1.2, 1],
            }}
            transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }}
          />

          <div className="relative z-10 text-center space-y-4">
            <h1 className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-[#1DB954] via-emerald-400 to-purple-400 bg-clip-text text-transparent">
              Euphoric & Melodic
            </h1>
            <p className="text-lg text-gray-400">Your Musical Identity</p>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Genre Architecture - Pie Chart */}
          <div className="bg-zinc-900/40 backdrop-blur-sm border border-white/5 rounded-2xl p-6 space-y-6">
            <div>
              <h2 className="text-xl font-semibold mb-2">Genre Architecture</h2>
              <p className="text-sm text-gray-400">Your listening breakdown</p>
            </div>

            <ResponsiveContainer width="100%" height={280}>
              <PieChart>
                <Pie
                  data={genreData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={2}
                  dataKey="value"
                >
                  {genreData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Legend
                  verticalAlign="bottom"
                  height={36}
                  content={({ payload }) => (
                    <div className="flex flex-wrap justify-center gap-3 mt-4">
                      {payload?.map((entry: any, index: number) => (
                        <div key={`legend-${index}`} className="flex items-center gap-2">
                          <div
                            className="w-3 h-3 rounded-full"
                            style={{ backgroundColor: entry.color }}
                          />
                          <span className="text-xs text-gray-400">{entry.value}</span>
                        </div>
                      ))}
                    </div>
                  )}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Activity Board */}
          <div className="space-y-6">
            {/* Songs This Week Card */}
            <div className="bg-zinc-900/40 backdrop-blur-sm border border-white/5 rounded-2xl p-6">
              <div className="flex items-start justify-between">
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-gray-400">
                    <Music2 className="w-5 h-5" />
                    <h3 className="text-sm font-medium">Songs This Week</h3>
                  </div>
                  <div className="flex items-baseline gap-2">
                    <p className="text-5xl font-bold text-[#1DB954]">{songsThisWeek}</p>
                    <div className="flex items-center gap-1 text-emerald-400 text-sm">
                      <TrendingUp className="w-4 h-4" />
                      <span>+3</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Streak Card */}
            <div className="bg-gradient-to-br from-[#1DB954]/20 to-emerald-500/20 backdrop-blur-sm border border-[#1DB954]/30 rounded-2xl p-6">
              <div className="flex items-start justify-between">
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Trophy className="w-5 h-5 text-[#1DB954]" />
                    <h3 className="text-sm font-medium">Current Streak</h3>
                  </div>
                  <div className="flex items-baseline gap-2">
                    <p className="text-5xl font-bold">{currentStreak}</p>
                    <span className="text-gray-400">days</span>
                  </div>
                  <p className="text-xs text-gray-400">
                    Keep stashing to maintain your streak! 🔥
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Top Artists & Songs */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Top Artists */}
          <div className="bg-zinc-900/40 backdrop-blur-sm border border-white/5 rounded-2xl p-6">
            <h2 className="text-xl font-semibold mb-4">Top Artists</h2>
            <div className="space-y-3">
              {['The Weeknd', 'Taylor Swift', 'Dua Lipa'].map((artist, index) => (
                <div
                  key={artist}
                  className="flex items-center gap-3 p-3 bg-gray-800/50 rounded-lg"
                >
                  <span className="text-2xl font-bold text-gray-600">
                    {index + 1}
                  </span>
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#1DB954] to-emerald-600" />
                  <span className="font-medium">{artist}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Recent Achievements */}
          <div className="bg-zinc-900/40 backdrop-blur-sm border border-white/5 rounded-2xl p-6">
            <h2 className="text-xl font-semibold mb-4">Recent Achievements</h2>
            <div className="space-y-3">
              <div className="p-3 bg-gradient-to-r from-[#1DB954]/20 to-transparent rounded-lg border-l-4 border-[#1DB954]">
                <h3 className="font-medium text-sm">First Stash! 🎉</h3>
                <p className="text-xs text-gray-400 mt-1">You saved your first song</p>
              </div>
              <div className="p-3 bg-gradient-to-r from-purple-500/20 to-transparent rounded-lg border-l-4 border-purple-500">
                <h3 className="font-medium text-sm">Genre Explorer 🌍</h3>
                <p className="text-xs text-gray-400 mt-1">Stashed songs from 5 different genres</p>
              </div>
              <div className="p-3 bg-gradient-to-r from-orange-500/20 to-transparent rounded-lg border-l-4 border-orange-500 opacity-50">
                <h3 className="font-medium text-sm">Week Warrior 🔥</h3>
                <p className="text-xs text-gray-400 mt-1">Stash songs for 7 days straight (3/7)</p>
              </div>
            </div>
          </div>
        </div>

        {/* Share Board Button (Disabled for now) */}
        <div className="text-center">
          <button
            disabled
            className="px-8 py-3 rounded-lg bg-gray-800/50 text-gray-500 cursor-not-allowed opacity-50"
            title="Coming soon"
          >
            Export to Instagram
          </button>
        </div>
      </div>
    </div>
  );
}