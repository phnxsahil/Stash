# Stash MVP - Implementation Checklist

## Project Overview
**Stash** is a music discovery app that lets users save songs from anywhere on the internet (YouTube, Instagram, etc.) directly to their Spotify library. This is a fully interactive prototype with a simulated backend.

**Project Lead:** Sahil Sharma

---

## ✅ Final UI MVP Checklist

### ✅ Part 1: Frontend Development

#### ✅ 1.1: Project Setup & UI Shell
- ✅ React/TypeScript project structure created
- ✅ Main App component with state management (`/src/app/App.tsx`)
- ✅ Type definitions (`/src/app/types.ts`)
- ✅ Component directory structure (`/src/app/components/`)
- ✅ Tailwind CSS configured
- ✅ Custom animations added (`/src/styles/index.css`)

#### ✅ 1.2: Static Content & Layouts
- ✅ **Landing Page** (`/src/app/components/LandingView.tsx`)
  - ✅ Stash logo and branding
  - ✅ Hero section with tagline: "The internet is the world's radio"
  - ✅ Sub-headline in Spotify Green: "It just needs a save button"
  - ✅ "Connect with Spotify" CTA button
  - ✅ "How It Works" section with 3 numbered steps
  - ✅ "Coming soon to Apple Music" teaser
  - ✅ Footer

- ✅ **App Dashboard** (`/src/app/components/AppView.tsx`)
  - ✅ Header with logo, user profile, Stats button (disabled), and Logout
  - ✅ Core stashing form with URL input and "Stash" button
  - ✅ Loading state with spinner animation
  - ✅ Settings area with "Auto-add top match" toggle
  - ✅ Recently Stashed section
  - ✅ Footer

- ✅ **Song History** (`/src/app/components/SongHistory.tsx`)
  - ✅ Empty state message
  - ✅ Song list with album art
  - ✅ Song info (title, artist, source)
  - ✅ Share button (disabled/stub)
  - ✅ Delete button with hover effect

- ✅ **Confirmation Modal** (`/src/app/components/ConfirmationModal.tsx`)
  - ✅ Modal overlay with backdrop blur
  - ✅ "Is this your song?" title
  - ✅ Song match list with album art
  - ✅ Play/Pause preview buttons
  - ✅ Select buttons
  - ✅ Cancel button

- ✅ **Toast Notifications** (`/src/app/components/ToastContainer.tsx`)
  - ✅ Success/Error toast styles
  - ✅ Auto-dismiss after 3 seconds
  - ✅ Slide-in animation
  - ✅ Manual dismiss option

#### ✅ 1.3: Core Logic & Interactivity
- ✅ **State Management** (`/src/app/App.tsx`)
  - ✅ `isLoggedIn` state
  - ✅ `history` array for stashed songs
  - ✅ `currentMatches` for modal display
  - ✅ `userPreferences` with `autoAddTopMatch` setting
  - ✅ Mock user data

- ✅ **API Service Layer** (`/src/app/services/apiService.ts`)
  - ✅ `connectSpotify()` - Simulates OAuth
  - ✅ `logoutUser()` - Simulates logout
  - ✅ `stashUrl(url)` - Returns mock song matches
  - ✅ `addTrack(trackId)` - Simulates adding to library
  - ✅ `getUserHistory()` - Returns mock history
  - ✅ `updateUserPreferences(prefs)` - Simulates preference update
  - ✅ All functions use realistic network delays
  - ✅ Mock data includes real Spotify album art URLs

- ✅ **View Controller & Auth** (`/src/app/App.tsx`)
  - ✅ `handleConnectSpotify()` - Auth simulation
  - ✅ `handleLogout()` - Logout handler
  - ✅ View switching based on `isLoggedIn` state

- ✅ **Dynamic History Rendering** (`/src/app/components/SongHistory.tsx`)
  - ✅ Empty state handling
  - ✅ Song list rendering with album art
  - ✅ Delete functionality

- ✅ **Core Stash Workflow** (`/src/app/App.tsx`)
  - ✅ `handleStashSubmit()` - Form submission handler
  - ✅ URL validation
  - ✅ Loading state management
  - ✅ Auto-add logic (if setting enabled)
  - ✅ Manual selection modal (if setting disabled)
  - ✅ Error handling with toast notifications

