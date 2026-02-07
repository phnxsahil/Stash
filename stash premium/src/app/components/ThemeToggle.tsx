import { Sun, Moon } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';
import { motion } from 'motion/react';

interface ThemeToggleProps {
  variant?: 'icon' | 'button';
  className?: string;
}

export default function ThemeToggle({ variant = 'icon', className = '' }: ThemeToggleProps) {
  const { theme, toggleTheme } = useTheme();

  if (variant === 'button') {
    return (
      <button
        onClick={toggleTheme}
        className={`flex items-center gap-2 px-4 py-2 rounded-lg bg-gray-800 dark:bg-gray-800 hover:bg-gray-700 dark:hover:bg-gray-700 transition-colors ${className}`}
        aria-label="Toggle theme"
      >
        {theme === 'dark' ? (
          <>
            <Sun className="w-4 h-4" />
            <span className="text-sm">Light</span>
          </>
        ) : (
          <>
            <Moon className="w-4 h-4" />
            <span className="text-sm">Dark</span>
          </>
        )}
      </button>
    );
  }

  return (
    <motion.button
      onClick={toggleTheme}
      className={`relative w-10 h-10 rounded-full bg-gray-800 dark:bg-gray-800 hover:bg-gray-700 dark:hover:bg-gray-700 transition-colors flex items-center justify-center ${className}`}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      aria-label="Toggle theme"
    >
      <motion.div
        initial={false}
        animate={{
          scale: theme === 'dark' ? 1 : 0,
          opacity: theme === 'dark' ? 1 : 0,
        }}
        transition={{ duration: 0.2 }}
        className="absolute"
      >
        <Moon className="w-5 h-5 text-[#1DB954]" />
      </motion.div>
      <motion.div
        initial={false}
        animate={{
          scale: theme === 'light' ? 1 : 0,
          opacity: theme === 'light' ? 1 : 0,
        }}
        transition={{ duration: 0.2 }}
        className="absolute"
      >
        <Sun className="w-5 h-5 text-[#1DB954]" />
      </motion.div>
    </motion.button>
  );
}
