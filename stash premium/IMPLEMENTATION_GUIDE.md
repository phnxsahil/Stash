# Stash App - Complete Implementation Guide

This guide provides everything you need to implement the Stash app in your own project.

---

## 📦 Dependencies Required

```json
{
  "dependencies": {
    "lucide-react": "0.487.0",
    "motion": "12.23.24",
    "recharts": "2.15.2",
    "react": "18.3.1",
    "react-dom": "18.3.1"
  },
  "devDependencies": {
    "@tailwindcss/vite": "4.1.12",
    "@vitejs/plugin-react": "4.7.0",
    "tailwindcss": "4.1.12",
    "vite": "6.3.5"
  }
}
```

**Installation commands:**
```bash
npm install lucide-react motion recharts
# or
pnpm add lucide-react motion recharts
```

---

## 🎨 1. CSS Setup

### `/src/styles/tailwind.css`

```css
@import 'tailwindcss' source(none);
@source '../**/*.{js,ts,jsx,tsx}';

/* Custom Animations */
@keyframes fade-in {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes shimmer {
  from {
    background-position: -200% center;
  }
  to {
    background-position: 200% center;
  }
}

.animate-fade-in {
  animation: fade-in 0.5s ease-out;
}

.animate-shimmer {
  animation: shimmer 2s linear infinite;
}

/* Noise Texture Background */
.noise-texture::before {
  content: '';
  position: absolute;
  inset: 0;
  background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E");
  opacity: 0.03;
  pointer-events: none;
  z-index: 1;
}

/* Light mode styles */
.light .noise-texture::before {
  opacity: 0.02;
}
```

---

## 🔧 2. TypeScript Types

### `/src/app/types.ts`

```typescript
export interface Song {
  id: string;
  song: string;
  artist: string;
  source: string;
  album_art_url: string;
  preview_url?: string;
}

export interface AppState {
  isLoggedIn: boolean;
  history: Song[];
  currentMatches: Song[];
  userPreferences: {
    autoAddTopMatch: boolean;
  };
}

export interface Toast {
  id: number;
  message: string;
  type: 'success' | 'error';
}
```

---

## 🎯 3. Theme Context

### `/src/app/contexts/ThemeContext.tsx` (NEW FILE)

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

## 📱 4. Component Files

### Component Structure
```
/src/app/components/
├── AppView.tsx
├── ConfirmationModal.tsx
├── FloatingStashButton.tsx
├── LandingView.tsx
├── LoadingSkeleton.tsx
├── ProcessingOverlay.tsx
├── SettingsView.tsx
├── SongHistory.tsx
├── StatsView.tsx
├── ToastContainer.tsx
└── ThemeToggle.tsx (NEW)
```

---

## 🎨 5. Color Palette Reference

```css
/* Dark Mode Colors */
--background-dark: #121212;
--surface-dark: #1D1D1F;
--text-primary-dark: #E5E5E5;
--text-secondary-dark: #9CA3AF;
--spotify-green: #1DB954;
--spotify-green-hover: #1ed760;

/* Light Mode Colors */
--background-light: #FFFFFF;
--surface-light: #F3F4F6;
--text-primary-light: #111827;
--text-secondary-light: #6B7280;

/* Accent Colors */
--emerald: #10B981;
--purple: #9333EA;
--orange: #F59E0B;
--red: #EF4444;
```

---

## 🔑 6. Key Features & Components

### ProcessingOverlay
- **Purpose**: Shows 3-stage loading animation during song identification
- **Stages**: Extracting → Identifying → Syncing
- **Animations**: Rotating borders, pulsing core, shimmer progress bar
- **Error State**: Red theme variant with error message

### StatsView (Mood Board)
- **Uses**: recharts for pie chart
- **Features**: Animated orbs, genre breakdown, streak tracking
- **Dependencies**: `motion` for animations

### SettingsView
- **Features**: Theme toggle, auto-add toggle, playlist selector
- **Mobile**: Full-width buttons instead of switches

### FloatingStashButton
- **Mobile Only**: FAB at bottom-right
- **Interaction**: Scrolls to input and focuses
- **Animation**: Spring entrance with Motion

