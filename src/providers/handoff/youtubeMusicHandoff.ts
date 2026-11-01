import { Track } from '../../types';

/**
 * Builds the official deep link to listen to a track on YouTube Music.
 */
export function getYouTubeMusicUrl(track: Track): string {
  if (!track || !track.videoId) {
    return 'https://music.youtube.com/';
  }
  return `https://music.youtube.com/watch?v=${encodeURIComponent(track.videoId)}`;
}

/**
 * Builds the deep link from a raw video ID.
 */
export function getYTHandoffUrl(videoId: string): string {
  if (!videoId) {
    return 'https://music.youtube.com/';
  }
  return `https://music.youtube.com/watch?v=${encodeURIComponent(videoId)}`;
}

/**
 * Opens the track directly in YouTube Music in a new browser tab.
 */
export function handoffToYouTubeMusic(track: Track) {
  const url = getYouTubeMusicUrl(track);
  window.open(url, '_blank', 'noopener,noreferrer');
}
