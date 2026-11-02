# SONORA — AGENTS.MD (ANTIGRAVITY GOVERNANCE & PROTOCOLS)

This document establishes the architecture, invariants, and operational guidelines for Google Antigravity and AI coding agents working on SONORA.

---

## 1. Project Invariants

- **Application Name:** SONORA
- **Tagline:** *Music deserves a better interface.*
- **Primary Music Ecosystem:** YouTube Music
- **Primary Repository:** `https://github.com/KaushikChauhan1/sonora`
- **Design Aesthetic:** V3.0 Obsidian, Burgundy/Wine, Warm Cream, Champagne Gold. Editorial, immersive, minimalist.

### Color Tokens
- **Background Primary:** `#10090B` (Dark Obsidian)
- **Accent Wine / Crimson:** `#370D16` / `#541421`
- **Warm Cream Core:** `#E8DCC5`
- **Champagne Gold:** `#D9BC91`
- **Champagne Shimmer:** `#FFE6A3`

---

## 2. Architecture & Systems

### Frontend
- **Framework:** React 18 + TypeScript + Vite.
- **State Management:** Zustand stores (`usePlayerStore`, `useQueueStore`, `useLibraryStore`).
- **Icons:** `lucide-react`.

### Playback Engine
- **Headless Embed Container:** In-viewport coordinates (`bottom: 0, left: 0, 4px x 4px, opacity: 0.005`) to prevent Chromium compositor suspension.
- **Dual-Clock Master System:** `masterClockTicker` runs continuously at 50ms intervals while `isPlaying` is true, gently reconciling with YouTube embed timestamps (`>0.35s` differential).

### Lyrics Engine
- **Source:** LRCLIB API with in-memory caching and synthetic word-timing generator for standard LRC lines.
- **Lyrics Studio (Mode C):** Word-by-word progressive letter morphing, champagne-gold glow, starlet particle canvas scattering, auto-scroll with manual scroll pause detection, and timing sync offset adjustments (`[` / `]` hotkeys).

### Backend Bridge
- **Server:** Node.js HTTP server (`server/index.js`).
- **Endpoints:**
  - `GET  /api/health`
  - `GET  /api/session/status`
  - `POST /api/session/connect`
  - `GET  /api/ytm/home`
  - `GET  /api/ytm/liked`
  - `GET  /api/ytm/history`
- **Static Hosting:** In production, serves `dist/` with single-page app fallback routing.

---

## 3. Autonomous Execution Rules for Agents

1. **Test Verification:** Always execute `npm test` before committing. All unit tests must pass.
2. **Build Integrity:** Verify `npm run build` succeeds with zero TypeScript errors.
3. **Security Invariant:** Never commit `.ytm_session.json`, cookies, or user tokens to Git. Keep credentials strictly in gitignored local storage or environment variables.
4. **Execution Log:** Maintain `docs/EXECUTION_LOG.md` with every phase, decision, and test result.
