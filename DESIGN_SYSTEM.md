# SONORA Design System V3.0 — Cinematic Luxury

> "Music deserves a better interface."

SONORA V3.0 transitions completely away from generic light styling into an editorial, immersive, and high-fidelity music experience rooted in dark obsidian, deep wine, crimson depth, warm cream, and champagne gold.

---

## 1. Color Palette & Emotional Tone

| Role | Color Name | Hex / Value | Description |
|---|---|---|---|
| Canvas Background | Dark Obsidian | `#10090B` | Deep nocturnal foundation with warm undertones |
| Secondary Surface | Obsidian Depth | `#160B0D` | Elevated surfaces and containers |
| Tertiary Surface | Obsidian Plum | `#211014` | Card backgrounds and modal backings |
| Wine Accent 1 | Burgundy Wine | `#370D16` | Foundation of glass panels and subtle fills |
| Wine Accent 2 | Blood Red | `#541421` | Active item backgrounds and badge fills |
| Wine Accent 3 | Crimson Flame | `#741D2D` | Scrubbers, primary buttons, accents |
| Wine Accent 4 | Vermilion Red | `#A83245` | Playback glow, hover states |
| Primary Text | Warm Cream | `#E8DCC5` | High-contrast readable typography |
| Display Text | Bright Cream | `#F6EBDD` | Hero titles, active synchronized lyrics |
| Luxe Accent | Champagne Gold | `#D9BC91` | Playheads, active word halos, glitter particles |
| Secondary Text | Muted Cream | `#BBAE9D` | Subtitles, artist names, duration labels |
| Micro / Borders | Deep Taupe | `#82736F` | Inactive icons, subtle divider hairpins |

---

## 2. Glassmorphism Architecture

All primary cards, sidebars, top bars, and player surfaces adhere to the `.glass-panel` specification:

```css
.glass-panel {
  background: rgba(55, 13, 22, 0.62);
  backdrop-filter: blur(26px) saturate(135%);
  -webkit-backdrop-filter: blur(26px) saturate(135%);
  border: 1px solid rgba(232, 220, 197, 0.10);
  border-radius: var(--radius-large);
  box-shadow: 0 16px 48px rgba(0, 0, 0, 0.35);
}
```

---

## 3. Typography Stack

- **Oversized Lyrics & Expressive Display**: `Nunito` (800 / 900 weight)
- **Section Headings & Editorial Titles**: `Plus Jakarta Sans` (600 / 700 / 800 weight)
- **Interface Controls, Metadata & Tables**: `Manrope` (400 / 500 / 600 weight)
- **Artistic Subtitles & Quote Moments**: `Cormorant Garamond` (Italic 500 / 600 weight)

---

## 4. The 3 Adaptive Experience Modes

1. **Mode A: Discover**:
   - Editorial bento grid showcasing `@kaushik.thinks`'s 4 playlists:
     - *Chatpate 💅🏻*
     - *✨🫠💅*
     - *Realise The Beat 👊*
     - *BGM*
   - Featured track hero showcase with quick-play trigger.
   - Recently played & queue quick access.

2. **Mode B: Immersive Player**:
   - Full-bleed cinematic listening theater with rotating vinyl & artwork depth.
   - Dynamic artwork-derived ambient mesh background.
   - Prominent scrubbing bar with champagne playhead.
   - Instant 1-click transition to Lyrics Focus.

3. **Mode C: Lyrics Focus (Lyrics Studio)**:
   - Word-level synchronization with millisecond precision from LRCLIB/LRC.
   - Progressive letter-by-letter reveal animation for active words.
   - Ambient champagne and soft cream glitter particle layer rendered on canvas.
   - Restrained styling for completed words (55% opacity) and upcoming words (28% opacity).
   - Smart auto-scroll with 5-second manual interaction lock.

---

## 5. Mobile & Responsive Layout Standards

- Minimum tap target: **44px x 44px** on touch devices.
- Fluid fluid clamp scaling for font sizes and margins.
- Bottom sheet drawer for queue and settings on mobile.
- Docked player transforms seamlessly into a compact floating pill on small viewports.
