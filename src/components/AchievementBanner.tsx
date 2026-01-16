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
    glow: 'shadow-yellow-500/50',
  },
  {
    id: 'collector',
    icon: Target,
    title: 'Collector',
    description: 'Stash 10 songs',
    target: 10,
    color: 'from-blue-400 to-cyan-500',
    glow: 'shadow-blue-500/50',
  },
  {
    id: 'music-lover',
    icon: Trophy,
    title: 'Music Lover',
    description: 'Stash 25 songs',
    target: 25,
    color: 'from-purple-400 to-pink-500',
    glow: 'shadow-purple-500/50',
  },
  {
    id: 'curator',
    icon: TrendingUp,
    title: 'Curator',
    description: 'Stash 50 songs',
    target: 50,
    color: 'from-emerald-400 to-green-500',
    glow: 'shadow-emerald-500/50',
  },
];

export function AchievementBanner({ totalSongs }: AchievementBannerProps) {
  const [showBanner, setShowBanner] = useState(false);
  const [currentAchievement, setCurrentAchievement] = useState<Achievement | null>(null);

  // Compute progress for each achievement based on current totalSongs
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
        // Mark as shown IMMEDIATELY to prevent double-trigger
        localStorage.setItem(`achievement-${justCompleted.id}-shown`, 'true');

        setCurrentAchievement(justCompleted);
        setShowBanner(true);

        setTimeout(() => {
          setShowBanner(false);
        }, 5000);
      }
    };

    checkAchievements();
  }, [totalSongs, achievementsWithProgress, currentAchievement]);

  // Get next achievement to show progress towards
  const nextAchievement = achievementsWithProgress.find((ach) => ach.progress < ach.target);

  return (
    <>
      {/* Achievement Unlock Banner */}
      <AnimatePresence>
        {showBanner && currentAchievement && (
          <motion.div
            initial={{ y: -100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -100, opacity: 0 }}
            className="fixed top-20 left-1/2 -translate-x-1/2 z-50 w-full max-w-md px-4"
          >
            <div
              className={`bg-gradient-to-r ${currentAchievement.color} rounded-2xl p-6 shadow-2xl ${currentAchievement.glow} border-2 border-white/20`}
            >
              <div className="flex items-center gap-4">
                <motion.div
                  animate={{
                    rotate: [0, 10, -10, 10, 0],
                    scale: [1, 1.2, 1.2, 1.2, 1],
                  }}
                  transition={{ duration: 0.5 }}
                  className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm"
                >
                  <currentAchievement.icon className="w-8 h-8 text-white" />
                </motion.div>
                <div className="flex-1">
                  <p className="text-white/80 text-sm font-medium">Achievement Unlocked!</p>
                  <h3 className="text-white text-xl font-bold">{currentAchievement.title}</h3>
                  <p className="text-white/90 text-sm">{currentAchievement.description}</p>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Progress Towards Next Achievement */}
      {nextAchievement && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card backdrop-blur-sm rounded-2xl p-4 shadow-lg mb-6"
        >
          <div className="flex items-center gap-3 mb-3">
            <div className={`w-10 h-10 bg-gradient-to-br ${nextAchievement.color} rounded-lg flex items-center justify-center shadow-lg`}>
              <nextAchievement.icon className="w-5 h-5 text-white" />
            </div>
            <div className="flex-1">
              <p className="font-semibold text-sm">{nextAchievement.title}</p>
              <p className="text-xs text-gray-600 dark:text-gray-400">
                {nextAchievement.progress} / {nextAchievement.target} songs
              </p>
            </div>
            <span className="text-2xl">
              {Math.round((nextAchievement.progress / nextAchievement.target) * 100)}%
            </span>
          </div>

          {/* Progress Bar */}
          <div className="w-full h-2 bg-gray-200 dark:bg-gray-800 rounded-full overflow-hidden">
            <motion.div
              className={`h-full bg-gradient-to-r ${nextAchievement.color}`}
              initial={{ width: 0 }}
              animate={{ width: `${(nextAchievement.progress / nextAchievement.target) * 100}%` }}
              transition={{ duration: 0.8, ease: 'easeOut' }}
            />
          </div>
        </motion.div>
      )}
    </>
  );
}
