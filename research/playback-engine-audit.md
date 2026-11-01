# SONORA — Playback Engine Technical Audit & Feasibility Spike

## 1. Executive Summary

A core requirement for SONORA is delivering a reliable, browser-based music playback engine without violating terms of service, bypassing DRM, or inventing fragile web scraping hacks. 
This audit evaluates the **Official YouTube IFrame Player API**, raw stream extraction methods (e.g. YouTube.js, ytmusicapi, Orchard), and the **YouTube Music External Handoff** mechanism.

---

## 2. Playback Architecture Comparison

| Capability | Official YouTube IFrame Player API | Direct Audio Stream Extraction (YouTube.js / ytmusicapi) | Injected Electron WebView (YTMDesktop) |
|---|---|---|---|
| **Browser Compatibility** | **100% (Chrome, Safari, Firefox, Edge, iOS, Android)** | ❌ Blocked by CORS & IP throttling in browser clients | ❌ Requires Node.js / Electron runtime; cannot run as web app |
| **Terms of Service Compliance** | **Full compliance with YouTube Developer Policies** | ⚠️ Violates YouTube API & Anti-Circumvention Policies | Depends on distribution model |
| **Audio/Video Playback** | ✅ Native hardware-accelerated playback | ❌ Stream signatures expire rapidly (n-sig challenge) | ✅ Native browser shell |
| **Media Events & Control** | ✅ Full play, pause, seek, volume, stateChange, duration | ⚠️ Custom HTML5 Audio element | ✅ Hooked via DOM mutation |
| **DRM / Premium Content** | ✅ Plays all embeddable YouTube audio/video content | ❌ Widevine decryption keys cannot be distributed | ⚠️ Requires user session cookies |
| **Autoplay Restrictions** | Managed via standard User Gesture policy | Same browser restrictions apply | Bypassed via Electron flags |

---

## 3. Official YouTube IFrame Player API Verification

### 3.1 Script Loading and Player Instantiation
- The Google IFrame API script (`https://www.youtube.com/iframe_api`) is loaded asynchronously.
- The global callback `window.onYouTubeIframeAPIReady` signals readiness.
- Instance initialization parameters:
  ```javascript
  const player = new YT.Player('sonora-hidden-player', {
    height: '100%',
    width: '100%',
    videoId: track.videoId,
    playerVars: {
      autoplay: 1,
      controls: 0,
      disablekb: 1,
      enablejsapi: 1,
      fs: 0,
      modestbranding: 1,
      iv_load_policy: 3,
      rel: 0,
      origin: window.location.origin,
    },
    events: {
      onReady: (e) => onPlayerReady(e),
      onStateChange: (e) => onPlayerStateChange(e),
      onError: (e) => onPlayerError(e),
    }
  });
  ```

### 3.2 Playback Control Mapping
- `playTrack(videoId)`: `player.loadVideoById(videoId, startSeconds)`
- `play()`: `player.playVideo()`
- `pause()`: `player.pauseVideo()`
- `seek(seconds)`: `player.seekTo(seconds, true)`
- `setVolume(0..100)`: `player.setVolume(volume)`
- `getPosition()`: `player.getCurrentTime()`
- `getDuration()`: `player.getDuration()`

### 3.3 State Machine Mapping (`YT.PlayerState`)
- `-1`: `UNSTARTED` → SONORA status: `idle`
- `0`: `ENDED` → SONORA status: `ended` (triggers automatic queue advancement)
- `1`: `PLAYING` → SONORA status: `playing`
- `2`: `PAUSED` → SONORA status: `paused`
- `3`: `BUFFERING` → SONORA status: `buffering`
- `5`: `CUED` → SONORA status: `ready`

### 3.4 Error Handling Protocols (`onError`)
- Error `2`: Invalid parameter. Handled with fallback metadata retry.
- Error `100`: Video not found or removed. Skip to next track in queue with toast notification.
- Error `101` / `150`: Embedding not allowed by content owner. Trigger **Seamless External Handoff** to `https://music.youtube.com/watch?v=${videoId}`.

---

## 4. The External Handoff Subsystem
For tracks that are geographically restricted, restricted from third-party embeds, or for users wanting full YouTube Music Premium features, SONORA provides a dedicated **YouTube Music Handoff Button** in the player interface and error toasts:
- URL format: `https://music.youtube.com/watch?v=${videoId}&list=${playlistId || ''}`
- Opens directly into YouTube Music with preserved playhead position where possible.

---

## 5. Architectural Decision
SONORA adopts a **Capability-Aware Hybrid Engine**:
1. **Primary Playback Engine:** Official YouTube IFrame Player API running in a dedicated, elegantly concealed background container or ambient video tile.
2. **Synchronized Playback Store:** Zustand `usePlayerStore` polls at 60fps via requestAnimationFrame to drive real-time waveform, scrubber, and word-by-word lyrics sync.
3. **Handoff Adapter:** Instant one-click handoff to YouTube Music for any restricted tracks.