### SongHistory
- **Search**: Real-time filtering by song/artist/source
- **Empty State**: Gradient illustration with platform badges
- **Actions**: Delete (visible on hover), Share (disabled)

---

## 🎬 7. Animation Patterns

### Fade In Animation
```tsx
className="animate-fade-in"
```

### Shimmer Effect
```tsx
<motion.div
  className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
  animate={{ x: ['-100%', '200%'] }}
  transition={{ duration: 1.5, repeat: Infinity }}
/>
```

### Floating Orbs
```tsx
<motion.div
  animate={{
    x: [0, 30, 0],
    y: [0, -20, 0],
    scale: [1, 1.1, 1],
  }}
  transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
/>
```

---

## 🎯 8. API Service Structure

### `/src/app/services/apiService.ts`

```typescript
export const apiService = {
  async connectSpotify(): Promise<void>,
  async logoutUser(): Promise<void>,
  async stashUrl(url: string): Promise<Song[]>,
  async addTrack(trackId: string): Promise<void>,
  async getUserHistory(): Promise<Song[]>,
  async updateUserPreferences(prefs: { autoAddTopMatch: boolean }): Promise<void>,
};
```

All methods simulate network delay and return mock data.

---

## 📱 9. Responsive Breakpoints

```css
/* Mobile First */
Default: Mobile (< 640px)

/* Tablet */
md: 768px

/* Desktop */
lg: 1024px

/* Large Desktop */
xl: 1280px
```

### Responsive Patterns Used:
```tsx
{/* Desktop only */}
<div className="hidden md:block">...</div>

{/* Mobile only */}
<div className="md:hidden">...</div>

{/* Responsive grid */}
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3">...</div>
```

---

## 🎨 10. Glass-morphism Pattern

Standard glass card:
```tsx
className="bg-zinc-900/40 backdrop-blur-sm border border-white/5 rounded-2xl"
```

Light mode variant:
```tsx
className="bg-white/40 backdrop-blur-sm border border-gray-200/50 rounded-2xl"
```

---

## 🚀 11. State Management Pattern

```typescript
const [state, setState] = useState<AppState>({
  isLoggedIn: false,
  history: [],
  currentMatches: [],
  userPreferences: {
    autoAddTopMatch: false,
  },
});

// Update pattern
setState(prev => ({
  ...prev,
  history: [newSong, ...prev.history],
}));
```

---

## 🎭 12. View Navigation Pattern

```typescript
type View = 'app' | 'stats' | 'settings';
const [currentView, setCurrentView] = useState<View>('app');

// Conditional rendering
{currentView === 'app' && <AppView ... />}
{currentView === 'stats' && <StatsView ... />}
{currentView === 'settings' && <SettingsView ... />}
```

---

## 🔔 13. Toast System

```typescript
const showToast = (message: string, type: 'success' | 'error') => {
  const newToast: Toast = {
    id: Date.now(),
    message,
    type,
  };
  setToasts(prev => [...prev, newToast]);
};

// Auto-remove after 3 seconds
useEffect(() => {
  if (toasts.length > 0) {
    const timer = setTimeout(() => {
      setToasts(prev => prev.slice(1));
    }, 3000);
    return () => clearTimeout(timer);
  }
}, [toasts]);
```

---

## 🎵 14. Audio Preview Pattern

```typescript
const handlePreviewPlay = (previewUrl: string) => {
  if (currentAudio) {
    currentAudio.pause();
  }
  const audio = new Audio(previewUrl);
  audio.play();
  setCurrentAudio(audio);
  
  audio.onended = () => setCurrentAudio(null);
};
```

---

## 📝 15. Component Props Interfaces

### AppView
```typescript
interface AppViewProps {
  userName: string;
  history: Song[];
  autoAddEnabled: boolean;
  onLogout: () => void;
  onStashSubmit: (url: string) => Promise<void>;
  onDeleteSong: (index: number) => void;
  onToggleAutoAdd: (enabled: boolean) => void;
  onNavigateToStats?: () => void;
  onNavigateToSettings?: () => void;
}
```

