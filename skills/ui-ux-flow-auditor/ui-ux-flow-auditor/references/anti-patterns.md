# UI Anti-patterns (Clichés to Avoid)

As inspired by Paul Bakaus's "Impeccable" project, here are the common UI tropes that AI models often default to. A truly "impeccable" design fights these biases.

## 1. Typography
- **The "Inter" Default**: Avoid using Inter for everything. It's a great font, but overused. Try high-contrast serifs for headers or unique monospaced fonts for technical context.
- **Low Contrast Gray**: Avoid light gray text on white backgrounds. It's hard to read and looks generic. Use proper contrast (at least WCAG AA).

## 2. Layout & Spacing
- **Nested Cards**: Avoid "Card-in-Card-in-Card" layouts. Use negative space, borders, or subtle background shifts instead of constant shadowing.
- **Floating Everything**: Avoid overly rounded floating buttons with heavy drop shadows (the "Material Design 2018" look).

## 3. Color & Contrast
- **The Purple Gradient**: Avoid the "SaaS Purple/Indigo" gradient for every primary action or hero background. Explore earth tones, deep blues, or bold monochromatic palettes.
- **Neon Overkill**: Avoid glowing neon outlines on everything unless it's a specific "Cyberpunk" aesthetic. Use it for feedback, not as a primary layout tool.

## 4. Interaction
- **Skeleton Overuse**: Only use skeleton screens for slow data. For fast data, use immediate transitions or subtle layout shifts.
- **Generic Icons**: Avoid using the standard "Lucide/Heroicons" default set without any styling or unique context.

## 5. Visual "Noise"
- **Glass-morphism Overload**: Don't use backdrop-blur on every single surface. Reserve it for overlays and fixed headers.
- **Generic Mockups**: Avoid using the "iPhone in 3D" mockup for every portfolio/hero section. Show the real UI.
