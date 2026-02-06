# Stash Logo Guide

## Logo Placeholders

The Stash app currently uses placeholder logos in the following locations:

### Desktop Version
- **Header Logo**: Top-left corner of the app
  - Size: 40x40px
  - Location: `/components/LandingView.tsx` and `/components/AppView.tsx`
  - Current: Green gradient box with Radio icon
  - Replace with: Your custom logo SVG or image

### Mobile Version
- **Header Logo**: Top-left corner (smaller size)
  - Size: 32x32px
  - Location: Same components as desktop
  - Current: Green gradient box with Radio icon
  - Replace with: Your custom logo SVG or image (responsive)

### PWA Icons
To complete the PWA setup, add these icon files to the `/public` folder:

1. **icon-192.png** (192x192px)
   - Used for: Android home screen, splash screen
   - Format: PNG with transparent or solid background

2. **icon-512.png** (512x512px)
   - Used for: High-res displays, PWA install
   - Format: PNG with transparent or solid background

3. **favicon.ico** (optional)
   - Used for: Browser tab icon
   - Format: ICO or PNG
   - Size: 32x32px or 16x16px

## Design Guidelines

### Color Palette
- **Primary Green**: #1DB954 (Spotify Green)
- **Gradient**: #1DB954 to #1ed760
- **Background**: #000000 (Black)
- **Text**: #FFFFFF (White) / #E5E5E5 (Gray)

### Logo Recommendations
- Keep it minimal and recognizable
- Should work well on dark backgrounds
- Consider using the Radio/Music wave icon theme
- Maintain square aspect ratio for icons
- Include sufficient padding (safe area)

## Implementation

To replace the placeholder logo:

1. Add your logo file to `/public/` folder
2. Update the logo component in both:
   - `/components/LandingView.tsx` (line ~20)
   - `/components/AppView.tsx` (line ~85)

Example replacement:
```tsx
// Replace this:
<div className="w-10 h-10 rounded-lg bg-gradient-to-br from-[#1DB954] to-[#1ed760] flex items-center justify-center">
  <Radio className="w-6 h-6 text-black" />
</div>

// With this:
<img 
  src="/your-logo.png" 
  alt="Stash Logo" 
  className="w-10 h-10 rounded-lg"
/>
```

## PWA Manifest

The manifest.json is located at `/public/manifest.json`

Update the icon paths once you add your PNG files:
```json
{
  "icons": [
    {
      "src": "/icon-192.png",
      "sizes": "192x192",
      "type": "image/png"
    },
    {
      "src": "/icon-512.png", 
      "sizes": "512x512",
      "type": "image/png"
    }
  ]
}
```
