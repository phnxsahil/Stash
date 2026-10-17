# Complete Stash App - File Export Guide

This document lists ALL files you need to copy to implement Stash in your project.

---

## 📋 File Checklist

### ✅ Required Files (Must Copy)

#### 1. Core App Files
- [ ] `/src/app/App.tsx` - Main application with ThemeProvider wrapper
- [ ] `/src/app/types.ts` - TypeScript type definitions
- [ ] `/src/app/contexts/ThemeContext.tsx` - Theme management context **(NEW)**

#### 2. Services
- [ ] `/src/app/services/apiService.ts` - Simulated backend API

#### 3. Main Components
- [ ] `/src/app/components/LandingView.tsx` - Landing page with theme toggle
- [ ] `/src/app/components/AppView.tsx` - Main dashboard with CTA
- [ ] `/src/app/components/StatsView.tsx` - Stats/Mood Board page
- [ ] `/src/app/components/SettingsView.tsx` - Settings page with theme toggle
- [ ] `/src/app/components/ConfirmationModal.tsx` - Song selection modal
- [ ] `/src/app/components/ProcessingOverlay.tsx` - Loading overlay **(NEW)**
- [ ] `/src/app/components/SongHistory.tsx` - History with search
- [ ] `/src/app/components/LoadingSkeleton.tsx` - Loading state
- [ ] `/src/app/components/ToastContainer.tsx` - Toast notifications
- [ ] `/src/app/components/ThemeToggle.tsx` - Theme toggle button **(NEW)**
- [ ] `/src/app/components/FloatingStashButton.tsx` - Mobile FAB **(NEW)**

#### 4. Styles
- [ ] `/src/styles/tailwind.css` - Custom animations + noise texture
- [ ] `/src/styles/theme.css` - Updated with light/dark mode support
- [ ] `/src/styles/index.css` - Animation keyframes

#### 5. Assets
- [ ] Logo image (use your own or replace the import)

---

## 🎯 New Features Added

### 1. **Dark/Light Mode System** ✅
- **Files**: `ThemeContext.tsx`, `ThemeToggle.tsx`
- **Integration**: Wrap App with `<ThemeProvider>` in `App.tsx`
- **Usage**: Theme persists in localStorage
- **Locations**: Landing page header, Settings page

### 2. **"Stash your first song ✨" CTA** ✅
- **File**: `AppView.tsx`
- **Location**: Shows above the input when history is empty
- **Design**: Gradient background with sparkle emojis

### 3. **Theme Toggle on Landing Page** ✅
- **File**: `LandingView.tsx`
- **Location**: Top-right corner of header
- **Component**: Uses `<ThemeToggle />` component

### 4. **Working Theme Switch in Settings** ✅
- **File**: `SettingsView.tsx`
- **Functionality**: Actually toggles theme using context (not just state)

---

## 📦 Dependencies to Install

```bash
npm install lucide-react motion recharts
# or
pnpm add lucide-react motion recharts
# or
yarn add lucide-react motion recharts
```

---

## 🎨 Key Implementation Details

### Theme System

**1. Wrap your app in ThemeProvider**:
```tsx
// App.tsx
export default function App() {
  return (
    <ThemeProvider>
      <AppContent />
    </ThemeProvider>
  );
}
```

**2. Use theme in components**:
```tsx
import { useTheme } from '../contexts/ThemeContext';

function MyComponent() {
  const { theme, toggleTheme } = useTheme();
  // theme is 'light' or 'dark'
}
```

**3. CSS classes automatically apply**:
```tsx
// The ThemeContext adds .light or .dark to <html>
<div className="bg-[#121212] dark:bg-[#121212] light:bg-white">
  // Automatically switches based on theme
</div>
```

### CTA Banner

Shows when `history.length === 0`:
```tsx
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
      Paste any music link from YouTube, Instagram, or anywhere on the internet
    </p>
  </div>
)}
```

---

## 🗂️ File Contents Summary

### Core Files

#### `/src/app/contexts/ThemeContext.tsx`
- Manages light/dark theme state
- Persists to localStorage
- Applies `.light` or `.dark` class to document root
- Exports `useTheme()` hook

#### `/src/app/components/ThemeToggle.tsx`
- Two variants: `icon` (default) or `button`
- Animated sun/moon icon
- Smooth transitions
- Used in LandingView and SettingsView

#### `/src/app/components/ProcessingOverlay.tsx`
- 3-stage loading: Extracting → Identifying → Syncing
- Rotating borders, pulsing core
- Shimmer progress bar
- Error state variant (red theme)

#### `/src/app/components/FloatingStashButton.tsx`
- Mobile-only FAB at bottom-right
- Springs into view
- Scrolls to input on click

#### `/src/app/components/AppView.tsx` (Updated)
- Added "Stash your first song ✨" CTA
- Shows when history is empty
- Gradient background, centered text

#### `/src/app/components/LandingView.tsx` (Updated)
- Added `<ThemeToggle />` in header
- Positioned top-right

#### `/src/app/components/SettingsView.tsx` (Updated)
- Uses `useTheme()` from context
- Actually toggles theme (not just local state)
- Desktop toggle + mobile button

