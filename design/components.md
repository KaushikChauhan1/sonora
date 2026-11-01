# SONORA V3.0 — Component Specifications

## 1. Glass Panel (`.glass-panel`)
The foundational surface container throughout SONORA V3.0.
- **Background**: `rgba(55, 13, 22, 0.62)` (Dark wine transparency)
- **Backdrop Filter**: `blur(26px) saturate(135%)`
- **Border**: `1px solid rgba(232, 220, 197, 0.10)` (Hairline warm cream)
- **Border Radius**: `var(--radius-large)` (24px to 28px)
- **Box Shadow**: `0 16px 48px rgba(0, 0, 0, 0.35)`
- **Hover State**: Border shifts to `rgba(217, 188, 145, 0.22)`, subtle transform `translateY(-2px)`, shadow increases to `0 20px 54px rgba(0, 0, 0, 0.45)`.

## 2. Docked Player Bar (`.docked-player-bar`)
Persistent audio controller anchored to viewport bottom.
- **Background**: `rgba(16, 9, 11, 0.90)` (Dark obsidian with heavy blur)
- **Backdrop Filter**: `blur(32px) saturate(140%)`
- **Top Border**: `1px solid rgba(232, 220, 197, 0.08)`
- **Artwork Thumb**: 56x56px rounded-medium (14px) with subtle inset border.
- **Track Metadata**:
  - Title: Plus Jakarta Sans 14px bold, `#F6EBDD`
  - Artist: Manrope 12px medium, `#BBAE9D`
- **Scrubber / Progress Bar**:
  - Height: 4px default, 6px on hover
  - Track: `rgba(232, 220, 197, 0.12)`
  - Filled: Gradient from `#741D2D` to `#D9BC91` (Crimson to Champagne)
  - Thumb: 12px champagne gold sphere with subtle glow
- **Controls**:
  - Play/Pause: 44px circular button with wine background (`#370D16`), champagne icon, glowing border on hover.
  - Secondary (Shuffle, Previous, Next, Repeat): 36px icon buttons with `#E8DCC5` color, hover brightness.

## 3. Immersive Player (Mode B)
Full-viewport cinematic listening theater.
- **Hero Artwork Presentation**:
  - 380px to 460px square with 28px border radius.
  - Deep drop shadow: `0 32px 80px rgba(0, 0, 0, 0.65)`.
  - Ambient glow behind artwork using dynamic color extraction.
- **Typographic Hierarchy**:
  - Track Title: Plus Jakarta Sans / Nunito 36px-48px bold (`--cream-bright`)
  - Artist: Manrope 20px medium (`--champagne`)
  - Album / Editorial Subtitle: Cormorant Garamond 18px italic (`--muted-cream`)
- **Mode Navigation**:
  - Instant toggle button to switch into Mode C (Lyrics Focus) or Mode A (Discover).

## 4. Lyrics Studio (Mode C - Signature Feature)
Word-level and line-level synchronization listening room.
- **Canvas Stage**: Full-screen ambient wine-red mesh with active track artwork darkened to 15% opacity in background.
- **Lyrics Typography**:
  - Font: Nunito 800 (Extra Bold)
  - Active line font size: `clamp(2.2rem, 4.5vw, 3.8rem)`
  - Inactive lines font size: `clamp(1.4rem, 2.8vw, 2.2rem)`
- **Word States**:
  - *Completed Word*: `#E8DCC5` at 0.55 opacity.
  - *Active Word*: `#F6EBDD` (Bright Warm Cream) with Champagne Glow (`0 0 32px rgba(217, 188, 145, 0.35)`).
  - *Upcoming Word*: `#E8DCC5` at 0.28 opacity.
- **Progressive Letter Reveal**:
  - Active word's characters animate with smooth alpha/scale as playback advances through the word duration.
- **Glitter / Particle Layer**:
  - HTML5 Canvas overlay rendering subtle champagne gold (`#D9BC91`) and soft cream (`#E8DCC5`) micro-particles around the active line.
  - Respects `prefers-reduced-motion` and user settings.
- **Auto-Scroll Behavior**:
  - Active line smoothly centered in viewport (`block: 'center', behavior: 'smooth'`).
  - Manual scroll pauses auto-centering for 5 seconds before gently resuming.

## 5. Mode Switcher
Three prominent modes easily accessible via top bar or player controls:
1. **Discover** (Mode A): Curated playlists, albums, bento grid, personal library.
2. **Player** (Mode B): Cinematic album art, full controls, visualizer.
3. **Lyrics** (Mode C): Immersive word-synced lyrics with champagne glow.
