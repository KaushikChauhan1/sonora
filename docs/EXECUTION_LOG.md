# SONORA — AUTONOMOUS ENGINEERING EXECUTION LOG

**Project:** SONORA — *Music deserves a better interface.*  
**Architecture:** Autonomous Product Engineering Team  
**Primary Music Ecosystem:** YouTube Music  
**Visual Identity:** Premium Light-Glass Editorial  

---

## Session Overview & Baseline
- **Date/Time:** 2026-11-02
- **Environment:** macOS, Node.js v20.20.2, npm 10.8.2, Python 3.9.6, Apple Git 2.54.0
- **Available Storage:** ~34 GiB
- **Browser Targets:** Google Chrome, Safari, Playwright Headless Chromium

---

## Chronological Phase Execution & Audit Log

### Phase 0: Workspace Discovery & Initialization
- **Status:** COMPLETED
- **Actions Completed:**
  - Verified host operating system, Node, npm, python, git, and storage.
  - Verified system browser installations: `/Applications/Google Chrome.app`, `/Applications/Safari.app`.
  - Initialized local Git repository at `/Users/kaushik/Desktop/sonora`.
  - Created standardized directory layout (`research/`, `docs/`, `design/`, `src/`, `tests/`, `scripts/`, `assets/`).
  - Configured `SONORA` root pointer symlink and `.gitignore` to isolate cloned upstream research repositories.
- **Files Created:**
  - `docs/EXECUTION_LOG.md`
  - `.gitignore`
- **Decisions Made:**
  - Kept upstream research repositories in `research/repositories/` isolated from Sonora's Git history to prevent nested repository index pollution.
  - Standardized on modern Vite + React 18 + TypeScript + Custom CSS (no Tailwind, per strict specification) + Zustand + TanStack Query + Lucide Icons + Vitest + Playwright.

---

### Phase 1: Acquire Open-Source Repositories
- **Status:** COMPLETED
- **Actions Completed:**
  - Built autonomous Python acquisition engine: `scripts/acquire_repositories.py`.
  - Shallow-cloned (`--depth 1`) 30 key reference repositories into `research/repositories/`.
  - Conducted live OSINT verification for ThemeSong (`KristofferTroncoso/ThemeSong`) and Orchard (`SFG5453/Orchard`).
  - Recorded branch, commit SHA, license, and primary language for every project.
- **Key Acquired Repositories:**
  - `better-lyrics` (GPL-3.0), `braccato` (MIT), `composer` (AGPL-3.0), `unison` (AGPL-3.0), `better-lyrics-api` (GPL-3.0), `shaders` (GPL-3.0), `kawarp` (MIT), `rics` (MIT).
  - `orchard` (GPL-3.0), `riff` (MIT), `zuno_music` (Apache-2.0), `lyrenne` (GPL-3.0), `opentune` (MIT), `nixiedesktop` (MIT), `ytm-rs` (GPL-3.0), `riff-muriel` (MIT), `moosik` (GPL-3.0).
  - `ytmusicapi` (MIT), `youtube-js` (MIT), `ytmdesktop2` (CC0 1.0), `ytmdesktop` (GPL-3.0), `youlyplus` (MIT).
  - `lrclib` (MIT), `lrcget` (MIT).
  - `spicetify-cli` (GPL-2.0), `cider` (AGPL-3.0), `feishin` (GPL-3.0), `harmonoid` (PolyForm Strict), `spotx` (MIT), `themesong` (MIT).

---

### Phase 2: Deep Reverse Engineering
- **Status:** COMPLETED
- **Actions Completed:**
  - Reverse-engineered Braccato's parser pipeline (`lrc.ts`, `ttml.ts`, `plain.ts`) and data model (`LyricPart`, `Lyric`, `LyricSyncType`).
  - Audited Braccato Core engine (`engine.ts`, 4483 lines) for word-state calculation, auto-scroll mechanics, and 5-second user-scroll pause/resume behavior.
  - Audited Kawarp (`packages/core/src/index.ts`) for WebGL2 $128 \times 128$ offscreen downsampling, Kawase dual-filter blur, and domain warping.
  - Audited LRCLIB backend (`router.rs`, `lyricsfile.rs`, `get_lyrics_by_metadata.rs`) discovering public, CORS-enabled endpoints (`/api/get`, `/api/search`).
  - Audited ThemeSong for dynamic color extraction and WCAG AAA luminance calculations.

---

### Phase 3: Research & Reuse Reports
- **Status:** COMPLETED
- **Files Created:**
  1. `research/repository-inventory.md`
  2. `research/repository-feature-matrix.md`
  3. `research/lyrics-engine-audit.md`
  4. `research/playback-engine-audit.md`
  5. `research/provider-integration-audit.md`
  6. `research/artwork-and-visual-effects-audit.md`
  7. `research/queue-and-library-audit.md`
  8. `research/ui-ux-audit.md`
  9. `research/security-audit.md`
  10. `research/license-compliance.md`
  11. `research/reuse-strategy.md`

---

