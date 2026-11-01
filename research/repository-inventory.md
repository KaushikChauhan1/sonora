# SONORA — Open-Source Repository Inventory

This inventory documents all 34 open-source reference repositories audited as part of the SONORA autonomous engineering process, spanning lyrics synchronization engines, YouTube Music clients, streaming integrations, LRC servers, and media player design systems.

| Project | URL | Clone Status | Default Branch | Commit SHA | License | Main Language | Architecture | Relevant Capabilities | Reuse Decision |
|---|---|---|---|---|---|---|---|---|---|
| **Better Lyrics** | `https://github.com/better-lyrics/better-lyrics` | Acquired | `master` | `8b52c070` | GPL-3.0 | TypeScript | Browser Extension (MV3) + Injection Engine | Word sync, auto-scroll, romanization, drift tracking | **D** (Architectural study for sync algorithms) |
| **Braccato** | `https://github.com/better-lyrics/braccato` | Acquired | `master` | `5740449a` | MIT | TypeScript | Multi-package Monorepo (Parsers + Core) | Fast LRC/TTML/QRC parsers, word-by-word data structures, active word state machine | **B** (Clean-room adaptation of parser & data model) |
| **Composer** | `https://github.com/better-lyrics/composer` | Acquired | `master` | `661921bb` | AGPL-3.0 | TypeScript / React | React SPA Lyric Editor + Audio Waveform | Manual timing adjustment, word slicing, syllable markers | **D** (Study for Lyrics Studio timing inspector) |
| **Unison** | `https://github.com/better-lyrics/unison` | Acquired | `master` | `440cdd42` | AGPL-3.0 | TypeScript | Elysia / Bun Backend | Lyrics crowdsourcing, diffing, S3 storage | **D** (Study for synchronization payload schema) |
| **Better Lyrics API** | `https://github.com/better-lyrics/api` | Acquired | `master` | `b1bf2c92` | GPL-3.0 | Go | Cloudflare Workers / Go Microservice | Fast lookup cache, token verification | **E** (Out of scope for client-first web app) |
| **Better Lyrics Shaders** | `https://github.com/better-lyrics/shaders` | Acquired | `master` | `89c8cc25` | GPL-3.0 | TypeScript / GLSL | Plasmo Extension + WebGL Shaders | Dynamic liquid background, color sampling | **D** (Inspiration for light-glass backdrop) |
| **Kawarp** | `https://github.com/better-lyrics/kawarp` | Acquired | `master` | `bb914faf` | MIT | TypeScript / WebGL | WebGL2 Kawase Blur & Domain Warper | Real-time fluid album art background, 128x128 downsampling | **B/C** (Direct integration & canvas shader adaptation) |
| **RICS** | `https://github.com/better-lyrics/rics` | Acquired | `master` | `1416d420` | MIT | TypeScript | Client-side Romanization Engine | Japanese, Korean, Chinese pinyin/romaji transliteration | **C** (Independent phonetic mapping module) |
| **Orchard** | `https://github.com/SFG5453/Orchard` | Acquired | `master` | `572ff17a` | GPL-3.0 | Rust / React | Tauri Desktop Music Client | Queue manager, audio processing, audio graphs | **D** (Queue management & playback architecture) |
| **Riff** | `https://github.com/rootscripts/riff` | Acquired | `main` | `860b3276` | MIT | JavaScript | Electron Client + Local Express Server | YouTube audio pipeline, RTL lyrics support, audio visualizers | **C/D** (Study for audio lifecycle & RTL display) |
| **Zuno** | `https://github.com/BitOpenCode/zuno_music` | Acquired | `main` | `78d58c2a` | Apache-2.0 | TypeScript / React | Tauri Music Player | Mini-player mode, system tray, audio preferences | **D** (UI state transitions & mini-player layout) |
| **Lyrenne** | `https://github.com/Doctordefector/Lyrenne` | Acquired | `main` | `3ec6bbb5` | GPL-3.0 | Python / QML | Linux Desktop Player | Offline library parsing, metadata tagger | **D** (Tag caching and fallback strategy) |
| **OpenTune** | `https://github.com/harshitethic/OpenTune` | Acquired | `main` | `e1c3d9ae` | MIT | Dart / Flutter | Mobile Music Client | In-memory stream caching, local SQLite library | **D** (Study for local-first library schemas) |
| **Nixie Desktop** | `https://github.com/NixiePlayer/NixieDesktop` | Acquired | `main` | `ad2296e1` | MIT | TypeScript / React | Electron + TanStack Router + Tailwind | Modern navigation shell, command palette | **D** (Study for route hierarchy & shortcuts) |
| **ytm-rs** | `https://github.com/grapedjuice/ytm-rs` | Acquired | `main` | `e49afc22` | GPL-3.0 | Rust | CLI / TUI Player | InnerTube reverse engineering, token auth | **D** (API protocol analysis) |
| **Muriel** | `https://github.com/cloverscripts/riff-muriel` | Acquired | `main` | `2df82f51` | MIT | JavaScript | Fork of Riff with Tone.js integration | HLS audio pipeline, custom audio nodes | **D** (Audio state transitions) |
| **Moosik** | `https://github.com/AtotheY/moosik` | Acquired | `main` | `1cb48826` | GPL-3.0 | Rust | Desktop Music Player | SQLite local database, playlist sync | **D** (IndexedDB schema reference) |
| **ytmusicapi** | `https://github.com/sigma67/ytmusicapi` | Acquired | `main` | `4da34b68` | MIT | Python | Reverse-engineered YouTube Music API | Comprehensive endpoint signatures, search types, album parsers | **C** (Reimplementation of search/browse query schema) |
| **YouTube.js** | `https://github.com/LuanRT/YouTube.js` | Acquired | `main` | `09a459b8` | MIT | TypeScript | Full InnerTube client for Node/Browser | Innertube protobuf parser, music search, watch endpoints | **C/D** (Study for response payload transformation) |
| **YTMDesktop2** | `https://github.com/Venipa/ytmdesktop2` | Acquired | `master` | `0e7879bf` | CC0 1.0 | TypeScript | Monorepo Electron Client | Plugin architecture, local REST control API | **D** (Plugin & provider decoupling) |
| **YouTube Music Desktop App** | `https://github.com/ytmdesktop/ytmdesktop` | Acquired | `development` | `bb348309` | GPL-3.0 | TypeScript / Vue | Electron Wrapper + Injected Scripts | Discord RPC, media keys, custom CSS themes | **D** (CSS override patterns and media controls) |
| **YouLyPlus** | `https://github.com/ibratabian17/YouLyPlus` | Acquired | `main` | `6437a3e1` | MIT | JavaScript | Chrome Extension | Live DOM scraping of YouTube Music lyrics | **D** (Study for edge-case timing errors) |
| **LRCLIB** | `https://github.com/tranxuanthang/lrclib` | Acquired | `main` | `e1d863af` | MIT | Rust / Axum | Public Lyrics REST API + SQLite DB | CORS-friendly synced & word-synced lyrics endpoint (`/api/get`, `/api/search`) | **A/B** (Direct integration as primary lyrics provider) |
| **LRCGet** | `https://github.com/tranxuanthang/lrcget` | Acquired | `main` | `0ced5357` | MIT | Vue / Tauri | Batch LRC Fetcher & Matcher | Levenshtein matching, fuzzy track resolution | **C** (Independent metadata normalization & scoring) |
| **Spicetify CLI** | `https://github.com/spicetify/cli` | Acquired | `main` | `cf2081f4` | GPL-2.0 | Go / JS | Client Modding Framework | Theming tokens, CSS variable injection | **D** (Theme token architecture) |
| **Cider** | `https://github.com/ciderapp/Cider` | Acquired | `main` | `953bb5a9` | AGPL-3.0 | JavaScript | Electron Apple Music Client | Glassmorphic visual polish, audio spatialization, audio routing | **D** (Inspiration for premium light-glass aesthetic) |
| **Feishin** | `https://github.com/jeffvli/feishin` | Acquired | `development` | `76fa20e0` | GPL-3.0 | TypeScript / React | Subsonic / Navidrome Client | Mantine UI, virtualized track tables, queue drawer | **D** (Queue virtualization and table layout patterns) |
| **Harmonoid** | `https://github.com/harmonoid/harmonoid` | Acquired | `master` | `2b021f7b` | PolyForm Strict | Dart / Flutter | Cross-platform Local Music Player | Fluent design, animation curves, strict UI layout | **D** (Visual layout hierarchy and spacing guidelines) |
| **SpotX** | `https://github.com/SpotX-Official/SpotX` | Acquired | `main` | `c069546b` | MIT | PowerShell/Bash | Spotify Client Patcher | UI ad-hiding CSS injection | **E** (Out of scope; violates non-circumvention rules) |
| **ThemeSong** | `https://github.com/KristofferTroncoso/ThemeSong` | Acquired | `main` | `f28ac691` | MIT | TypeScript / CSS | Chrome/Firefox Extension | Color extraction from album art, dynamic light/dark theming | **C** (Adaptive color palette extraction algorithm) |
| **NewSync** | `https://github.com/better-lyrics/newsync` | Unavailable | N/A | N/A | N/A | N/A | N/A | Merged into main Better Lyrics repository | **E** (Superseded by Braccato) |
| **LRC Studio** | `https://github.com/fashni/lrc-studio` | Unavailable | N/A | N/A | N/A | N/A | N/A | Repository private or removed | **C** (Built-in Lyrics Studio replaces requirement) |
| **YTMDesktop+** | `https://github.com/YTMDesktop/YTMDesktop-plus` | Unavailable | N/A | N/A | N/A | N/A | N/A | Deprecated fork | **E** (Audited upstream YTMDesktop directly) |
| **Pear Desktop** | `https://github.com/peardesktop/pear-desktop` | Unavailable | N/A | N/A | N/A | N/A | N/A | Inactive/Archived project | **E** (Replaced by modern Web Audio/IFrame stack) |

---

### Reuse Legend:
- **A — Direct Reuse:** Use package or service directly via compliant public API (e.g. LRCLIB public API).
- **B — Clean Integration/Adaptation:** Port algorithms into cleanly licensed TypeScript modules with full compatibility (e.g. Braccato parser concepts, Kawarp WebGL canvas blur).
- **C — Independent Reimplementation:** Rebuild cleanly from scratch to match Sonora's specific light-glass design and local-first architecture (e.g. ThemeSong color extraction, RICS phonetic romanization, YTM search queries).
- **D — Architectural Study:** Study design decisions, edge-case handling, and queue models without adopting code directly (e.g. Better Lyrics drift correction, Feishin queue layout, Cider glassmorphic aesthetics).
- **E — Reject:** Inapplicable, copyleft-incompatible, discontinued, or policy-violating.