- ✅ **Song Selection** (`/src/app/App.tsx`)
  - ✅ `handleSongSelection()` - Adds song to history
  - ✅ Updates state
  - ✅ Shows success toast
  - ✅ Closes modal
  - ✅ Stops any playing audio

- ✅ **Audio Preview** (`/src/app/App.tsx` & `/src/app/components/ConfirmationModal.tsx`)
  - ✅ `handlePreviewPlay()` - HTML5 Audio API integration
  - ✅ Only one preview plays at a time
  - ✅ Play/Pause toggle
  - ✅ Auto-stop on selection

- ✅ **Settings** (`/src/app/App.tsx`)
  - ✅ `handleToggleAutoAdd()` - Updates preference
  - ✅ Persists to "backend"
  - ✅ Shows confirmation toast

- ✅ **Toast System** (`/src/app/App.tsx`)
  - ✅ `showToast()` - Creates notifications
  - ✅ Auto-remove after 3 seconds
  - ✅ Manual dismiss support
  - ✅ Success/Error variants

---

### ✅ Part 2: Backend Integration

#### ✅ 2.1: API Service Layer
- ✅ Clean separation between UI and data layers
- ✅ All backend functions are placeholders ready for real implementation
- ✅ Console logging for debugging
- ✅ Realistic mock data structures
- ✅ Ready to replace with `fetch()` calls to real endpoints

**Future Backend Integration Points:**
```typescript
// Example: Replace this mock implementation
async stashUrl(url: string): Promise<Song[]> {
  console.log('API: stashUrl()', url);
  await delay(1500);
  return Promise.resolve(mockMatches);
}

// With real API call
async stashUrl(url: string): Promise<Song[]> {
  const response = await fetch('/api/stash', {
    method: 'POST',
    body: JSON.stringify({ url }),
  });
  return response.json();
}
```

---

### ✅ Part 3: Additional Features (UI Stubs)

#### ✅ 3.1: Stats Dashboard Placeholder
- ✅ Stats view component created (`/src/app/components/StatsView.tsx`)
- ✅ Disabled "Stats" button in app header
- ✅ Styled with reduced opacity and disabled cursor
- ✅ Placeholder cards for:
  - Total Stashes
  - Top Platform
  - Most Stashed Artist

#### ✅ 3.2: "Share Your Find" Button Stub
- ✅ Share button added to each history item
- ✅ Visually styled as disabled
- ✅ Uses `Share2` icon from lucide-react
- ✅ Tooltip indicates "Coming soon"

---

## 🎨 Design System

### Color Palette
- **Background:** `#121212` (dark)
- **Surface:** `#1D1D1F` (card backgrounds)
- **Text Primary:** `#E5E5E5` (light)
- **Text Secondary:** `#9CA3AF` (gray-400)
- **Spotify Green:** `#1DB954` (primary action color)
- **Border:** `#374151` (gray-700)

### Typography
- **Font Family:** System font stack (Apple/Spotify aesthetic)
- **Headings:** Semibold, tight tracking
- **Body:** Regular weight

### Spacing
- Consistent use of Tailwind spacing scale
- Generous padding on cards and sections
- Clear visual hierarchy

---

## 📱 Responsive Design
- ✅ Mobile-first approach
- ✅ Responsive grid layouts
- ✅ Adjusted font sizes for mobile/desktop
- ✅ Touch-friendly button sizes
- ✅ Horizontal padding adjustments
- ✅ Modal max-height for mobile viewports

---

## 🎭 Animations

### Implemented Animations
1. **Spin** - Loading spinner
2. **Slide-in-up** - Toast notifications enter
3. **Slide-out-down** - Toast notifications exit
4. **Pulse** - Loading skeletons (future use)
5. **Shimmer** - Loading skeleton effect (future use)

---

## 🗂️ File Structure

```
/src
├── /app
│   ├── App.tsx                          # Main application component
│   ├── types.ts                         # TypeScript type definitions
│   ├── /components
│   │   ├── LandingView.tsx             # Landing page
│   │   ├── AppView.tsx                 # Main dashboard
│   │   ├── SongHistory.tsx             # Song list component
│   │   ├── ConfirmationModal.tsx       # Song selection modal
│   │   ├── ToastContainer.tsx          # Notification system
│   │   └── StatsView.tsx               # Stats placeholder (future)
│   └── /services
│       └── apiService.ts                # Simulated backend API
└── /styles
    └── index.css                        # Custom animations & styles
```

