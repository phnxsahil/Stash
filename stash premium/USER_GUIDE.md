# Stash MVP - User Guide

## Welcome to Stash! 🎵

Stash is your personal music discovery companion that bridges the gap between the internet and your Spotify library. Find a song anywhere online, paste the link, and it's instantly saved.

---

## Getting Started

### 1. **Landing Page**
When you first open Stash, you'll see:
- The main tagline: "The internet is the world's radio - It just needs a save button"
- A prominent green "Connect with Spotify" button
- Three simple steps explaining how Stash works
- A teaser for future Apple Music support

**Action:** Click "Connect with Spotify" to begin

---

### 2. **Connecting to Spotify** (Simulated)
- Click the green button
- A simulated connection process will run (500ms)
- You'll be redirected to your dashboard
- A success toast notification will appear

> **Note:** In this MVP, the Spotify connection is simulated. In production, this would trigger a real OAuth flow.

---

## Using the Dashboard

### **Main Interface Elements**

#### Header
- **Stash Logo** - Brand identity
- **Stats Button** (disabled) - Future feature for viewing analytics
- **User Profile** - Shows your initial (S for Sahil)
- **Logout Button** - Return to landing page

#### Stash Form
- **URL Input Field** - Paste any link from YouTube, TikTok, Instagram, etc.
- **Stash Button** - Submit the link for processing
- **Loading State** - Animated spinner appears during processing

#### Settings
- **Auto-add top match toggle** - When enabled, automatically adds the best match without showing the confirmation modal

#### Recently Stashed
- List of songs you've saved
- Each item shows:
  - Album artwork
  - Song title and artist
  - Source platform (YouTube, TikTok, etc.)
  - Share button (disabled - future feature)
  - Delete button (appears on hover)

---

## The Stashing Workflow

### Step 1: Find a Song
Imagine you found a great song on:
- YouTube
- TikTok
- Instagram Reels
- Twitter/X
- Any other platform

### Step 2: Copy the Link
Copy the URL from your browser or the share feature

### Step 3: Paste into Stash
1. Paste the URL into the input field
2. Click "Stash" button
3. Wait for the magic ✨

### Step 4A: Manual Selection (Auto-add OFF)
When matches are found, a modal appears showing:
- **3 potential matches** from Spotify
- **Album artwork** for each match
- **Song title and artist** information
- **Source indicator** (Spotify Match)
- **Play button** - Preview 30 seconds of each track
- **Select button** - Choose the correct match

**Interactions:**
- Click **Play** to preview any song (only one plays at a time)
- Click **Select** to add the song to your library
- Click **Cancel** or press **ESC** to dismiss
- Click the backdrop to close the modal

### Step 4B: Auto-add (Auto-add ON)
- The top match is automatically added
- No modal appears
- Success toast notification shows immediately

---

## Features in Detail

### 🎵 Audio Previews
- Click the Play button on any match to hear a 30-second preview
- The button changes to a Pause icon while playing
- Only one preview plays at a time (others auto-stop)
- Audio stops when you make a selection

### 📝 Song History
- **Loading State:** When first viewing, animated skeleton loaders appear
- **New Songs:** Newly added songs appear at the top with a fade-in animation
- **Sorting:** Most recent songs appear first
- **Hover Effects:** Delete button appears when hovering over a song
- **Empty State:** Helpful message when no songs are stashed yet

### 🗑️ Deleting Songs
1. Hover over any song in your history
2. Click the trash icon that appears
3. The song is removed
4. A confirmation toast appears

### ⚙️ Settings

#### Auto-add Top Match
- **OFF (default):** Shows confirmation modal with all matches
- **ON:** Automatically adds the first match, skipping the modal

**To toggle:**
1. Scroll to the settings section
2. Click the toggle switch
3. A confirmation toast appears

---

## Toast Notifications

Stash uses elegant toast notifications for all feedback:

### Success (Green)
- ✓ Connected to Spotify
- ✓ Song added to library
- ✓ Song removed from history
- ✓ Settings updated

### Error (Red)
- ✗ Failed to connect
- ✗ Invalid URL
- ✗ Failed to load matches
- ✗ Preview playback failed

**Behavior:**
- Appear in bottom-right corner
- Auto-dismiss after 3 seconds
- Can be manually dismissed with the X button
- Slide-in/out animations

