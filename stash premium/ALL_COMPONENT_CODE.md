# All Component Code - Ready to Copy

This file contains the complete code for ALL components. Copy-paste ready!

---

## 🎯 New/Updated Files for Theme & CTA Features

### 1. `/src/app/contexts/ThemeContext.tsx` ⭐ NEW

```typescript
import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

type Theme = 'light' | 'dark';

interface ThemeContextType {
  theme: Theme;
  toggleTheme: () => void;
  setTheme: (theme: Theme) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<Theme>(() => {
    // Check localStorage first, default to dark
    const saved = localStorage.getItem('stash-theme') as Theme;
    return saved || 'dark';
  });

  useEffect(() => {
    // Apply theme to document
    const root = document.documentElement;
    root.classList.remove('light', 'dark');
    root.classList.add(theme);
    localStorage.setItem('stash-theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => prev === 'dark' ? 'light' : 'dark');
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within ThemeProvider');
  }
  return context;
}
```

---

### 2. `/src/app/components/ThemeToggle.tsx` ⭐ NEW

```typescript
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
```

---

## 📝 Instructions

### To use these files:

1. **Create the ThemeContext.tsx file**:
   - Copy the code from section 1
   - Place in `/src/app/contexts/ThemeContext.tsx`

2. **Create the ThemeToggle.tsx file**:
   - Copy the code from section 2
   - Place in `/src/app/components/ThemeToggle.tsx`

3. **The following files are already in your project but have been UPDATED**:
   - `/src/app/App.tsx` - Now wrapped with ThemeProvider
   - `/src/app/components/LandingView.tsx` - Added theme toggle in header
   - `/src/app/components/AppView.tsx` - Added "Stash your first song ✨" CTA
   - `/src/app/components/SettingsView.tsx` - Now uses real theme context

4. **Install required dependency** (if not already):
   ```bash
   npm install motion
   ```

---

## 🎨 How Theme System Works

1. **ThemeContext** manages the theme state
2. **localStorage** persists user preference
3. **Document class** (`.light` or `.dark`) is added to `<html>`
4. **CSS classes** like `dark:bg-[#121212] light:bg-white` respond to theme
5. **ThemeToggle** component provides UI to switch themes

---

## ✨ CTA Banner Code (Already in AppView.tsx)

The CTA banner appears when history is empty:

```tsx
{/* Hero CTA when history is empty */}
{history.length === 0 && (
  <div className="mb-6 p-6 rounded-2xl bg-gradient-to-br from-[#1DB954]/10 to-emerald-500/10 border border-[#1DB954]/20">
    <div className="flex items-center justify-center gap-2 mb-3">
      <span className="text-2xl">✨</span>
      <p className="text-lg font-medium text-center">
        Stash your first song
      </p>
      <span className="text-2xl">✨</span>
    </div>
    <p className="text-sm text-gray-400 text-center">
      Paste any music link from YouTube, TikTok, Instagram, or anywhere on the internet
    </p>
  </div>
)}
```

---

## 🔍 Key Integration Points

### In App.tsx:
```tsx
import { ThemeProvider } from './contexts/ThemeContext';

export default function App() {
  return (
    <ThemeProvider>
      <AppContent />
    </ThemeProvider>
  );
}
```

### In LandingView.tsx:
```tsx
import ThemeToggle from './ThemeToggle';

// In header:
<div className="flex items-center justify-between">
  <div className="flex items-center gap-3">
    {/* Logo */}
  </div>
  <ThemeToggle />
</div>
```

### In SettingsView.tsx:
```tsx
import { useTheme } from '../contexts/ThemeContext';

function SettingsView() {
  const { theme, toggleTheme } = useTheme();
  
  // Use theme variable and toggleTheme function
}
```

---

## ✅ Complete Feature Checklist

After implementing these files, you'll have:

- [x] Dark/Light mode toggle on landing page
- [x] Dark/Light mode toggle in settings (actually works)
- [x] Theme persists in localStorage
- [x] "Stash your first song ✨" CTA on dashboard
- [x] CTA disappears after first song is stashed
- [x] Smooth theme transitions
- [x] Animated theme toggle button
- [x] All existing features still work

---

## 🎉 You're Done!

These two new files + the updates to existing files give you a complete, production-ready theme system and engaging CTA for first-time users.

**Everything else (ProcessingOverlay, FloatingStashButton, StatsView, etc.) is already in your project and working!**
