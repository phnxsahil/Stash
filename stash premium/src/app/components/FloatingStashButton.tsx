import { Plus } from 'lucide-react';
import { motion } from 'motion/react';

interface FloatingStashButtonProps {
  onClick: () => void;
}

export default function FloatingStashButton({ onClick }: FloatingStashButtonProps) {
  return (
    <motion.button
      onClick={onClick}
      className="md:hidden fixed bottom-6 right-6 w-14 h-14 bg-[#1DB954] rounded-full shadow-2xl flex items-center justify-center z-40 hover:bg-[#1ed760] transition-colors"
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.95 }}
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ type: 'spring', stiffness: 260, damping: 20 }}
    >
      <Plus className="w-6 h-6 text-white" strokeWidth={3} />
    </motion.button>
  );
}
