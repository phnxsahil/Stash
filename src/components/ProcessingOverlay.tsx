import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Music2, Download, Fingerprint, Search, CheckCircle2, XCircle, X, Radio } from 'lucide-react';
import { RetryButton } from './RetryButton';
import { Button } from './ui/button';

interface ProcessingOverlayProps {
  isVisible: boolean;
  stage: 1 | 2 | 3 | 'success' | 'error';
  errorMessage?: string;
  onClose?: () => void;
  onRetry?: () => void;
}

const stages = [
  {
    id: 1,
    icon: Download,
    title: 'Extracting Audio',
    description: 'Analyzing the source signal...',
  },
  {
    id: 2,
    icon: Fingerprint,
    title: 'Identifying Song',
    description: 'Matching digital fingerprint...',
  },
  {
    id: 3,
    icon: Search,
    title: 'Syncing Spotify',
    description: 'Finding the high-fidelity match...',
  },
];

export function ProcessingOverlay({
  isVisible,
  stage,
  errorMessage,
  onClose,
  onRetry
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
    const increment = targetProgress > progress ? 1.5 : -1.5;

    const timer = setInterval(() => {
      setProgress(prev => {
        const next = prev + increment;
        if ((increment > 0 && next >= targetProgress) || (increment < 0 && next <= targetProgress)) {
          return targetProgress;
        }
        return next;
      });
    }, 16);

    return () => clearInterval(timer);
  }, [isVisible, stage, isError, isSuccess, progress]);

  useEffect(() => {
    if (isSuccess && onClose) {
      const timer = setTimeout(() => {
        onClose();
      }, 2200);
      return () => clearTimeout(timer);
    }
  }, [isSuccess, onClose]);

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/84 backdrop-blur-2xl"
          role="dialog"
          aria-modal="true"
          aria-live="polite"
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: 20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 400 }}
            className="relative w-full max-w-md"
          >
            {isError && onClose && (
               <div className="absolute -top-14 right-0 z-50">
                <Button
                  onClick={onClose}
                  variant="ghost"
                  size="icon"
                  className="rounded-full bg-card/50 border border-border/40 hover:bg-card/80 transition-colors"
                >
                  <X className="w-5 h-5" />
                </Button>
               </div>
            )}

            <div className={`
              relative rounded-[2rem] p-6 md:p-12 overflow-hidden border-border/40 shadow-2xl
              ${isError ? 'bg-destructive/5 border-destructive/20' : 'bg-card/58 border'}
              backdrop-blur-3xl
            `}>
              {/* Decorative Glows */}
              <div className="absolute -top-24 -left-24 w-48 h-48 bg-primary/10 blur-[80px] rounded-full" />
              <div className="absolute -bottom-24 -right-24 w-48 h-48 bg-primary/10 blur-[80px] rounded-full" />

              <div className="relative flex flex-col items-center gap-6 md:gap-8">
                {!isError && (
                  <div className="beta-chip">
                    <Radio className="h-3.5 w-3.5" />
                    Share-ready mobile flow
                  </div>
                )}
                <motion.div
                  animate={{
                    rotate: isError ? 0 : [0, 360],
                    scale: [1, 1.05, 1],
                  }}
                  transition={{
                    rotate: { duration: 8, repeat: Infinity, ease: 'linear' },
                    scale: { duration: 2, repeat: Infinity, ease: 'easeInOut' },
                  }}
                  className={`
                    relative w-20 h-20 md:w-24 md:h-24 rounded-3xl flex items-center justify-center
                    ${isError
                      ? 'bg-destructive/10 border-destructive/30 text-destructive'
                      : isSuccess
                        ? 'bg-primary/10 border-primary/30 text-primary'
                        : 'bg-primary/5 border-primary/20 text-primary'
                    }
                    border-2 shadow-2xl transition-colors duration-500
                  `}
                >
                  {isError ? (
                    <XCircle className="w-10 h-10 md:w-12 md:h-12" />
                  ) : isSuccess ? (
                    <CheckCircle2 className="w-10 h-10 md:w-12 md:h-12" />
                  ) : (
                    <Music2 className="w-10 h-10 md:w-12 md:h-12" />
                  )}
                  
                  {/* Pulse Ring */}
                  {!isError && !isSuccess && (
                    <motion.div
                      className="absolute inset-0 rounded-3xl border-2 border-primary/30"
                      animate={{ scale: [1, 1.4, 1], opacity: [0.5, 0, 0.5] }}
                      transition={{ duration: 2, repeat: Infinity }}
                    />
                  )}
                </motion.div>

                <div className="text-center space-y-2">
                  <h3 className="text-xl font-semibold tracking-tight md:text-2xl">
                    {isError
                      ? 'Sync Interrupted'
                      : isSuccess
                        ? 'Stashed Successfully'
                        : stages[currentStageIndex]?.title
                    }
                  </h3>
                  <p className="px-1 text-sm leading-relaxed text-muted-foreground md:px-4">
                    {isError
                      ? errorMessage || 'We encountered an issue matching the signal. Please verify the link and try again.'
                      : isSuccess
                        ? 'The track has been added to your Spotify library.'
                        : stages[currentStageIndex]?.description
                    }
                  </p>
                </div>

                {isError && onRetry && (
                  <div className="pt-2">
                    <RetryButton onRetry={onRetry} />
                  </div>
                )}

                {!isError && !isSuccess && (
                  <div className="flex items-center gap-3 py-2">
                    {stages.map((stageItem, index) => {
                      const isActive = index === currentStageIndex;
                      const isCompleted = index < currentStageIndex;

                      return (
                        <div
                          key={stageItem.id}
                          className={`
                            w-3 h-3 rounded-full border-2 transition-all duration-500
                            ${isCompleted
                              ? 'bg-primary border-primary'
                              : isActive
                                ? 'bg-primary border-primary scale-125 shadow-[0_0_12px_rgba(29,185,84,0.5)]'
                                : 'bg-transparent border-border/60'
                            }
                          `}
                        />
                      );
                    })}
                  </div>
                )}

                <div className="w-full space-y-4">
                  <div className="relative w-full h-2.5 bg-muted/50 rounded-full overflow-hidden border border-border/20 shadow-inner">
                    <motion.div
                      className={`h-full rounded-full relative ${isError
                        ? 'bg-destructive'
                        : 'bg-primary'
                        }`}
                      initial={{ width: '0%' }}
                      animate={{ width: `${progress}%` }}
                      transition={{ duration: 0.4, ease: 'easeOut' }}
                    >
                      <motion.div
                        className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"
                        animate={{ x: ['-100%', '200%'] }}
                        transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}
                      />
                    </motion.div>
                  </div>
                  
                  <div className="flex justify-center">
                    <span className="text-xs font-semibold uppercase tracking-[0.18em] text-primary tabular-nums">
                      {Math.round(progress)}% Complete
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
