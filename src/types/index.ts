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
  provider: 'youtube-music' | 'local' | 'custom';
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

export interface LyricPart {
  startTimeMs: number;
  durationMs: number;
  words: string;
  isBackground?: boolean;
  explicit?: boolean;
}

export interface Lyric {
  startTimeMs: number;
  durationMs: number;
  words: string;
  parts?: LyricPart[];
  isInstrumental?: boolean;
  translations?: Record<string, string>;
  romanization?: string;
}

export type RepeatMode = 'off' | 'all' | 'one';

export interface PlaybackState {
  currentTrack: Track | null;
  isPlaying: boolean;
  positionSeconds: number;
  durationSeconds: number;
  bufferedSeconds: number;
  volume: number;
  isMuted: boolean;
  repeatMode: RepeatMode;
  isShuffled: boolean;
}

export type ViewMode = 'discover' | 'search' | 'library' | 'lyrics-studio' | 'settings';

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

  play(track: Track): Promise<void>;
  pause(): Promise<void>;
  resume(): Promise<void>;
  seek(positionSeconds: number): Promise<void>;
  setVolume(volume: number): Promise<void>;
  getPlaybackState(): Promise<PlaybackState>;
}
