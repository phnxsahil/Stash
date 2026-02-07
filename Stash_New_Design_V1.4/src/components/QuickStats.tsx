import { Music2, TrendingUp, Calendar } from 'lucide-react';

interface QuickStatsProps {
  totalSongs: number;
}

export function QuickStats({ totalSongs }: QuickStatsProps) {
  // Mock data for now
  const stats = {
    totalSongs,
    thisWeek: Math.min(totalSongs, Math.floor(Math.random() * 10) + 1),
    streak: Math.floor(Math.random() * 7) + 1,
  };

  return (
    <div className="grid grid-cols-3 gap-3 md:gap-4 mb-8 md:mb-12">
      <div className="bg-white/5 backdrop-blur-sm rounded-xl md:rounded-2xl border border-white/10 p-4 md:p-6 text-center hover:bg-white/10 transition-all">
        <div className="w-10 h-10 md:w-12 md:h-12 mx-auto mb-2 md:mb-3 rounded-xl bg-[#1DB954]/20 flex items-center justify-center">
          <Music2 className="w-5 h-5 md:w-6 md:h-6 text-[#1DB954]" />
        </div>
        <p className="text-2xl md:text-3xl mb-1">{stats.totalSongs}</p>
        <p className="text-gray-400 text-xs md:text-sm">Total Songs</p>
      </div>

      <div className="bg-white/5 backdrop-blur-sm rounded-xl md:rounded-2xl border border-white/10 p-4 md:p-6 text-center hover:bg-white/10 transition-all">
        <div className="w-10 h-10 md:w-12 md:h-12 mx-auto mb-2 md:mb-3 rounded-xl bg-blue-500/20 flex items-center justify-center">
          <TrendingUp className="w-5 h-5 md:w-6 md:h-6 text-blue-400" />
        </div>
        <p className="text-2xl md:text-3xl mb-1">{stats.thisWeek}</p>
        <p className="text-gray-400 text-xs md:text-sm">This Week</p>
      </div>

      <div className="bg-white/5 backdrop-blur-sm rounded-xl md:rounded-2xl border border-white/10 p-4 md:p-6 text-center hover:bg-white/10 transition-all">
        <div className="w-10 h-10 md:w-12 md:h-12 mx-auto mb-2 md:mb-3 rounded-xl bg-purple-500/20 flex items-center justify-center">
          <Calendar className="w-5 h-5 md:w-6 md:h-6 text-purple-400" />
        </div>
        <p className="text-2xl md:text-3xl mb-1">{stats.streak}</p>
        <p className="text-gray-400 text-xs md:text-sm">Day Streak</p>
      </div>
    </div>
  );
}