#### `/src/app/App.tsx` (Updated)
- Wrapped in `<ThemeProvider>`
- Theme-aware background classes
- Exports two components: `AppContent` and `App`

---

## 🎨 Color Palette

### Dark Mode (Default)
```css
Background: #121212
Surface: #1D1D1F
Text Primary: #E5E5E5
Text Secondary: #9CA3AF
Spotify Green: #1DB954
```

### Light Mode
```css
Background: #FFFFFF
Surface: #F3F4F6
Text Primary: #111827
Text Secondary: #6B7280
Spotify Green: #1DB954 (same)
```

---

## 🚀 Quick Start Steps

1. **Copy all files** from the checklist above
2. **Install dependencies**: `npm install lucide-react motion recharts`
3. **Ensure Tailwind CSS v4** is set up
4. **Replace logo import** with your own asset
5. **Run the app**: Theme system works automatically!

---

## 🎯 Testing Checklist

After copying files, test these features:

- [ ] Theme toggle on landing page works
- [ ] Theme toggle in settings works
- [ ] Theme persists after page reload
- [ ] "Stash your first song ✨" shows when history is empty
- [ ] CTA disappears after stashing first song
- [ ] All colors adapt to light/dark mode
- [ ] Processing overlay shows 3 stages
- [ ] Mobile FAB appears on small screens
- [ ] Search functionality works in history
- [ ] Stats view displays correctly
- [ ] Navigation between views works

---

## 📱 Responsive Features

### Mobile (< 768px)
- FAB appears for quick stashing
- Theme toggle: Full-width buttons in Settings
- Simplified navigation
- Touch-friendly tap targets

### Desktop (≥ 768px)
- FAB hidden
- Theme toggle: Switch component in Settings
- Stats and Settings buttons in header
- Wider layouts

---

## 🎨 Custom CSS Classes

### Animations
```css
.animate-fade-in - Fade in from bottom
.animate-shimmer - Background shimmer
.noise-texture - Subtle noise overlay
```

### Theme-Aware
```css
.dark:bg-[#121212] - Dark mode background
.light:bg-white - Light mode background
```

---

## 🔧 Customization Points

### Change Spotify Green
Find and replace all instances of `#1DB954` with your color.

### Change Fonts
Update in `/src/styles/theme.css`

### Change Logo
Replace import in:
- `LandingView.tsx`
- `AppView.tsx`

### Disable Theme Toggle
Remove `<ThemeToggle />` from:
- `LandingView.tsx` header
- Lock theme in `ThemeContext.tsx`

---

## 🎉 What's Included

✅ Complete dark/light mode system
✅ Theme toggle in landing page
✅ Theme toggle in settings (working)
✅ "Stash your first song ✨" CTA
✅ Processing overlay with 3 stages
✅ Mobile floating action button
✅ Search/filter in history
✅ Stats mood board with charts
✅ All animations and transitions
✅ Responsive design
✅ Empty states
✅ Loading states
✅ Error handling
✅ Toast notifications

---

## 📚 File Locations Quick Reference

```
/src/
├── app/
│   ├── App.tsx ⭐ (Updated with ThemeProvider)
│   ├── types.ts
│   ├── contexts/
│   │   └── ThemeContext.tsx ⭐ (NEW)
│   ├── services/
│   │   └── apiService.ts
│   └── components/
│       ├── LandingView.tsx ⭐ (Updated with theme toggle)
│       ├── AppView.tsx ⭐ (Updated with CTA)
│       ├── StatsView.tsx
│       ├── SettingsView.tsx ⭐ (Updated with real theme)
│       ├── ConfirmationModal.tsx
│       ├── ProcessingOverlay.tsx ⭐ (NEW)
│       ├── SongHistory.tsx
│       ├── LoadingSkeleton.tsx
│       ├── ToastContainer.tsx
│       ├── ThemeToggle.tsx ⭐ (NEW)
│       └── FloatingStashButton.tsx ⭐ (NEW)
└── styles/
    ├── tailwind.css ⭐ (Updated with noise texture)
    ├── theme.css ⭐ (Updated with light mode support)
    └── index.css

⭐ = New or Updated files
```

---

## 💡 Pro Tips

1. **Theme Persistence**: Theme is saved to `localStorage` with key `'stash-theme'`
2. **Default Theme**: Dark mode by default (change in `ThemeContext.tsx`)
3. **CTA Timing**: CTA appears immediately when `history.length === 0`
4. **Mobile First**: All components are mobile-first, enhanced for desktop
5. **Animation Performance**: All animations use GPU acceleration via Motion

---

## 🐛 Troubleshooting

### Theme not switching?
- Check `<ThemeProvider>` wraps entire app
- Verify `.light` and `.dark` classes in browser DevTools
- Clear localStorage and retry

### CTA not showing?
- Ensure `history` array is empty
- Check component receives `history` prop

### Imports failing?
- Install dependencies: `lucide-react`, `motion`, `recharts`
- Check file paths match your structure

### Styles not applying?
- Ensure Tailwind CSS v4 is installed
- Check `tailwind.css` is imported
- Verify custom animations are in CSS file

---

**You now have everything needed to implement Stash with full theme support and the new CTA!** 🎉