---

## 🚀 Key Features

### Current Features (Fully Functional)
1. ✅ **Landing Page** - Marketing site with CTA
2. ✅ **Spotify Connection** - Simulated OAuth flow
3. ✅ **Song Stashing** - Paste any URL to find songs
4. ✅ **Song Matching** - Shows 3 mock matches
5. ✅ **Audio Preview** - Play 30-second previews
6. ✅ **Song Selection** - Choose the right match
7. ✅ **History Management** - View and delete stashed songs
8. ✅ **Auto-add Setting** - Skip confirmation for top match
9. ✅ **Toast Notifications** - Success/error feedback
10. ✅ **Logout** - Return to landing page

### Future Features (UI Stubs Present)
1. 🔜 **Stats Dashboard** - View stashing analytics
2. 🔜 **Share** - Share discovered songs with friends
3. 🔜 **Apple Music** - Support for Apple Music integration

---

## 🧪 Testing Workflow

### Manual Testing Checklist
- [ ] Landing page loads correctly
- [ ] "Connect with Spotify" shows loading state
- [ ] User is redirected to dashboard after connection
- [ ] Pasting a URL shows loading spinner
- [ ] Modal appears with 3 song matches
- [ ] Audio preview plays/pauses correctly
- [ ] Only one preview plays at a time
- [ ] Selecting a song adds it to history
- [ ] Success toast appears after adding
- [ ] Delete button removes song from history
- [ ] Auto-add toggle works correctly
- [ ] Logout returns to landing page
- [ ] All interactions are responsive on mobile

---

## 📝 Mock Data

### Mock Song Matches
```typescript
{
  id: 'track-1',
  song: 'Blinding Lights',
  artist: 'The Weeknd',
  source: 'Spotify Match',
  album_art_url: 'https://i.scdn.co/image/...',
  preview_url: 'https://p.scdn.co/mp3-preview/...'
}
```

### Mock User History
- Pre-populated with 3 songs on login
- Includes popular tracks from 2023-2024
- Real Spotify album art URLs for high-fidelity prototype

---

## 🔧 Development Notes

### State Management
- Uses React `useState` hooks
- No external state library needed for MVP
- Centralized in `App.tsx`

### API Simulation
- All API calls use `setTimeout` to simulate network latency
- Delays: 500ms (auth), 1500ms (stash), 800ms (add track), 1000ms (history)
- Returns realistic data structures

### Audio Handling
- Native HTML5 `<audio>` API
- No external audio library needed
- Manages single audio instance globally

---

## 🎯 Next Steps (Backend Phase)

1. **Set up Backend Server**
   - Node.js/Express or similar
   - Database (PostgreSQL recommended)

2. **Implement Spotify OAuth**
   - Register app in Spotify Developer Dashboard
   - Implement OAuth 2.0 flow
   - Store access/refresh tokens securely

3. **Build Song Recognition Service**
   - Integrate with music recognition API (e.g., AudD, ACRCloud)
   - Parse URLs from various platforms
   - Match to Spotify tracks

4. **Create API Endpoints**
   - `POST /api/auth/spotify` - OAuth callback
   - `POST /api/stash` - Song recognition
   - `POST /api/tracks` - Add to Spotify library
   - `GET /api/history` - Get user's stash history
   - `PUT /api/preferences` - Update settings

5. **Replace Mock Service**
   - Update `apiService.ts` to call real endpoints
   - Add error handling
   - Implement retry logic

---

## ✨ Design Decisions

### Why Simulated Backend First?
- Faster iteration on UI/UX
- No backend dependencies during design phase
- Easy to demo and gather feedback
- Clear separation of concerns

### Why Dark Theme?
- Matches Spotify/Apple Music aesthetic
- Reduces eye strain for music apps
- Modern, premium feel
- Better for OLED displays

### Why Single-Page App?
- Faster navigation
- Better user experience
- No page reloads
- Easier state management

---

## 📄 License & Credits

**Project Lead:** Sahil Sharma  
**Design Inspiration:** Apple Music, Spotify  
**Icons:** Lucide React  
**Framework:** React + TypeScript + Tailwind CSS

---

**Status:** ✅ MVP UI Complete - Ready for Backend Integration