### Phase 4: Technical Feasibility Spike
- **Status:** COMPLETED
- **Findings & Strategic Decisions:**
  - Evaluated YouTube IFrame Player API vs raw stream extractors vs injected WebViews.
  - Confirmed raw audio stream extraction violates browser CORS boundaries, requires Node.js runtimes, and triggers bot verification/DRM restrictions.
  - Proved Official YouTube IFrame Player API (`YT.Player`) provides 100% compliant, cross-browser audio playback with full media events.
  - Established the **Capability-Aware Hybrid Engine**: Official embed player + instant deep-link **External Handoff** (`music.youtube.com`).

---

### Phase 5 & 6: Sonora Architecture & Original Design
- **Status:** COMPLETED
- **Actions Completed:**
  - Specified `MusicProvider` contract, `PlaybackState`, and `Lyric` models in `src/types/index.ts`.
  - Implemented pure custom CSS design system (zero Tailwind):
    - `src/styles/variables.css`: Exact tokens (`#F6F4EF`, `#FFFFFF`, `#EFEEE9`, `#242321`, `#85827C`, `#9A86D8`, `#E8E5DE`, glass blur).
    - `src/styles/base.css`, `components.css`, `player.css`, `lyrics.css`.
  - Authored comprehensive `design/DESIGN_SYSTEM.md`.

---

### Phase 7: Lyrics Engine Implementation
- **Status:** COMPLETED
- **Actions Completed:**
  - `src/services/lyrics/parsers/lrcParser.ts`: Standard LRC and Enhanced LRC (`<mm:ss.xx>`) word-level parser.
  - `src/services/lyrics/parsers/ttmlParser.ts`: TTML XML parser.
  - `src/services/lyrics/parsers/plainParser.ts`: Plain text parser.
  - `src/services/lyrics/lrclib.ts`: Live LRCLIB client with fuzzy search fallback.
  - `src/services/lyrics/synchronizer.ts`: Active line calculation, word progress state (`past`, `active`, `upcoming`), and auto-scroll target computation.
  - `src/services/lyrics/index.ts`: Unified multi-tiered lyrics resolver.

---

### Phase 8: Full Implementation & Validation
- **Status:** COMPLETED
- **Sprints Executed:**
  - **Sprint 1 (Foundation):** Vite + React 18 + TS setup, custom CSS design tokens, app shell, sidebar navigation.
  - **Sprint 2 (Search & Metadata):** Curated catalogue (`FEATURED_TRACKS`, `FEATURED_ALBUMS`, `EDITORIAL_PLAYLISTS`), instant search with category filter chips, search history.
  - **Sprint 3 (Playback):** `YouTubeEmbedPlayer.ts`, state machine hooks, docked player bar, timeline scrubber, volume control, YouTube Music handoff.
  - **Sprint 4 (Lyrics):** `LyricsStudio.tsx` full-screen stage, word-by-word animation, auto-scroll, 5s user-scroll pause toast, instrumental pulsing dots.
  - **Sprint 5 (Library & Queue):** `useQueueStore.ts` (priority play next, reorder, advance queue), `useLibraryStore.ts` (liked songs, custom playlists, recent history), `QueueDrawer.tsx`, `LibraryView.tsx`.
  - **Sprint 6 (Visual Polish):** Dynamic ambient canvas backdrop, offscreen image quantizer (`colorExtractor.ts`), responsive mobile navigation bar, keyboard shortcuts.
  - **Sprint 7 (Quality & Validation):**
    - **Vitest Unit Tests:** 12/12 tests passing across 4 test suites in 200ms (`npm test`).
    - **Playwright Browser Tests:** 5/5 scenarios passing (`node scripts/validate_browser.js`).
    - **Visual Captures:** High-resolution screenshots saved to `research/screenshots/` for desktop discover, lyrics studio, queue, search, library, and mobile viewport (375x812 with zero overflow).

---

## Automated Verification Ledger

| Test Suite / Inspection | Command | Target | Result | Evidence |
|---|---|---|---|---|
| **TypeScript Type Check** | `npx tsc --noEmit` | `src/`, `tests/` | **PASS (0 errors)** | Exit code 0 |
| **Vite Production Build** | `npm run build` | Full bundle | **PASS (1.07s)** | `dist/` (JS: 222KB, CSS: 20KB) |
| **Vitest Unit Suite** | `npm test` | `tests/unit/*.test.ts` | **PASS (12/12 passed)** | 4 test suites, 200ms |
| **Browser: Desktop Discover** | `node scripts/validate_browser.js` | 1440x900 Viewport | **PASS** | `research/screenshots/desktop-discover.png` |
| **Browser: Lyrics Studio** | `node scripts/validate_browser.js` | Word-by-word sync | **PASS (84 spans)** | `research/screenshots/desktop-lyrics-studio.png` |
| **Browser: Queue Drawer** | `node scripts/validate_browser.js` | Reorder & up next | **PASS** | `research/screenshots/desktop-queue.png` |
| **Browser: Mobile Responsive** | `node scripts/validate_browser.js` | 375x812 Viewport | **PASS (0 overflow)** | `research/screenshots/mobile-discover.png` |

---

## Blockers & Outstanding Technical Debt
- **Outstanding Blockers:** None.
- **Production Readiness:** Application is fully built, tested, validated with browser screenshots, and ready for deployment.
