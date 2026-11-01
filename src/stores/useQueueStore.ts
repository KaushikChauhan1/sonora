import { create } from 'zustand';
import { Track } from '../types';
import { FEATURED_TRACKS } from '../services/metadata/catalogue';

interface QueueState {
  queue: Track[];
  currentIndex: number;
  history: Track[];
  
  // Actions
  setQueue: (tracks: Track[], startIndex?: number) => void;
  playNext: (track: Track) => void;
  addToQueue: (track: Track) => void;
  removeFromQueue: (index: number) => void;
  reorderQueue: (sourceIndex: number, destinationIndex: number) => void;
  clearQueue: () => void;
  advanceQueue: (repeatMode: 'off' | 'all' | 'one') => Track | null;
  previousTrack: () => Track | null;
  getCurrentTrack: () => Track | null;
}

export const useQueueStore = create<QueueState>((set, get) => ({
  queue: [...FEATURED_TRACKS],
  currentIndex: 0,
  history: [],

  setQueue: (tracks: Track[], startIndex = 0) => {
    set({
      queue: tracks,
      currentIndex: Math.max(0, Math.min(startIndex, tracks.length - 1)),
    });
  },

  playNext: (track: Track) => {
    const { queue, currentIndex } = get();
    const newQueue = [...queue];
    newQueue.splice(currentIndex + 1, 0, track);
    set({ queue: newQueue });
  },

  addToQueue: (track: Track) => {
    const { queue } = get();
    set({ queue: [...queue, track] });
  },

  removeFromQueue: (index: number) => {
    const { queue, currentIndex } = get();
    const newQueue = queue.filter((_, i) => i !== index);
    let newIndex = currentIndex;
    if (index < currentIndex) {
      newIndex = Math.max(0, currentIndex - 1);
    } else if (newIndex >= newQueue.length) {
      newIndex = Math.max(0, newQueue.length - 1);
    }
    set({ queue: newQueue, currentIndex: newIndex });
  },

  reorderQueue: (sourceIndex: number, destinationIndex: number) => {
    const { queue, currentIndex } = get();
    const newQueue = [...queue];
    const [moved] = newQueue.splice(sourceIndex, 1);
    newQueue.splice(destinationIndex, 0, moved);

    let newCurrentIndex = currentIndex;
    if (sourceIndex === currentIndex) {
      newCurrentIndex = destinationIndex;
    } else if (sourceIndex < currentIndex && destinationIndex >= currentIndex) {
      newCurrentIndex -= 1;
    } else if (sourceIndex > currentIndex && destinationIndex <= currentIndex) {
      newCurrentIndex += 1;
    }

    set({ queue: newQueue, currentIndex: newCurrentIndex });
  },

  clearQueue: () => {
    const { queue, currentIndex } = get();
    const current = queue[currentIndex];
    set({
      queue: current ? [current] : [],
      currentIndex: 0,
    });
  },

  advanceQueue: (repeatMode) => {
    const { queue, currentIndex, history } = get();
    if (queue.length === 0) return null;

    const current = queue[currentIndex];
    const newHistory = current ? [current, ...history.slice(0, 49)] : history;

    if (repeatMode === 'one') {
      return current;
    }

    if (currentIndex < queue.length - 1) {
      const nextIndex = currentIndex + 1;
      set({ currentIndex: nextIndex, history: newHistory });
      return queue[nextIndex];
    }

    if (repeatMode === 'all') {
      set({ currentIndex: 0, history: newHistory });
      return queue[0];
    }

    return null;
  },

  previousTrack: () => {
    const { queue, currentIndex } = get();
    if (currentIndex > 0) {
      const prevIndex = currentIndex - 1;
      set({ currentIndex: prevIndex });
      return queue[prevIndex];
    }
    return queue[0] || null;
  },

  getCurrentTrack: () => {
    const { queue, currentIndex } = get();
    return queue[currentIndex] || null;
  },
}));
