# SONORA — UI/UX Design Audit & Experience Architecture

## 1. Executive Summary

Existing streaming web clients suffer from visual clutter, low typography fidelity, and dark-mode monotony. 
SONORA defines an independent aesthetic identity: **Editorial Light-Glass**. 
This audit establishes the UX principles, layout hierarchy, and interaction mechanics.

---

## 2. Core Aesthetic Foundations

### 2.1 The Anti-AI-Slop Directive
- **No Generic Purple/Cyan Gradients:** Eliminated in favor of an organic `#F6F4EF` stone canvas, clean glass panels, and an intentional lavender-slate accent (`#9A86D8`).
- **No Dead Controls:** Every button, tab, card, chip, and slider in SONORA is connected to live application state or provides clear functional feedback.
- **No Uniform Glowing Cards:** Distinct surfaces use subtle contrast and variable elevation (`--shadow-subtle`, `--shadow-elevated`) rather than identical glowing borders.
- **Authentic Domain Content:** Complete with real artist profiles, high-resolution album photography, accurate track metadata, and real synchronized lyrics.

### 2.2 Typographic Hierarchy
- **Editorial Headings:** **Manrope** (Variable, 600–800 weight, -0.03em tracking). Imparts warm, modern editorial distinction akin to high-end lifestyle publications.
- **Interface & Data:** **Inter** (Variable, 400–600 weight, -0.01em tracking). Ensures crisp legibility for track names, metadata tables, timestamps, and controls.

---

## 3. Screen Architecture & Information Architecture

### 3.1 Discover
- **Editorial Hero Banner:** Large feature card showcasing curated releases with ambient artwork reflection.
- **Recently Played Shelf:** Horizontal fluid scroll of recently enjoyed tracks with instant play triggers.
- **Trending & Featured Albums:** Bento-grid layout highlighting artwork fidelity with subtle hover parallax.
- **Mood & Genre Collections:** Curated pills (e.g. Focus, Ambient, Deep Groove, Indie Sunrise).

### 3.2 Search
- **Instant Debounced Query:** Live results appear within 150ms of typing.
- **Category Filter Chips:** `All`, `Tracks`, `Albums`, `Artists`, `Playlists`.
- **Search History:** Recent search terms saved in local storage with one-click replay and quick deletion.

### 3.3 Now Playing & Docked Bar
- **Docked Player Bar (Bottom):** Fixed 80px high glass bar (`backdrop-filter: blur(24px)`) persistent across all routes.
  - Left: Artwork thumbnail, title, artist, like button.
  - Center: Scrubber progress bar, current time / total time, play/pause, prev, next, shuffle, repeat.
  - Right: Volume slider, lyrics drawer trigger, queue drawer trigger, full-screen trigger, external YouTube Music handoff.
- **Expanded Now Playing View:** Cinematic viewport centering full-bleed album artwork (up to 440px), track details, and ambient lighting glow.

### 3.4 Lyrics Studio (The Hero Feature)
- **Word-by-Word Highlighting:** Active words illuminate in bold `#242321` while upcoming words remain soft `--text-secondary` (`#85827C`).
- **Smooth Center Focus:** Automatically tracks the active line with physics-based smooth scrolling.
- **Romanization & Translation:** Transliterated lyrics and translations render in aligned sub-lines.
- **Full-Screen Stage:** Expands into a distraction-free karaoke-grade visual experience with full ambient backdrop animation.

### 3.5 Library
- **Segmented Tabs:** `Liked Songs`, `Playlists`, `Albums`, `History`.
- **Custom Playlists:** Modal dialog to create new playlists, add songs, and manage track ordering.
- **Liked Songs Hub:** Instant one-click favoriting with total count and continuous playback.

### 3.6 Queue Drawer
- **Persistent Slide-Over:** Slides in from the right edge with a frosted glass backdrop.
- **Current & Up Next Segments:** Clear visual delineation between the active track and upcoming songs.
- **Drag & Drop / Reordering:** Reorder upcoming songs, remove individual tracks, clear queue, or shuffle.

---

## 4. Responsive Viewport Strategy
- **Desktop (1024px – 1920px):** Permanent 240px sidebar navigation, expansive bento grids, side-docked drawers.
- **Tablet (768px – 1023px):** Compact 72px icon sidebar, 2-column album cards, fluid docked player.
- **Mobile (< 768px):** Clean bottom navigation bar (Discover, Search, Library), full-width card lists, compact 64px docked player, expandable full-screen player modal. All touch tap targets meet the 44px minimum accessibility standard.
