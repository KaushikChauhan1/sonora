import { Lyric } from '../../types';
import { parseLRC } from './parsers/lrcParser';
import { parsePlain } from './parsers/plainParser';

export interface LrclibResponse {
  id?: number;
  name?: string;
  trackName?: string;
  artistName?: string;
  albumName?: string;
  duration?: number;
  instrumental?: boolean;
  hasWordSync?: boolean;
  plainLyrics?: string;
  syncedLyrics?: string;
  lyricsfile?: string;
}

const LRCLIB_BASE_URL = 'https://lrclib.net/api';

/**
 * Fetch synchronized or word-by-word lyrics from LRCLIB.
 */
export async function fetchLyricsFromLrclib(
  trackName: string,
  artistName: string,
  albumName?: string,
  durationSeconds?: number
): Promise<Lyric[] | null> {
  try {
    const cleanTrack = cleanSearchTerm(trackName);
    const cleanArtist = cleanSearchTerm(artistName);

    const params = new URLSearchParams({
      track_name: cleanTrack,
      artist_name: cleanArtist,
    });

    if (albumName) {
      params.append('album_name', cleanSearchTerm(albumName));
    }
    if (durationSeconds && durationSeconds > 0) {
      params.append('duration', Math.round(durationSeconds).toString());
    }

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 4000);

    const response = await fetch(`${LRCLIB_BASE_URL}/get?${params.toString()}`, {
      signal: controller.signal,
      headers: {
        'Lrclib-Client': 'SONORA-Browser-Client (https://github.com/kaushik/sonora)',
      },
    });

    clearTimeout(timeout);

    if (!response.ok) {
      // Try search endpoint if direct get 404s
      return await searchLrclibFallback(cleanTrack, cleanArtist, durationSeconds);
    }

    const data: LrclibResponse = await response.json();
    return processLrclibData(data, durationSeconds);
  } catch (err) {
    console.warn('LRCLIB fetch error or timeout, falling back:', err);
    return null;
  }
}

async function searchLrclibFallback(
  trackName: string,
  artistName: string,
  durationSeconds?: number
): Promise<Lyric[] | null> {
  try {
    const params = new URLSearchParams({
      q: `${trackName} ${artistName}`,
    });

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 3500);

    const response = await fetch(`${LRCLIB_BASE_URL}/search?${params.toString()}`, {
      signal: controller.signal,
      headers: {
        'Lrclib-Client': 'SONORA-Browser-Client',
      },
    });

    clearTimeout(timeout);

    if (!response.ok) return null;

    const results: LrclibResponse[] = await response.json();
    if (!results || results.length === 0) return null;

    // Pick closest match by duration or first with synced lyrics
    const match = results.find((r) => r.syncedLyrics || r.lyricsfile) || results[0];
    return processLrclibData(match, durationSeconds);
  } catch {
    return null;
  }
}

function processLrclibData(data: LrclibResponse, durationSeconds?: number): Lyric[] | null {
  if (data.instrumental) {
    return [
      {
        startTimeMs: 0,
        durationMs: (durationSeconds || 180) * 1000,
        words: '♪ Instrumental Track ♪',
        isInstrumental: true,
      },
    ];
  }

  // Prefer enhanced lyricsfile for word-level sync, otherwise syncedLyrics, otherwise plain
  const rawLrc = data.lyricsfile || data.syncedLyrics;
  if (rawLrc) {
    return parseLRC(rawLrc, durationSeconds);
  }

  if (data.plainLyrics) {
    return parsePlain(data.plainLyrics, durationSeconds);
  }

  return null;
}

function cleanSearchTerm(term: string): string {
  return term
    .replace(/\s*[\(\[](?:Official\s*(?:Music\s*)?Video|Audio|Lyric\s*Video|Remastered|HD|4K|Visualizer)[\)\]]/gi, '')
    .replace(/feat\..*$/i, '')
    .trim();
}
