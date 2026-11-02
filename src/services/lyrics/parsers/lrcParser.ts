import { Lyric, LyricPart } from '../../../types';

const TIME_TAG_REGEX = /\[(\d+):(\d+(?:\.\d+)?)\]/g;
const ENHANCED_WORD_REGEX = /<(\d+):(\d+(?:\.\d+)?)>([^<]*)/g;
const ID_TAG_REGEX = /^\[(\w+):(.*)\]$/;

export function parseTimeToMs(timeStr: string): number {
  if (!timeStr) return 0;
  const parts = timeStr.split(':');
  if (parts.length === 2) {
    const minutes = parseInt(parts[0], 10);
    const seconds = parseFloat(parts[1]);
    return Math.round(minutes * 60000 + seconds * 1000);
  } else if (parts.length === 3) {
    const hours = parseInt(parts[0], 10);
    const minutes = parseInt(parts[1], 10);
    const seconds = parseFloat(parts[2]);
    return Math.round(hours * 3600000 + minutes * 60000 + seconds * 1000);
  }
  return 0;
}

/**
 * Parses standard LRC and Enhanced LRC (word-by-word) strings into structured Lyric[] objects.
 */
export function parseLRC(lrcText: string, songDurationSeconds: number = 0): Lyric[] {
  if (!lrcText) return [];

  const rawLines = lrcText.split('\n');
  const tempLyrics: Array<{ startTimeMs: number; text: string }> = [];

  for (const rawLine of rawLines) {
    const line = rawLine.trim();
    if (!line) continue;

    // Check for ID tags like [ar: Artist], [ti: Title], etc.
    if (ID_TAG_REGEX.test(line)) {
      continue;
    }

    // Match all time tags in the line
    const matches = Array.from(line.matchAll(TIME_TAG_REGEX));
    if (matches.length > 0) {
      // The remaining text after stripping all time tags
      const text = line.replace(TIME_TAG_REGEX, '').trim();

      for (const match of matches) {
        const timeStr = `${match[1]}:${match[2]}`;
        const startTimeMs = parseTimeToMs(timeStr);
        tempLyrics.push({ startTimeMs, text });
      }
    }
  }

  // Sort by startTimeMs
  tempLyrics.sort((a, b) => a.startTimeMs - b.startTimeMs);

  const lyrics: Lyric[] = [];
  const songDurationMs = songDurationSeconds > 0 ? songDurationSeconds * 1000 : 0;

  for (let i = 0; i < tempLyrics.length; i++) {
    const item = tempLyrics[i];
    const nextItem = tempLyrics[i + 1];
    
    // Duration is until next line or default 3.5s / song duration
    let durationMs: number;
    if (nextItem) {
      durationMs = Math.max(500, nextItem.startTimeMs - item.startTimeMs);
    } else if (songDurationMs > item.startTimeMs) {
      durationMs = songDurationMs - item.startTimeMs;
    } else {
      durationMs = 3500;
    }

    // Check for Enhanced LRC word-level tags: <mm:ss.xx> word <mm:ss.xx>
    const wordMatches = Array.from(item.text.matchAll(ENHANCED_WORD_REGEX));
    let parts: LyricPart[] | undefined = undefined;
    let cleanWords = item.text;

    if (wordMatches.length > 0) {
      parts = [];
      for (let w = 0; w < wordMatches.length; w++) {
        const wMatch = wordMatches[w];
        const wTime = `${wMatch[1]}:${wMatch[2]}`;
        const wStartMs = parseTimeToMs(wTime);
        const wText = wMatch[3];
        const nextWMatch = wordMatches[w + 1];
        
        let wDurationMs: number;
        if (nextWMatch) {
          const nextTime = `${nextWMatch[1]}:${nextWMatch[2]}`;
          wDurationMs = Math.max(100, parseTimeToMs(nextTime) - wStartMs);
        } else {
          wDurationMs = Math.max(200, item.startTimeMs + durationMs - wStartMs);
        }

        parts.push({
          startTimeMs: wStartMs,
          durationMs: wDurationMs,
          words: wText
        });
      }
      // Strip enhanced tags for clean full line display
      cleanWords = item.text.replace(/<\d+:\d+(?:\.\d+)?>/g, '').trim();
    }

    // Detect instrumental lines (e.g. music notes or empty)
    const isInstrumental = !cleanWords || /^[\s♪♫♬♩🎵🎶]+$/u.test(cleanWords);

    if (!parts && cleanWords && !isInstrumental) {
      // Proportional synthetic word timings for line-level synced lyrics
      const rawWords = cleanWords.split(/(\s+)/);
      const meaningfulWords = rawWords.filter((w) => w.trim().length > 0);
      if (meaningfulWords.length > 0) {
        const totalChars = meaningfulWords.reduce((sum, w) => sum + w.length, 0);
        let currentWordStart = item.startTimeMs;
        const lineActiveDuration = durationMs * 0.92;
        parts = [];

        for (let w = 0; w < rawWords.length; w++) {
          const token = rawWords[w];
          if (!token.trim()) {
            // Append trailing whitespace to previous part if exists
            if (parts.length > 0) {
              parts[parts.length - 1].words += token;
            }
            continue;
          }
          const wDuration = Math.max(160, Math.round((token.length / totalChars) * lineActiveDuration));
          parts.push({
            startTimeMs: currentWordStart,
            durationMs: wDuration,
            words: token,
          });
          currentWordStart += wDuration;
        }
      }
    }

    lyrics.push({
      startTimeMs: item.startTimeMs,
      durationMs,
      words: cleanWords,
      parts,
      isInstrumental
    });
  }

  return lyrics;
}
