import { describe, it, expect, beforeEach } from 'vitest';
import { useQueueStore } from '../../src/stores/useQueueStore';
import { Track } from '../../src/types';

describe('Queue Store Management', () => {
  const dummyTracks: Track[] = [
    { id: '1', videoId: 'v1', title: 'Song 1', artist: 'Artist A', durationSeconds: 180, artworkUrl: '', provider: 'youtube-music' },
    { id: '2', videoId: 'v2', title: 'Song 2', artist: 'Artist B', durationSeconds: 200, artworkUrl: '', provider: 'youtube-music' },
    { id: '3', videoId: 'v3', title: 'Song 3', artist: 'Artist C', durationSeconds: 220, artworkUrl: '', provider: 'youtube-music' },
  ];

  beforeEach(() => {
    useQueueStore.getState().setQueue([...dummyTracks], 0);
  });

  it('correctly sets queue and retrieves current track', () => {
    const current = useQueueStore.getState().getCurrentTrack();
    expect(current?.id).toBe('1');
  });

  it('handles playNext priority injection directly after current index', () => {
    const priorityTrack: Track = {
      id: 'priority',
      videoId: 'vp',
      title: 'Priority Track',
      artist: 'Artist P',
      durationSeconds: 150,
      artworkUrl: '',
      provider: 'youtube-music',
    };

    useQueueStore.getState().playNext(priorityTrack);
    const queue = useQueueStore.getState().queue;
    expect(queue[1].id).toBe('priority');
    expect(queue[2].id).toBe('2');
  });

  it('advances queue correctly with repeat off, all, and one modes', () => {
    // Mode: off -> advance 0 to 1
    const next1 = useQueueStore.getState().advanceQueue('off');
    expect(next1?.id).toBe('2');

    // Advance 1 to 2
    const next2 = useQueueStore.getState().advanceQueue('off');
    expect(next2?.id).toBe('3');

    // Advance past end with repeat off -> returns null
    const end = useQueueStore.getState().advanceQueue('off');
    expect(end).toBeNull();

    // Advance past end with repeat all -> loops to 0
    const loop = useQueueStore.getState().advanceQueue('all');
    expect(loop?.id).toBe('1');

    // Repeat one -> stays on current
    const stay = useQueueStore.getState().advanceQueue('one');
    expect(stay?.id).toBe('1');
  });

  it('reorders queue elements cleanly', () => {
    useQueueStore.getState().reorderQueue(0, 2);
    const queue = useQueueStore.getState().queue;
    expect(queue[0].id).toBe('2');
    expect(queue[1].id).toBe('3');
    expect(queue[2].id).toBe('1');
  });
});