### ProcessingOverlay
```typescript
interface ProcessingOverlayProps {
  isOpen: boolean;
  stage?: 'extracting' | 'identifying' | 'syncing' | 'error';
  error?: string;
  onClose?: () => void;
}
```

### StatsView
```typescript
interface StatsViewProps {
  history: Song[];
}
```

### SettingsView
```typescript
interface SettingsViewProps {
  autoAddEnabled: boolean;
  onToggleAutoAdd: (enabled: boolean) => void;
}
```

---

## 🎨 16. Icon Usage (lucide-react)

```typescript
import {
  Music, Download, Fingerprint, Search,
  BarChart3, Settings, Sun, Moon,
  Trash2, Share2, Calendar, Trophy,
  TrendingUp, Music2, Plus, ChevronDown
} from 'lucide-react';

// Usage
<Music className="w-6 h-6 text-[#1DB954]" />
```

---

## 🔧 17. Motion (Framer Motion) Patterns

### Spring Animation
```typescript
<motion.button
  whileHover={{ scale: 1.1 }}
  whileTap={{ scale: 0.95 }}
  initial={{ scale: 0 }}
  animate={{ scale: 1 }}
  transition={{ type: 'spring', stiffness: 260, damping: 20 }}
/>
```

### Rotating Border
```typescript
<motion.div
  animate={{ rotate: 360 }}
  transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
/>
```

### Pulsing Animation
```typescript
<motion.div
  animate={{ scale: [1, 1.05, 1] }}
  transition={{ duration: 2, repeat: Infinity }}
/>
```

---

## 📊 18. Recharts Configuration

```typescript
import { PieChart, Pie, Cell, ResponsiveContainer, Legend } from 'recharts';

const data = [
  { name: 'Pop', value: 35, color: '#1DB954' },
  { name: 'Hip-Hop', value: 25, color: '#9333EA' },
  // ...
];

<ResponsiveContainer width="100%" height={280}>
  <PieChart>
    <Pie
      data={data}
      cx="50%"
      cy="50%"
      innerRadius={60}
      outerRadius={100}
      paddingAngle={2}
      dataKey="value"
    >
      {data.map((entry, index) => (
        <Cell key={`cell-${index}`} fill={entry.color} />
      ))}
    </Pie>
    <Legend />
  </PieChart>
</ResponsiveContainer>
```

---

## 🎯 19. Key Interaction Patterns

### Loading State
```typescript
const [isLoading, setIsLoading] = useState(false);

const handleSubmit = async () => {
  setIsLoading(true);
  try {
    await apiService.stashUrl(url);
  } finally {
    setIsLoading(false);
  }
};
```

### Modal Control
```typescript
const [showModal, setShowModal] = useState(false);

const handleClose = () => {
  setShowModal(false);
  if (currentAudio) {
    currentAudio.pause();
    setCurrentAudio(null);
  }
};
```

### Search/Filter
```typescript
const [searchQuery, setSearchQuery] = useState('');
const [filteredHistory, setFilteredHistory] = useState(history);

useEffect(() => {
  if (searchQuery.trim() === '') {
    setFilteredHistory(history);
  } else {
    const filtered = history.filter(song =>
      song.song.toLowerCase().includes(searchQuery.toLowerCase()) ||
      song.artist.toLowerCase().includes(searchQuery.toLowerCase())
    );
    setFilteredHistory(filtered);
  }
}, [searchQuery, history]);
```

---

## 🎨 20. Empty State Pattern

```tsx
<div className="text-center py-16 space-y-6">
  {/* Gradient Illustration */}
  <div className="relative w-32 h-32 mx-auto">
    <div className="absolute inset-0 rounded-full bg-gradient-to-br from-[#1DB954]/20 to-purple-500/20 blur-xl" />
    <div className="relative w-32 h-32 rounded-full bg-gradient-to-br from-[#1DB954]/10 to-purple-500/10 border border-gray-700 flex items-center justify-center">
      <Search className="w-16 h-16 text-gray-600" />
    </div>
  </div>
  
  <div className="space-y-2">
    <p className="text-lg text-gray-400">No songs stashed yet</p>
    <p className="text-sm text-gray-500">Paste a link above to get started</p>
  </div>
</div>
```

