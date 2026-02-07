import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Music2, Download, Fingerprint, Search, CheckCircle2, XCircle } from 'lucide-react';

interface ProcessingOverlayProps {
  isVisible: boolean;
  stage: 1 | 2 | 3 | 'success' | 'error';
  errorMessage?: string;
  onClose?: () => void;
}

const stages = [
  {
    id: 1,
    icon: Download,
    title: 'Extracting Audio',
    description: 'Analyzing the source...',
  },
  {
    id: 2,
    icon: Fingerprint,
    title: 'Identifying Song',
    description: 'Matching audio fingerprint...',
  },
  {
    id: 3,
    icon: Search,
    title: 'Syncing Spotify',
    description: 'Finding perfect match...',
  },
];

export function ProcessingOverlay({ 
  isVisible, 
  stage, 
  errorMessage,
  onClose 
}: ProcessingOverlayProps) {
  const [progress, setProgress] = useState(0);
  const isError = stage === 'error';
  const isSuccess = stage === 'success';
  const currentStageIndex = typeof stage === 'number' ? stage - 1 : 2;

  useEffect(() => {
    if (!isVisible) {
      setProgress(0);
      return;
    }

    const targetProgress = isSuccess ? 100 : isError ? 0 : (stage as number) * 33.33;
    const increment = targetProgress > progress ? 2 : -2;
    
    const timer = setInterval(() => {
      setProgress(prev => {
        const next = prev + increment;
        if ((increment > 0 && next >= targetProgress) || (increment < 0 && next <= targetProgress)) {
          return targetProgress;
        }
        return next;
      });
    }, 20);

    return () => clearInterval(timer);
  }, [isVisible, stage, isError, isSuccess, progress]);

  // Auto-close after success or error
  useEffect(() => {
    if ((isSuccess || isError) && onClose) {
      const timer = setTimeout(() => {
        onClose();
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [isSuccess, isError, onClose]);

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-2xl"
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            transition={{ type: 'spring', damping: 20, stiffness: 300 }}
            className="relative w-full max-w-md"
          >
            {/* Glass Card */}
            <div className={`
              relative rounded-3xl p-12 
              ${isError 
                ? 'bg-red-500/10 border-red-500/30' 
                : 'bg-white/5 border-white/10'
              }
              border backdrop-blur-xl shadow-2xl
            `}>
              {/* Animated Background Rings */}
              <div className="absolute inset-0 flex items-center justify-center">
                {[...Array(3)].map((_, i) => (
                  <motion.div
                    key={i}
                    className={`absolute rounded-full ${
                      isError ? 'border-red-500/20' : 'border-[#1DB954]/20'
                    } border-2`}
                    initial={{ width: 80, height: 80, opacity: 0.5 }}
                    animate={{
                      width: [80, 200, 80],
                      height: [80, 200, 80],
                      opacity: [0.5, 0, 0.5],
                    }}
                    transition={{
                      duration: 2,
                      delay: i * 0.4,
                      repeat: Infinity,
                      ease: 'easeInOut',
                    }}
                  />
                ))}
              </div>

              {/* Center Icon */}
              <div className="relative flex flex-col items-center gap-6 mb-8">
                <motion.div
                  animate={{
                    rotate: isError ? 0 : 360,
                    scale: [1, 1.1, 1],
                  }}
                  transition={{
                    rotate: { duration: 3, repeat: Infinity, ease: 'linear' },
                    scale: { duration: 1.5, repeat: Infinity, ease: 'easeInOut' },
                  }}
                  className={`
                    relative w-20 h-20 rounded-2xl flex items-center justify-center
                    ${isError 
                      ? 'bg-red-500/20 border-red-500/50' 
                      : isSuccess
                      ? 'bg-emerald-500/20 border-emerald-500/50'
                      : 'bg-[#1DB954]/20 border-[#1DB954]/50'
                    }
                    border-2 shadow-xl
                  `}
                >
                  {isError ? (
                    <XCircle className="w-10 h-10 text-red-500" />
                  ) : isSuccess ? (
                    <CheckCircle2 className="w-10 h-10 text-emerald-500" />
                  ) : (
                    <Music2 className="w-10 h-10 text-[#1DB954]" />
                  )}
                </motion.div>

                {/* Status Text */}
                <div className="text-center">
                  <h3 className="text-xl font-semibold text-white mb-2">
                    {isError 
                      ? 'Something Went Wrong' 
                      : isSuccess
                      ? 'Success!'
                      : stages[currentStageIndex]?.title
                    }
                  </h3>
                  <p className="text-sm text-gray-400">
                    {isError 
                      ? errorMessage || 'Please try again' 
                      : isSuccess
                      ? 'Song added to your library'
                      : stages[currentStageIndex]?.description
                    }
                  </p>
                </div>
              </div>

              {/* Stage Indicators */}
              {!isError && !isSuccess && (
                <div className="flex items-center justify-center gap-3 mb-8">
                  {stages.map((stageItem, index) => {
                    const StageIcon = stageItem.icon;
                    const isActive = index === currentStageIndex;
                    const isCompleted = index < currentStageIndex;

                    return (
                      <motion.div
                        key={stageItem.id}
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ 
                          scale: isActive ? 1.2 : 1, 
                          opacity: isCompleted ? 0.5 : isActive ? 1 : 0.3 
                        }}
                        className="flex flex-col items-center gap-2"
                      >
                        <div className={`
                          w-12 h-12 rounded-xl flex items-center justify-center transition-all
                          ${isCompleted 
                            ? 'bg-emerald-500/20 border-emerald-500/50' 
                            : isActive
                            ? 'bg-[#1DB954]/20 border-[#1DB954]/50'
                            : 'bg-white/5 border-white/10'
                          }
                          border-2
                        `}>
                          <StageIcon className={`
                            w-6 h-6
                            ${isCompleted 
                              ? 'text-emerald-500' 
                              : isActive
                              ? 'text-[#1DB954]'
                              : 'text-gray-500'
                            }
                          `} />
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              )}

              {/* Progress Bar */}
              <div className="relative w-full h-2 bg-white/10 rounded-full overflow-hidden">
                <motion.div
                  className={`h-full rounded-full ${
                    isError
                      ? 'bg-gradient-to-r from-red-500 to-red-600'
                      : 'bg-gradient-to-r from-[#1DB954] to-emerald-400'
                  }`}
                  initial={{ width: '0%' }}
                  animate={{ width: `${progress}%` }}
                  transition={{ duration: 0.3 }}
                >
                  {/* Shimmer Effect */}
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"
                    animate={{
                      x: ['-100%', '200%'],
                    }}
                    transition={{
                      duration: 1.5,
                      repeat: Infinity,
                      ease: 'linear',
                    }}
                  />
                </motion.div>
              </div>

              {/* Progress Percentage */}
              <div className="text-center mt-4">
                <span className="text-sm font-medium text-gray-400">
                  {Math.round(progress)}%
                </span>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
