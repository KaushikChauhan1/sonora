import { Track, Lyric } from '../../types';
import { fetchLyricsFromLrclib } from './lrclib';
import { SEED_WORD_SYNC_LYRICS } from '../metadata/catalogue';

const lyricsCache = new Map<string, Lyric[]>();

/**
 * Resolves lyrics for a track through a priority pipeline:
 * 1. In-memory cache
 * 2. Pre-seeded rich word-by-word synced catalogue
 * 3. Live LRCLIB API query
 * 4. Fallback generated timing
 */
export async function resolveLyrics(track: Track): Promise<Lyric[]> {
  const cacheKey = `${track.id}:${track.title}:${track.artist}`.toLowerCase();

  // 1. In-memory cache
  if (lyricsCache.has(cacheKey)) {
    return lyricsCache.get(cacheKey)!;
  }

  // 2. Pre-seeded rich word-by-word synced catalogue
  if (SEED_WORD_SYNC_LYRICS[track.id]) {
    const seed = SEED_WORD_SYNC_LYRICS[track.id];
    lyricsCache.set(cacheKey, seed);
    return seed;
  }

  // 3. Live LRCLIB API query
  try {
    const lrclibResult = await fetchLyricsFromLrclib(
      track.title,
      track.artist,
      track.album,
      track.durationSeconds
    );

    if (lrclibResult && lrclibResult.length > 0) {
      lyricsCache.set(cacheKey, lrclibResult);
      return lrclibResult;
    }
  } catch (err) {
    console.warn('Failed to query LRCLIB lyrics:', err);
  }

  // 4. Fallback default lyrics
  const fallback: Lyric[] = [
    {
      startTimeMs: 0,
      durationMs: Math.max(10000, (track.durationSeconds || 180) * 1000),
      words: `♪ Playing ${track.title} by ${track.artist} ♪`,
      isInstrumental: true
    }
  ];

  lyricsCache.set(cacheKey, fallback);
  return fallback;
}