---

## 🔐 21. Local Storage Pattern

```typescript
// Save to localStorage
localStorage.setItem('stash-theme', theme);
localStorage.setItem('stash-preferences', JSON.stringify(preferences));

// Read from localStorage
const theme = localStorage.getItem('stash-theme') || 'dark';
const preferences = JSON.parse(localStorage.getItem('stash-preferences') || '{}');
```

---

## 🎬 22. Processing Workflow

```typescript
const handleStashSubmit = async (url: string) => {
  setShowProcessing(true);
  setProcessingStage('extracting');
  
  try {
    setTimeout(() => setProcessingStage('identifying'), 500);
    setTimeout(() => setProcessingStage('syncing'), 1500);
    
    const matches = await apiService.stashUrl(url);
    setShowProcessing(false);
    
    if (autoAddEnabled) {
      handleSongSelection(0);
    } else {
      setShowModal(true);
    }
  } catch (error) {
    setProcessingStage('error');
    setProcessingError('Failed to identify song');
    setTimeout(() => setShowProcessing(false), 3000);
  }
};
```

---

## 📱 23. Mobile-First Utilities

### Responsive Text
```tsx
className="text-2xl md:text-3xl lg:text-4xl"
```

### Responsive Spacing
```tsx
className="px-4 md:px-6 lg:px-8 py-8 md:py-12"
```

### Responsive Grid
```tsx
className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6"
```

### Hide/Show by Breakpoint
```tsx
className="hidden md:flex" // Desktop only
className="md:hidden" // Mobile only
className="hidden sm:inline" // Tablet+ only
```

---

## 🎯 24. Quick Start Checklist

- [ ] Install dependencies (lucide-react, motion, recharts)
- [ ] Copy CSS files (tailwind.css)
- [ ] Create types.ts
- [ ] Create ThemeContext.tsx
- [ ] Copy all component files
- [ ] Create apiService.ts
- [ ] Set up main App.tsx
- [ ] Add logo asset (or replace with text)
- [ ] Test theme switching
- [ ] Test all interactions

---

## 🚀 25. Deployment Notes

### Environment Variables (for production)
```env
VITE_SPOTIFY_CLIENT_ID=your_client_id
VITE_SPOTIFY_REDIRECT_URI=your_redirect_uri
VITE_API_BASE_URL=your_api_url
```

### Build Command
```bash
npm run build
# or
pnpm build
```

### Production Optimizations
- [ ] Replace mock API with real endpoints
- [ ] Add error boundaries
- [ ] Implement proper authentication
- [ ] Add analytics
- [ ] Set up error logging
- [ ] Enable service worker for PWA

---

## 📚 Additional Resources

- **Motion Docs**: https://motion.dev/docs
- **Recharts Docs**: https://recharts.org/en-US/
- **Lucide Icons**: https://lucide.dev/icons/
- **Tailwind CSS v4**: https://tailwindcss.com/

---

## ✅ Implementation Checklist

When implementing in your project:

1. **Setup Phase**
   - [ ] Install all dependencies
   - [ ] Set up Tailwind CSS v4
   - [ ] Create folder structure
   - [ ] Add custom CSS animations

2. **Core Components**
   - [ ] Theme system (Context + Toggle)
   - [ ] Type definitions
   - [ ] API service layer
   - [ ] Toast system

3. **UI Components**
   - [ ] LandingView
   - [ ] AppView
   - [ ] ProcessingOverlay
   - [ ] ConfirmationModal
   - [ ] SongHistory
   - [ ] StatsView
   - [ ] SettingsView

4. **Features**
   - [ ] Theme switching
   - [ ] Search/filter
   - [ ] Audio preview
   - [ ] Toast notifications
   - [ ] View navigation

5. **Polish**
   - [ ] Animations
   - [ ] Responsive design
   - [ ] Loading states
   - [ ] Error handling
   - [ ] Empty states

---

**That's everything you need! All components follow the same design patterns and can be copied directly into your project. Just ensure you have the dependencies installed and the CSS setup correct.**
