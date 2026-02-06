import { motion } from 'framer-motion';
import { Plus } from 'lucide-react';
import { Button } from './ui/button';

interface FloatingStashButtonProps {
  onClick: () => void;
}

export function FloatingStashButton({ onClick }: FloatingStashButtonProps) {
  return (
    <motion.div
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{
        type: 'spring',
        stiffness: 260,
        damping: 20,
      }}
      className="md:hidden fixed bottom-20 right-6 z-40"
    >
      <Button
        onClick={onClick}
        className="relative w-16 h-16 rounded-full bg-gradient-to-br from-[#1DB954] to-[#1ed760] hover:from-[#1ed760] hover:to-[#1DB954] shadow-2xl shadow-[#1DB954]/40 hover:shadow-[#1DB954]/60 transition-all hover:scale-110 active:scale-95 border-2 border-white/20"
      >
        {/* Pulse ring */}
        <span className="absolute inset-0 rounded-full bg-[#1DB954] animate-ping opacity-20" />
        
        {/* Icon */}
        <Plus className="w-8 h-8 text-black relative z-10" strokeWidth={3} />
      </Button>
    </motion.div>
  );
}