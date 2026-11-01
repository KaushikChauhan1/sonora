import { describe, it, expect, beforeEach } from 'vitest';
import { useLibraryStore } from '../../src/stores/useLibraryStore';

describe('Library Store Management', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('toggles liked tracks idempotently', () => {
    const isNowLiked = useLibraryStore.getState().toggleLike('sample-id');
    expect(isNowLiked).toBe(true);
    expect(useLibraryStore.getState().isLiked('sample-id')).toBe(true);

    const isUnliked = useLibraryStore.getState().toggleLike('sample-id');
    expect(isUnliked).toBe(false);
    expect(useLibraryStore.getState().isLiked('sample-id')).toBe(false);
  });

  it('creates custom playlists with initial metadata', () => {
    const p = useLibraryStore.getState().createPlaylist('Sunset Grooves', 'Acoustic evening tracks');
    expect(p.title).toBe('Sunset Grooves');
    expect(p.isCustom).toBe(true);
    expect(useLibraryStore.getState().playlists.some((item) => item.id === p.id)).toBe(true);
  });
});
