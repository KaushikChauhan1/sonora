# SONORA — Design System Specification

**Philosophy:** Premium Light-Glass · Editorial Typography · Immersive Artwork · Restrained Motion  
**Stack Invariant:** Pure Custom CSS · Zero Tailwind · CSS Variables · Physics-based Easing  

---

## 1. Color Palette & Surface Tokens

| Token Name | Value | Purpose |
|---|---|---|
| `--background` | `#F6F4EF` | Primary atmospheric canvas (warm organic bone stone) |
| `--surface` | `#FFFFFF` | Elevated cards, primary content containers |
| `--surface-secondary` | `#EFEEE9` | Inset wells, search bar background, inactive chips |
| `--surface-tertiary` | `#E8E5DE` | Hover states, pill dividers, borders |
| `--text-primary` | `#242321` | High-contrast editorial titles, active lyrics, primary headings |
| `--text-secondary` | `#85827C` | Artist subtitles, upcoming lyrics, timestamps, secondary navigation |
| `--text-muted` | `#A3A09A` | Inactive icons, subtle captions, disabled states |
| `--accent` | `#9A86D8` | Editorial soft lavender accent, primary playhead, active indicators |
| `--accent-hover` | `#8670C9` | Hover state for accent buttons and active links |
| `--accent-subtle` | `rgba(154, 134, 216, 0.12)` | Active chip backgrounds, subtle badge highlights |
| `--border` | `#E8E5DE` | Hairline structural borders, table dividers |
| `--border-focus` | `rgba(154, 134, 216, 0.5)` | High-visibility accessible focus rings |
| `--glass` | `rgba(255, 255, 255, 0.68)` | Base frosted glass for navigation and panels |
| `--glass-elevated` | `rgba(255, 255, 255, 0.85)` | Docked bottom player, lyrics studio floating bar |
| `--glass-border` | `rgba(255, 255, 255, 0.75)` | Subtle specular reflection highlight on glass edges |

---

## 2. Typographic Scale

| Role | Font Family | Weight | Size | Line Height | Tracking |
|---|---|---|---|---|---|
| **Display 1** | `Manrope`, sans-serif | 800 | 40px / 2.5rem | 1.15 | -0.035em |
| **Headline 1** | `Manrope`, sans-serif | 700 | 28px / 1.75rem | 1.25 | -0.025em |
| **Headline 2** | `Manrope`, sans-serif | 600 | 20px / 1.25rem | 1.35 | -0.015em |
| **Body Large** | `Inter`, sans-serif | 500 | 16px / 1rem | 1.5 | -0.01em |
| **Body Regular** | `Inter`, sans-serif | 400 | 14px / 0.875rem | 1.5 | -0.005em |
| **Caption / Label** | `Inter`, sans-serif | 600 | 12px / 0.75rem | 1.4 | 0.02em |
| **Timestamp / Mono** | `Inter`, sans-serif | 500 | 11px / 0.6875rem | 1.3 | 0.04em |

---

## 3. Elevation, Glass & Shadows

```css
/* Glass Material Layers */
--glass-blur-sm: blur(12px);
--glass-blur-md: blur(24px) saturate(160%);
--glass-blur-lg: blur(40px) saturate(180%);

/* Shadows */
--shadow-sm: 0 2px 8px rgba(36, 35, 33, 0.04);
--shadow-md: 0 8px 24px -4px rgba(36, 35, 33, 0.06);
--shadow-lg: 0 16px 40px -8px rgba(36, 35, 33, 0.09);
--shadow-ambient: 0 20px 60px -10px rgba(154, 134, 216, 0.18);
```

---

## 4. Spacing & Geometry Scale

- **Base Grid:** 4px baseline
- **Spacing Units:** `4px`, `8px`, `12px`, `16px`, `24px`, `32px`, `48px`, `64px`
- **Border Radii:**
  - Pills & Badges: `9999px`
  - Small Controls / Chips: `8px`
  - Cards & Inputs: `12px`
  - Modals & Playlists: `16px`
  - Player Bar & Hero Sections: `20px` to `24px`

---

## 5. Animation & Transition Curves

- **Natural Ease:** `cubic-bezier(0.16, 1, 0.3, 1)` (Apple/Spring inspired decelerating curve)
- **Active Word Reveal:** Duration `180ms ease-out`
- **Line Center Scroll:** Duration `450ms cubic-bezier(0.16, 1, 0.3, 1)`
- **Drawer Slide:** Duration `320ms cubic-bezier(0.16, 1, 0.3, 1)`
