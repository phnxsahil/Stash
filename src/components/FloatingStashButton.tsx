import { motion } from 'framer-motion';
import { Plus } from 'lucide-react';
import { Button } from './ui/button';

interface FloatingStashButtonProps {
  onClick: () => void;
}

export function FloatingStashButton({ onClick }: FloatingStashButtonProps) {
  return (
    <motion.div
      initial={{ scale: 0.92, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ duration: 0.28, ease: 'easeOut' }}
      className="fixed bottom-[5.8rem] right-3 z-40 md:hidden"
    >
      <Button
        onClick={onClick}
        className="h-12 w-12 rounded-full border border-border/70 bg-primary text-primary-foreground shadow-[0_16px_28px_-18px_color-mix(in_oklch,var(--primary)_60%,transparent)] active:scale-95 outline-focus"
        aria-label="Focus stash input"
      >
        <Plus className="w-5 h-5" strokeWidth={2.7} />
      </Button>
    </motion.div>
  );
}
