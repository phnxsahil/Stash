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
      className="md:hidden fixed bottom-20 right-5 z-40"
    >
      <Button
        onClick={onClick}
        className="w-14 h-14 rounded-full bg-primary text-primary-foreground border border-border/70 shadow-[0_16px_28px_-18px_color-mix(in_oklch,var(--primary)_60%,transparent)] active:scale-95 outline-focus"
        aria-label="Focus stash input"
      >
        <Plus className="w-6 h-6" strokeWidth={2.7} />
      </Button>
    </motion.div>
  );
}
