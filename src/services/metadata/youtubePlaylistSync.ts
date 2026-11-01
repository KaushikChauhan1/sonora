import { Track, Playlist } from '../../types';

export interface FetchedPlaylistResult {
  playlistId: string;
  title: string;
  description: string;
  artworkUrl: string;
  tracks: Track[];
}

/**
 * Extracts a YouTube or YouTube Music playlist ID from various URL formats or raw ID strings.
 */
export function extractPlaylistId(input: string): string | null {
  if (!input) return null;
  const trimmed = input.trim();

  // Match list= parameter in URL
  const match = trimmed.match(/[?&]list=([a-zA-Z0-9_-]+)/);
  if (match && match[1]) {
    return match[1];
  }

  // Raw playlist ID (PL..., RD..., OLAK5uy_...)
  if (/^[a-zA-Z0-9_-]{12,}$/.test(trimmed)) {
    return trimmed;
  }

  return null;
}

/**
 * Fetches playlist metadata and items using YouTube Data API v3 if an API key is available.
 */
export async function fetchPlaylistWithApiKey(
  playlistId: string,
  apiKey: string
): Promise<FetchedPlaylistResult> {
  // 1. Fetch Playlist Details (Title, Description, Thumbnail)
  const playlistUrl = `https://www.googleapis.com/youtube/v3/playlists?part=snippet&id=${playlistId}&key=${apiKey}`;
  const playlistRes = await fetch(playlistUrl);
  if (!playlistRes.ok) {
    throw new Error(`Failed to fetch playlist details: ${playlistRes.statusText}`);
  }
  const playlistData = await playlistRes.json();
  const playlistItem = playlistData.items?.[0];

  const title = playlistItem?.snippet?.title || 'Imported YouTube Playlist';
  const description = playlistItem?.snippet?.description || '';
  const artworkUrl =
    playlistItem?.snippet?.thumbnails?.maxres?.url ||
    playlistItem?.snippet?.thumbnails?.high?.url ||
    playlistItem?.snippet?.thumbnails?.medium?.url ||
    'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=600&q=80';

  // 2. Fetch Playlist Items (Videos/Tracks)
  const itemsUrl = `https://www.googleapis.com/youtube/v3/playlistItems?part=snippet,contentDetails&maxResults=50&playlistId=${playlistId}&key=${apiKey}`;
  const itemsRes = await fetch(itemsUrl);
  if (!itemsRes.ok) {
    throw new Error(`Failed to fetch playlist items: ${itemsRes.statusText}`);
  }
  const itemsData = await itemsRes.json();

  const tracks: Track[] = (itemsData.items || []).map((item: any, index: number) => {
    const snippet = item.snippet;
    const videoId = snippet?.resourceId?.videoId || item.contentDetails?.videoId || '';
    const rawTitle = snippet?.title || 'Unknown Title';
    const channelTitle = snippet?.videoOwnerChannelTitle || snippet?.channelTitle || 'Unknown Artist';

    // Parse "Artist - Title" format if title contains a hyphen
    let trackTitle = rawTitle;
    let trackArtist = channelTitle.replace(/ - Topic$/, '');
    if (rawTitle.includes(' - ')) {
      const parts = rawTitle.split(' - ');
      trackArtist = parts[0].trim();
      trackTitle = parts.slice(1).join(' - ').trim();
    }

    return {
      id: `yt-${videoId || index}`,
      videoId,
      title: trackTitle,
      artist: trackArtist,
      album: title,
      durationSeconds: 210, // Default estimate; refreshed upon load
      artworkUrl:
        snippet?.thumbnails?.high?.url ||
        snippet?.thumbnails?.medium?.url ||
        artworkUrl,
      provider: 'youtube-music',
    };
  });

  return {
    playlistId,
    title,
    description,
    artworkUrl,
    tracks,
  };
}

/**
 * Creates a lightweight playlist reference when no API key is supplied.
 * The YouTube IFrame player can load and play this playlist directly via its native player.loadPlaylist() API.
 */
export function createDirectSyncedPlaylist(
  playlistId: string,
  customTitle?: string
): Playlist {
  return {
    id: `playlist-yt-${playlistId}`,
    title: customTitle || `YouTube Playlist (${playlistId.slice(0, 8)}...)`,
    description: `Synced directly via YouTube Playlist ID: ${playlistId}`,
    artworkUrl: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=600&q=80',
    trackCount: 0,
    tracks: [],
    isCustom: true,
    createdAt: new Date().toISOString().split('T')[0],
  };
}
