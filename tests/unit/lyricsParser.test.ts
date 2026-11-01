import { describe, it, expect } from 'vitest';
import { parseLRC } from '../../src/services/lyrics/parsers/lrcParser';
import { parsePlain } from '../../src/services/lyrics/parsers/plainParser';

describe('LRC & Enhanced LRC Parser', () => {
  it('correctly parses standard line-level LRC strings', () => {
    const sampleLrc = `
[ti: Test Song]
[ar: Test Artist]
[00:12.50]First line of the song
[00:15.80]Second line of the song
[00:20.00]Final chorus line
    `;

    const lyrics = parseLRC(sampleLrc, 30);
    expect(lyrics).toHaveLength(3);

    expect(lyrics[0].startTimeMs).toBe(12500);
    expect(lyrics[0].words).toBe('First line of the song');
    expect(lyrics[0].durationMs).toBe(3300); // 15800 - 12500

    expect(lyrics[1].startTimeMs).toBe(15800);
    expect(lyrics[1].words).toBe('Second line of the song');
    expect(lyrics[1].durationMs).toBe(4200); // 20000 - 15800

    expect(lyrics[2].startTimeMs).toBe(20000);
    expect(lyrics[2].words).toBe('Final chorus line');
  });

  it('correctly parses Enhanced LRC word-level timestamps', () => {
    const enhancedLrc = `
[00:26.00]<00:26.00>I've <00:27.20>been <00:28.20>tryna <00:29.40>call
    `;

    const lyrics = parseLRC(enhancedLrc, 35);
    expect(lyrics).toHaveLength(1);

    const line = lyrics[0];
    expect(line.startTimeMs).toBe(26000);
    expect(line.words).toBe("I've been tryna call");
    expect(line.parts).toBeDefined();
    expect(line.parts).toHaveLength(4);

    expect(line.parts![0].words).toBe("I've ");
    expect(line.parts![0].startTimeMs).toBe(26000);
    expect(line.parts![0].durationMs).toBe(1200);

    expect(line.parts![1].words).toBe("been ");
    expect(line.parts![1].startTimeMs).toBe(27200);
    expect(line.parts![1].durationMs).toBe(1000);

    expect(line.parts![2].words).toBe("tryna ");
    expect(line.parts![2].startTimeMs).toBe(28200);
    expect(line.parts![2].durationMs).toBe(1200);

    expect(line.parts![3].words).toBe("call");
    expect(line.parts![3].startTimeMs).toBe(29400);
  });

  it('detects instrumental lines with music note characters', () => {
    const instrumentalLrc = `
[00:05.00]♪♪♪
[00:10.00]Actual lyrics begin here
    `;

    const lyrics = parseLRC(instrumentalLrc, 20);
    expect(lyrics[0].isInstrumental).toBe(true);
    expect(lyrics[1].isInstrumental).toBe(false);
  });

  it('parses plain text into evenly spaced lines', () => {
    const plain = `Line one\nLine two\nLine three`;
    const lyrics = parsePlain(plain, 12);
    expect(lyrics).toHaveLength(3);
    expect(lyrics[0].durationMs).toBe(4000);
    expect(lyrics[1].startTimeMs).toBe(4000);
    expect(lyrics[2].startTimeMs).toBe(8000);
  });
});