---

## Keyboard Shortcuts

- **ESC** - Close the confirmation modal
- **Enter** (in URL input) - Submit the stash form

---

## Future Features (UI Stubs Present)

### 📊 Stats Dashboard
Currently disabled, but the UI is ready for:
- Total number of stashes
- Most used platform
- Most stashed artist
- Weekly/monthly trends

**Location:** Disabled "Stats" button in header

### 🔗 Share Feature
Currently disabled, but each song will have a share button to:
- Share discoveries with friends
- Create shareable links
- Post to social media

**Location:** Disabled share icon on each history item

### 🍎 Apple Music
Coming soon! Integration with Apple Music for iOS users.

**Location:** Teaser on landing page

---

## Simulated Backend

### What's Simulated?
- Spotify OAuth connection
- Song recognition from URLs
- Spotify library updates
- User history persistence
- User preferences storage

### Realistic Delays
- Connection: 500ms
- Song recognition: 1500ms
- Adding track: 800ms
- Loading history: 1000ms
- Updating preferences: 400ms

### Mock Data
The app uses realistic mock data including:
- Real Spotify album artwork URLs
- Popular songs from 2023-2024
- Authentic-looking Spotify track IDs

---

## Tips & Tricks

### Best Practices
1. **Test the previews** before selecting to ensure it's the right version
2. **Enable auto-add** if you're confident in the recognition accuracy
3. **Delete mistakes** quickly - they're just a click away
4. **Wait for the loading state** to complete before pasting a new link

### Common Scenarios

**Scenario:** Wrong song was added
- **Solution:** Hover and click the delete button, then stash again

**Scenario:** Want to compare multiple matches
- **Solution:** Keep auto-add OFF and use the preview feature

**Scenario:** Adding many songs quickly
- **Solution:** Enable auto-add for faster workflow

---

## Responsive Design

Stash works beautifully on all devices:

### Desktop (1024px+)
- Full-width layout
- Side-by-side match comparisons
- Hover states fully visible

### Tablet (768px - 1023px)
- Optimized grid layouts
- Touch-friendly button sizes
- Adjusted spacing

### Mobile (< 768px)
- Stacked vertical layouts
- Larger tap targets
- Simplified navigation
- Full-screen modal

---

## Troubleshooting

### Issue: Toast appears too quickly
- This is expected behavior - toasts auto-dismiss after 3 seconds
- You can click the X to dismiss early if needed

### Issue: Preview won't play
- Simulated previews may not have real audio URLs
- This is expected in the MVP - real previews come with Spotify API integration

### Issue: Can't see delete button
- Make sure you're hovering over the song item
- Delete buttons only appear on hover for a clean interface

### Issue: Modal won't close
- Click the Cancel button
- Press ESC key
- Click outside the modal on the dark backdrop

---

## Technical Details

### Browser Compatibility
- Modern browsers (Chrome, Firefox, Safari, Edge)
- Requires JavaScript enabled
- Uses HTML5 Audio API for previews

### Performance
- Optimized animations (60fps)
- Lazy loading for images
- Minimal re-renders with React

### Data Storage
- Currently in-memory (resets on page refresh)
- Production version will use database persistence

---

## Development Checklist

Based on the AI Prompt Guide, all features are implemented:

✅ Landing page with hero and CTA  
✅ Simulated Spotify connection  
✅ URL stashing form  
✅ Song recognition with matches  
✅ Confirmation modal with previews  
✅ Audio playback controls  
✅ Song history with CRUD operations  
✅ Auto-add setting  
✅ Toast notification system  
✅ Loading states and skeletons  
✅ Responsive design  
✅ Keyboard shortcuts  
✅ Future feature stubs (Stats, Share)  
✅ Dark theme aesthetic  
✅ Smooth animations  

---

## Credits

**Project Lead:** Sahil Sharma  
**Design Inspiration:** Apple Music, Spotify  
**Tech Stack:** React, TypeScript, Tailwind CSS  
**Icons:** Lucide React  

---

## Support

For questions, feature requests, or bug reports:
- Review the STASH_MVP_CHECKLIST.md for technical details
- Check the prompt guide for implementation specifics
- Test in different browsers for compatibility issues

---

**Enjoy discovering and stashing music! 🎵✨**
