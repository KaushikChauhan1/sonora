# SONORA — Reuse Strategy & Architecture Decisions

This document codifies the technical strategy for each capability domain required to build SONORA, mapping directly to the five required reuse tiers:

- **Tier A:** Reuse directly
- **Tier B:** Integrate through a package or adapter
- **Tier C:** Independently reimplement
- **Tier D:** Study for architectural inspiration
- **Tier E:** Reject

---

## 1. Domain-by-Domain Strategy

### 1.1 Lyrics Synchronization & Parsing
- **Format Parsers (LRC, Enhanced LRC, TTML, Plain):** **Tier B/C**  
  *Decision:* Implement a clean, native TypeScript parser module under `src/services/lyrics/parsers/` inspired by Braccato's MIT-licensed parsing grammar. Avoids bulky external dependencies while delivering millisecond precision for both line-level and word-level `<mm:ss.xx>` timestamps.
- **Lyrics Providers (LRCLIB Integration):** **Tier A/B**  
  *Decision:* Connect directly to the official, CORS-enabled LRCLIB REST API (`https://lrclib.net/api/get` and `/api/search`) using an adapter with local IndexedDB caching and fallback support.
- **Playback Drift & Auto-Scroll Engine:** **Tier C**  
  *Decision:* Implement an independent high-performance `requestAnimationFrame` timing clock that interpolates the YouTube player's position, computes active words at 60fps, and centers the active line with user-scroll override detection (5s pause before auto-resuming).

### 1.2 Music Playback & Audio Pipeline
- **Playback Engine:** **Tier B**  
  *Decision:* Integrate the official YouTube IFrame Player API (`window.YT.Player`) encapsulated in a dedicated provider adapter (`src/providers/youtube-embed/`). Ensures cross-browser stability without violating terms or requiring binary scrapers.
- **External Provider Handoff:** **Tier C**  
  *Decision:* Native handoff adapter generating deep links to `https://music.youtube.com/watch?v=${videoId}` whenever playback is restricted or when the user prefers the official client.
- **Raw Stream Decryption / Node Extractors (YouTube.js, ytmusicapi):** **Tier D/E**  
  *Decision:* Rejected for direct browser playback due to CORS blocks, n-sig throttling, and TOS violations. Studied for API request structure and metadata field mapping.

### 1.3 Discovery, Metadata & Search
- **Curated Discover Feed:** **Tier C**  
  *Decision:* Native high-fidelity catalog of popular music, trending releases, artist profiles, and editorial mood playlists bundled directly into the client.
- **Live Search Suggestions:** **Tier B/C**  
  *Decision:* Debounced query engine querying public YouTube Music suggestion endpoints with CORS proxy / JSONP fallbacks and rich local fuzzy matching.
- **Metadata Caching:** **Tier C**  
  *Decision:* IndexedDB-backed LRU cache for search results, artist details, and album tracklists.

### 1.4 Dynamic Artwork & Visual Atmosphere
- **Fluid Album Art Backdrop:** **Tier B/C**  
  *Decision:* Adapt Kawarp's MIT-licensed WebGL2 / Canvas Kawase blur algorithm into a standalone, lightweight React component (`AmbientArtworkBackdrop.tsx`) that downsamples artwork to $128 \times 128$, keeping GPU overhead < 3%.
- **Color Extraction:** **Tier C**  
  *Decision:* Native Canvas 2D image quantizer that extracts dominant, secondary, and accent colors from artwork and dynamically computes WCAG-compliant light-glass CSS variables.
- **Better Lyrics Shaders (Plasmo/GLSL):** **Tier D**  
  *Decision:* Studied for shader lighting aesthetics; reimplemented cleanly in vanilla WebGL/Canvas to avoid Plasmo extension dependencies.

### 1.5 Queue & Library Organization
- **Non-destructive Queue Engine:** **Tier C**  
  *Decision:* Zustand store (`useQueueStore`) supporting priority play-next, drag-and-drop reordering, history stack, and Fisher-Yates shuffle with reversible permutation mapping.
- **Personal Library Storage:** **Tier C**  
  *Decision:* IndexedDB storage engine (`src/services/storage/`) providing offline-persistent Liked Songs, custom playlist creation, recent play history, and JSON export/import.

---

## 2. Summary of Component Tiers

| Component | Target Location | Selected Strategy | Rationale |
|---|---|---|---|
| **LRC/TTML Parser** | `src/services/lyrics/parsers/` | **Tier B/C** | Clean-room implementation of Braccato's specification. |
| **LRCLIB Provider** | `src/services/lyrics/lrclib.ts` | **Tier A/B** | Public, CORS-friendly, zero-cost synchronized lyrics source. |
| **YouTube Embed Player** | `src/providers/youtube-embed/` | **Tier B** | Official, compliant, universally compatible browser playback. |
| **External Handoff** | `src/providers/handoff/` | **Tier C** | Seamless fallback link generation to YouTube Music. |
| **Ambient Backdrop** | `src/components/player/AmbientBackdrop.tsx` | **Tier B/C** | Kawarp-inspired high-efficiency canvas blur. |
| **Color Quantizer** | `src/utils/colorExtractor.ts` | **Tier C** | Lightweight HTML5 Canvas 2D dominant color extractor. |
| **Queue Manager** | `src/stores/useQueueStore.ts` | **Tier C** | Reversible shuffle, priority queue, full drag-and-drop. |
| **Library & Playlists** | `src/stores/useLibraryStore.ts` | **Tier C** | Offline-first IndexedDB persistence. |
| **Light-Glass Design System** | `src/styles/` | **Tier C** | Pure custom CSS tokens, Inter + Manrope typography, zero Tailwind. |
