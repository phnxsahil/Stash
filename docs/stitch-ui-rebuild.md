# Approved Stitch UI contract

Approved on October 17, 2026. The export is visual reference material; its demo
scripts and hardcoded data are not application behavior.

## Sources and view mapping

| Reference | Existing destination |
| --- | --- |
| `capture_stash_to_spotify` | `AppView` capture / Home |
| `your_library` | `AppView` library, `HistoryList`, `QuickStats` |
| `stats_sonic_summary` | `StatsPageView` / `StatsView`, mobile |
| `analytics_desktop` | Same Stats view, desktop |
| `settings` | `SettingsView` |
| `stash_brand_logo` | Shared `StashLogo` and PWA icons |
| `obsidian_soundstage/DESIGN.md` | Palette, typography, and spacing reference |

The unused alternatives are `capture_ios_minimal`,
`capture_action_first_variant`, `capture_unified_flow_variant`,
`library_ios_minimal`, and `stats_ios_minimal`.

## Approved adaptations

- Derive light mode from the Obsidian palette; no separate light reference exists.
- Use the desktop Analytics sidebar across Capture, Library, Stats, and Settings.
- Retain Landing, About, Privacy, Help, Processing, and Match layouts and behavior;
  restyle with the shared palette, typeface, logo, and Material Symbols.
- Center secondary pages at a maximum width of 512px.
- Disable unsupported controls and label them “Coming soon.” Hide unsupported
  metrics instead of displaying the export's sample numbers.
- Keep real account details, history, artwork, preferences, and callbacks.
  Connection labels reflect the existing token state rather than claiming sync
  telemetry. Reconnect retains the existing Spotify authentication callback.
- Show existing extra artist statistics and achievements in the expandable
  “More from your Stash” section.

## Shared implementation

- `src/styles/stitch.css`: semantic dark/light tokens, exported type scale,
  spacing, radii, screen styles, safe areas, and reduced motion.
- `src/components/stitch/StashUI.tsx`: exact logo asset, icons, buttons, cards,
  badges, list rows, and coming-soon labels.
- `StashShell.tsx`: sidebar, mobile navigation, account sheet, theme and auto-add.
- `StashIcons.tsx`: compatibility adapters so retained components and Radix
  controls use the same Material Symbols font.
- Fonts are local WOFF2 files; licenses are included. The supplied logo's HTML
  was base64-encoded SVG. `public/stash-logo.svg` decodes that asset unchanged.
- PWA PNGs are browser renders of that SVG. Share-target settings and API/cache
  rules remain intact; the static cache version and branded assets are updated.

## Validation

Each screen was built separately before progressing to the next screen.
The final local regression run passed 9 unit tests and 16 browser tests.
Browser checks cover 390px mobile and 1440px desktop in both themes, with
additional primary-screen checks at 320px and 768px. Isolated fixtures are
explicitly sample data, make no live saves, and are excluded from the production
Vite entry point.

Regression coverage includes validation and failed-submit retention, clipboard
fallback, drafts and filters across tabs, search/filter/sort, delete confirmation
and focus return, empty/loading/error states, pull refresh, reduced motion,
appearance and preference callbacks, disabled controls, and stats image export.

Commands:

```text
npm run build
npm run type-check
node node_modules/vitest/vitest.mjs run
node node_modules/@playwright/test/cli.js test --config artifacts/stitch.playwright.config.ts
```

Live Spotify authentication, recognition, and saves were not exercised; this is
a UI change and those existing handlers were preserved. Real content naturally
differs from the export's illustrative account, track list, and metrics.
