import { motion, AnimatePresence } from 'framer-motion';
import { Trophy, Target, Star, TrendingUp } from 'lucide-react';
import { useEffect, useState, useMemo } from 'react';

interface AchievementBannerProps {
  totalSongs: number;
}

interface Achievement {
  id: string;
  icon: any;
  title: string;
  description: string;
  target: number;
  color: string;
  glow: string;
}

const ACHIEVEMENT_DEFINITIONS: Achievement[] = [
  {
    id: 'first-stash',
    icon: Star,
    title: 'First Stash!',
    description: 'You stashed your first song!',
    target: 1,
    color: 'from-yellow-400 to-orange-500',
    glow: 'shadow-yellow-500/20',
  },
  {
    id: 'collector',
    icon: Target,
    title: 'Collector',
    description: 'Stash 10 songs',
    target: 10,
    color: 'from-blue-400 to-cyan-500',
    glow: 'shadow-blue-500/20',
  },
  {
    id: 'music-lover',
    icon: Trophy,
    title: 'Music Lover',
    description: 'Stash 25 songs',
    target: 25,
    color: 'from-purple-400 to-pink-500',
    glow: 'shadow-purple-500/20',
  },
  {
    id: 'curator',
    icon: TrendingUp,
    title: 'Curator',
    description: 'Stash 50 songs',
    target: 50,
    color: 'from-emerald-400 to-green-500',
    glow: 'shadow-emerald-500/20',
  },
];

export function AchievementBanner({ totalSongs }: AchievementBannerProps) {
  const [showBanner, setShowBanner] = useState(false);
  const [currentAchievement, setCurrentAchievement] = useState<Achievement | null>(null);

  const achievementsWithProgress = useMemo(() => {
    return ACHIEVEMENT_DEFINITIONS.map(ach => ({
      ...ach,
      progress: Math.min(totalSongs, ach.target),
      isCompleted: totalSongs >= ach.target
    }));
  }, [totalSongs]);

  useEffect(() => {
    const checkAchievements = () => {
      const justCompleted = achievementsWithProgress.find(
        (ach) => {
          const isCompleted = ach.progress === ach.target;
          const notShown = !localStorage.getItem(`achievement-${ach.id}-shown`);
          const notCurrentlyShowing = currentAchievement?.id !== ach.id;

          return isCompleted && notShown && notCurrentlyShowing;
        }
      );

      if (justCompleted) {
        localStorage.setItem(`achievement-${justCompleted.id}-shown`, 'true');
        setCurrentAchievement(justCompleted);
        setShowBanner(true);
        setTimeout(() => setShowBanner(false), 5000);
      }
    };

    checkAchievements();
  }, [totalSongs, achievementsWithProgress, currentAchievement]);

  const nextAchievement = achievementsWithProgress.find((ach) => ach.progress < ach.target);

  return (
    <>
      <AnimatePresence>
        {showBanner && currentAchievement && (
          <motion.div
            initial={{ y: -100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -100, opacity: 0 }}
            className="fixed top-24 left-1/2 -translate-x-1/2 z-50 w-full max-w-md px-4"
          >
            <div className={`bg-gradient-to-r ${currentAchievement.color} rounded-3xl p-6 shadow-2xl ${currentAchievement.glow} border border-white/20 backdrop-blur-xl`}>
              <div className="flex items-center gap-5">
                <motion.div
                  animate={{ rotate: [0, 10, -10, 10, 0], scale: [1, 1.1, 1] }}
                  transition={{ duration: 0.6, repeat: 2 }}
                  className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center border border-white/30"
                >
                  <currentAchievement.icon className="w-9 h-9 text-white" />
                </motion.div>
                <div className="flex-1 min-w-0 text-white">
                  <p className="text-[10px] uppercase tracking-[0.2em] font-bold opacity-80 mb-1">New Achievement</p>
                  <h3 className="text-xl font-bold tracking-tight">{currentAchievement.title}</h3>
                  <p className="text-sm font-medium opacity-90 truncate">{currentAchievement.description}</p>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {nextAchievement && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="surface-panel p-5 md:p-6"
        >
          <div className="flex items-center gap-4 mb-4">
            <div className={`w-12 h-12 bg-gradient-to-br ${nextAchievement.color} rounded-2xl flex items-center justify-center shadow-lg border border-white/10 shrink-0`}>
              <nextAchievement.icon className="w-6 h-6 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between mb-1">
                <p className="font-bold text-base tracking-tight">{nextAchievement.title}</p>
                <span className="text-sm font-bold text-primary">
                  {Math.round((nextAchievement.progress / nextAchievement.target) * 100)}%
                </span>
              </div>
              <p className="text-xs text-muted-foreground font-semibold uppercase tracking-wider">
                {nextAchievement.progress} / {nextAchievement.target} Stashed
              </p>
            </div>
          </div>

          <div className="w-full h-2.5 bg-muted/50 rounded-full overflow-hidden border border-border/20">
            <motion.div
              className={`h-full bg-gradient-to-r ${nextAchievement.color} relative`}
              initial={{ width: 0 }}
              animate={{ width: `${(nextAchievement.progress / nextAchievement.target) * 100}%` }}
              transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
            >
              <div className="absolute inset-0 bg-white/20 animate-pulse" />
            </motion.div>
          </div>
        </motion.div>
      )}
    </>
  );
}
