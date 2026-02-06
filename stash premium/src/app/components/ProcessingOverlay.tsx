import { useState, useEffect } from 'react';
import { Download, Fingerprint, Search, Music } from 'lucide-react';
import { motion } from 'motion/react';

interface ProcessingOverlayProps {
  isOpen: boolean;
  stage?: 'extracting' | 'identifying' | 'syncing' | 'error';
  error?: string;
  onClose?: () => void;
}

export default function ProcessingOverlay({ 
  isOpen, 
  stage = 'extracting',
  error,
  onClose
}: ProcessingOverlayProps) {
  const [currentStage, setCurrentStage] = useState(0);
  const [progress, setProgress] = useState(0);

  const stages = [
    { 
      id: 'extracting', 
      label: 'Extracting Audio', 
      icon: Download,
      color: 'text-emerald-400' 
    },
    { 
      id: 'identifying', 
      label: 'Identifying Song', 
      icon: Fingerprint,
      color: 'text-purple-400' 
    },
    { 
      id: 'syncing', 
      label: 'Syncing Spotify', 
      icon: Search,
      color: 'text-[#1DB954]' 
    },
  ];

  useEffect(() => {
    if (!isOpen || stage === 'error') {
      setCurrentStage(0);
      setProgress(0);
      return;
    }

    // Progress simulation
    const progressInterval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) return 100;
        return prev + Math.random() * 15;
      });
    }, 200);

    // Stage progression
    const stageInterval = setInterval(() => {
      setCurrentStage(prev => {
        if (prev >= stages.length - 1) return prev;
        return prev + 1;
      });
    }, 1500);

    return () => {
      clearInterval(progressInterval);
      clearInterval(stageInterval);
    };
  }, [isOpen, stage]);

  if (!isOpen) return null;

  const isError = stage === 'error';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-2xl">
      <div className="max-w-md w-full mx-4">
        {/* Pulsing Core Icon */}
        <div className="relative flex items-center justify-center mb-12">
          {/* Rotating Border Rings */}
          <motion.div
            className={`absolute w-32 h-32 rounded-full ${
              isError ? 'border-2 border-red-500/30' : 'border-2 border-[#1DB954]/30'
            }`}
            animate={{ rotate: 360 }}
            transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
          />
          <motion.div
            className={`absolute w-40 h-40 rounded-full ${
              isError ? 'border border-red-500/20' : 'border border-emerald-500/20'
            }`}
            animate={{ rotate: -360 }}
            transition={{ duration: 4, repeat: Infinity, ease: 'linear' }}
          />
          
          {/* Ping Animation */}
          {!isError && (
            <>
              <motion.div
                className="absolute w-32 h-32 rounded-full bg-[#1DB954]/20"
                animate={{ scale: [1, 1.5, 1.5], opacity: [0.5, 0, 0] }}
                transition={{ duration: 2, repeat: Infinity }}
              />
              <motion.div
                className="absolute w-32 h-32 rounded-full bg-emerald-500/20"
                animate={{ scale: [1, 1.8, 1.8], opacity: [0.3, 0, 0] }}
                transition={{ duration: 2, repeat: Infinity, delay: 0.5 }}
              />
            </>
          )}

          {/* Center Music Icon */}
          <motion.div
            className={`relative w-24 h-24 rounded-full flex items-center justify-center ${
              isError 
                ? 'bg-gradient-to-br from-red-500/20 to-orange-500/20 border border-red-500/40' 
                : 'bg-gradient-to-br from-[#1DB954]/20 to-emerald-500/20 border border-[#1DB954]/40'
            }`}
            animate={!isError ? { scale: [1, 1.05, 1] } : {}}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <Music className={`w-12 h-12 ${isError ? 'text-red-500' : 'text-[#1DB954]'}`} />
          </motion.div>
        </div>

        {/* Error Message or Stepper */}
        {isError ? (
          <div className="text-center space-y-4">
            <h3 className="text-xl font-semibold text-red-500">
              {error || 'Something went wrong'}
            </h3>
            <p className="text-sm text-gray-400">
              Please try again with a different link
            </p>
            {onClose && (
              <button
                className="mt-4 px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
                onClick={onClose}
              >
                Close
              </button>
            )}
          </div>
        ) : (
          <>
            {/* Visual Stepper */}
            <div className="space-y-6 mb-8">
              {stages.map((stageItem, index) => {
                const Icon = stageItem.icon;
                const isActive = index === currentStage;
                const isCompleted = index < currentStage;

                return (
                  <motion.div
                    key={stageItem.id}
                    className="flex items-center gap-4"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.2 }}
                  >
                    {/* Icon Circle */}
                    <div
                      className={`w-12 h-12 rounded-full flex items-center justify-center border-2 transition-all duration-500 ${
                        isActive
                          ? `${stageItem.color} border-current bg-current/10 scale-110`
                          : isCompleted
                          ? 'border-gray-600 bg-gray-700/50 text-gray-400'
                          : 'border-gray-700 bg-gray-800/50 text-gray-600'
                      }`}
                    >
                      <Icon className="w-6 h-6" />
                    </div>

                    {/* Label */}
                    <div className="flex-1">
                      <p
                        className={`font-medium transition-colors ${
                          isActive
                            ? 'text-white'
                            : isCompleted
                            ? 'text-gray-400'
                            : 'text-gray-600'
                        }`}
                      >
                        {stageItem.label}
                      </p>
                    </div>

                    {/* Active Indicator */}
                    {isActive && (
                      <motion.div
                        className="w-2 h-2 rounded-full bg-[#1DB954]"
                        animate={{ scale: [1, 1.5, 1], opacity: [1, 0.5, 1] }}
                        transition={{ duration: 1.5, repeat: Infinity }}
                      />
                    )}
                  </motion.div>
                );
              })}
            </div>

            {/* Progress Bar */}
            <div className="relative w-full h-1 bg-gray-800 rounded-full overflow-hidden">
              <motion.div
                className="absolute inset-y-0 left-0 bg-gradient-to-r from-[#1DB954] to-emerald-400"
                initial={{ width: '0%' }}
                animate={{ width: `${Math.min(progress, 100)}%` }}
                transition={{ duration: 0.3 }}
              />
              {/* Shimmer Effect */}
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
                animate={{ x: ['-100%', '200%'] }}
                transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}
              />
            </div>

            {/* Status Text */}
            <p className="text-center text-sm text-gray-400 mt-6">
              This usually takes a few seconds...
            </p>
          </>
        )}
      </div>
    </div>
  );
}