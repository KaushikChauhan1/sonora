import { Lyric } from '../../../types';

/**
 * Parses plain text lyrics into structured Lyric[] objects with artificial intervals.
 */
export function parsePlain(plainText: string, songDurationSeconds: number = 0): Lyric[] {
  if (!plainText) return [];

  const rawLines = plainText
    .split('\n')
    .map((l) => l.trim())
    .filter((l) => l.length > 0);

  if (rawLines.length === 0) return [];

  const totalLines = rawLines.length;
  const durationMs = songDurationSeconds > 0 ? (songDurationSeconds * 1000) / totalLines : 4000;

  return rawLines.map((line, index) => ({
    startTimeMs: index * durationMs,
    durationMs,
    words: line,
    isInstrumental: false
  }));
}
