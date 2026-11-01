# SONORA — Provider Integration Architecture & Contract Audit

## 1. Executive Summary

A critical architectural tenet of SONORA is provider modularity:
"The application must remain useful even if an external music provider changes its API."
To achieve this, SONORA decouples the application layer from external services through a **Capability-Aware Provider Contract**.

---

## 2. MusicProvider Contract Specification

```typescript
export interface Track {
  id: string;
  videoId: string;
  title: string;
  artist: string;
  artistId?: string;
  album?: string;
  albumId?: string;
  durationSeconds: number;
  artworkUrl: string;
  explicit?: boolean;
  year?: number;
  genre?: string;
  provider: string;
}

export interface Album {
  id: string;
  title: string;
  artist: string;
  artistId?: string;
  artworkUrl: string;
  year: number;
  trackCount: number;
  tracks: Track[];
}

export interface Artist {
  id: string;
  name: string;
  avatarUrl: string;
  bio?: string;
  topTracks: Track[];
  albums: Album[];
}

export interface Playlist {
  id: string;
  title: string;
  description?: string;
  artworkUrl?: string;
  trackCount: number;
  tracks: Track[];
  isCustom?: boolean;
  createdAt: string;
}

export interface PlaybackState {
  currentTrack: Track | null;
  isPlaying: boolean;
  positionSeconds: number;
  durationSeconds: number;
  bufferedSeconds: number;
  volume: number;
  isMuted: boolean;
  repeatMode: 'off' | 'all' | 'one';
  isShuffled: boolean;
}

export interface ProviderCapabilities {
  search: boolean;
  metadata: boolean;
  playback: boolean;
  queue: boolean;
  lyrics: boolean;
  library: boolean;
  playlists: boolean;
}

export interface MusicProvider {
  id: string;
  name: string;
  capabilities: ProviderCapabilities;

  // Metadata APIs
  search(query: string, filter?: 'all' | 'songs' | 'albums' | 'artists'): Promise<Track[]>;
  getTrack(id: string): Promise<Track>;
  getAlbum(id: string): Promise<Album>;
  getArtist(id: string): Promise<Artist>;
  getFeatured(): Promise<{
    trending: Track[];
    recommended: Track[];
    editorialAlbums: Album[];
    moodPlaylists: Playlist[];
  }>;

  // Playback Control APIs
  play(track: Track): Promise<void>;
  pause(): Promise<void>;
  resume(): Promise<void>;
  seek(positionSeconds: number): Promise<void>;
  setVolume(volume: number): Promise<void>;
  getPlaybackState(): Promise<PlaybackState>;
}
```

---

## 3. Provider Implementations

### 3.1 YouTube Music Hybrid Provider (`YouTubeMusicHybridProvider`)
- **Metadata Source:** Curated high-fidelity catalog + live search suggestion adapter.
- **Playback Source:** Official YouTube IFrame Player API.
- **External Handoff:** Integrated fallback for restricted or blocked videos.
- **Capabilities:**
  `{ search: true, metadata: true, playback: true, queue: true, lyrics: false, library: false, playlists: true }`

### 3.2 LRCLIB Lyrics Provider (`LrclibProvider`)
- Dedicated provider for synchronized and word-by-word lyric fetching.
- **Capabilities:**
  `{ lyrics: true }`

### 3.3 Local-First Storage Provider (`IndexedDBProvider`)
- Stores user liked songs, custom playlists, recent play history, search history, and cached lyrics locally in IndexedDB via Dexie / idb-keyval.
- **Capabilities:**
  `{ library: true, playlists: true }`

---

## 4. Capability Negotiation Pattern
When an action is requested (e.g. `provider.play(track)`), the orchestrator checks `provider.capabilities.playback`.
If unsupported:
1. Returns an explicit `{ supported: false, reason: "..." }` state.
2. Does NOT simulate successful playback.
3. Automatically offers the external handoff or alternative fallback provider.
