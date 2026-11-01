# SONORA — Lyrics Engine Technical Audit & Specification

## 1. Executive Summary

Lyrics presentation is SONORA's central competitive differentiator. Current streaming clients relegate lyrics to an unformatted side panel with inconsistent line-level jumps. 
Auditing **Better Lyrics**, **Braccato**, **Composer**, **LRCLIB**, and **LRCGet** reveals the requirements for an Apple Music-grade word-by-word synchronized lyrics experience in the browser.

---

## 2. In-Depth Audit of Upstream Systems

### 2.1 Braccato Data Model & Parsing Pipeline
- **Format Support:** Standard LRC `[mm:ss.xx]`, Enhanced LRC `<mm:ss.xx> word <mm:ss.xx>`, TTML (`<p begin="..." end="..."><span>...</span></p>`), QRC, and Plain text.
- **Timestamp Parsing:** Normalizes timestamps into integer milliseconds (`totalMs = min * 60000 + sec * 1000`).
- **Data Model:**
  ```typescript
  interface LyricPart {
    startTimeMs: number;
    durationMs: number;
    words: string;
    isBackground?: boolean;
    explicit?: boolean;
  }
  interface Lyric {
    startTimeMs: number;
    durationMs: number;
    words: string;
    parts?: LyricPart[]; // Empty if only line-level timing is available
    isInstrumental?: boolean;
    translations?: Record<string, string>;
    romanization?: string;
  }
  ```
- **Key Insight:** Never fabricate word timestamps. When word timing exists in enhanced LRC or TTML, populate `parts`. When only line timing exists, leave `parts` empty and smoothly illuminate the entire line.

### 2.2 Synchronization & Drift Correction (Better Lyrics & Braccato Core)
- **Clock Source:** The YouTube IFrame Player emits `getCurrentTime()` which updates roughly every 200–250ms.
- **Interpolation:** To achieve 60fps word highlight transitions, SONORA employs a high-resolution requestAnimationFrame interpolation loop:
  `interpolatedTime = lastKnownPositionMs + (performance.now() - lastSyncTimestampMs) * playbackRate`.
- **Drift Correction Thresholds:**
  - **Micro-drift (< 60ms):** Slew playback clock gradually without visual stutter.
  - **Medium drift (60ms – 250ms):** Soft-clamp the clock to real media time.
  - **Macro-jump (> 500ms):** Immediate seek re-synchronization; snap active line and cancel current transition.
- **Active State Computation:**
  ```typescript
  // For each line:
  const isActiveLine = currentTimeMs >= line.startTimeMs && currentTimeMs < (line.startTimeMs + line.durationMs);
  const isPastLine = currentTimeMs >= (line.startTimeMs + line.durationMs);

  // For each word part inside an active line:
  const isWordActive = currentTimeMs >= part.startTimeMs && currentTimeMs < (part.startTimeMs + part.durationMs);
  const wordProgress = isWordActive 
    ? Math.min(1, Math.max(0, (currentTimeMs - part.startTimeMs) / part.durationMs))
    : (currentTimeMs >= part.startTimeMs + part.durationMs ? 1 : 0);
  ```

### 2.3 Auto-Scrolling & User Override
- **Center-Focus Target:** The active lyric line is smoothly translated so its vertical center sits at 38–42% of the viewport container.
- **User Scroll Detection:** Listening to `wheel`, `touchmove`, or `pointerdown` inside the lyrics scroll container triggers `userScrolling = true`.
- **Auto-Resume Delay:** After user-initiated interaction ceases, a 5,000ms idle timer resets `userScrolling = false` and smoothly realigns the active line.
- **Early Scroll Anticipation:** Initiate line scroll transitions 120ms before the upcoming line begins to create a fluid, anticipated scroll rather than a reactive snap.

### 2.4 LRCLIB REST Integration Architecture
- **Endpoint:** `https://lrclib.net/api/get`
- **Request Parameters:**
  - `track_name`: Normalized track title (stripped of `(Official Audio)`, `[Remastered]`, etc.)
  - `artist_name`: Primary artist
  - `album_name`: Album name (optional fallback)
  - `duration`: Float seconds (±2s tolerance used by LRCLIB database index)
- **Response Handling:**
  - `synced_lyrics`: Standard LRC string.
  - `lyricsfile`: Enhanced LRC or YAML metadata with syllable/word tags.
  - `plain_lyrics`: Fallback when timing does not exist.
  - `instrumental`: Boolean flag to display stylized ambient instrumental wave indicators.

---

## 3. Translation & Romanization Pipeline
- **Romanization (RICS Strategy):** Provides transliteration for non-Latin scripts (Japanese Hiragana/Katakana/Kanji → Romaji, Korean Hangul → Revised Romanization, Mandarin Hanzi → Pinyin).
- **Secondary Display:** Romanized text renders in a refined 12px secondary typography block directly above or below the native lyric line.

---

## 4. SONORA Production Lyrics Architecture
1. **Multi-Source Resolver:**
   - Priority 1: In-memory/IndexedDB persistent cache.
   - Priority 2: Real-time LRCLIB API query.
   - Priority 3: Fallback embedded mock catalogue (covers featured demonstration tracks).
2. **Parser Dispatcher:** Autodetects format (Enhanced LRC vs Standard LRC vs TTML vs Plain) and generates unified `Lyric[]` trees.
3. **Lyrics Studio Component:** Responsive container with word-level gradient masking, typography controls (font size, letter spacing, alignment), and full-screen presentation mode.
