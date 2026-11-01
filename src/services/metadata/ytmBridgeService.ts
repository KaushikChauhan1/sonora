import { Track } from '../../types';

const BRIDGE_BASE_URL = 'http://localhost:3001';

export interface RecommendationSection {
  title: string;
  tracks: Track[];
}

/**
 * Checks if the local SONORA YouTube Music bridge is active and authenticated.
 */
export async function checkBridgeStatus(): Promise<{ online: boolean; connected: boolean }> {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 1200);
    const res = await fetch(`${BRIDGE_BASE_URL}/api/session/status`, { signal: controller.signal });
    clearTimeout(timeout);
    if (!res.ok) return { online: false, connected: false };
    const data = await res.json();
    return { online: true, connected: !!data.connected };
  } catch {
    return { online: false, connected: false };
  }
}

/**
 * Connects session cookie to the local bridge.
 */
export async function connectYtmSession(cookie: string): Promise<boolean> {
  try {
    const res = await fetch(`${BRIDGE_BASE_URL}/api/session/connect`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ cookie }),
    });
    return res.ok;
  } catch {
    return false;
  }
}

/**
 * Fetches user's actual personalized recommendations & quick picks from YouTube Music.
 */
export async function fetchPersonalizedHome(): Promise<RecommendationSection[] | null> {
  try {
    const res = await fetch(`${BRIDGE_BASE_URL}/api/ytm/home`);
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}

/**
 * Fetches user's actual Liked Music collection from YouTube Music.
 */
export async function fetchUserLikedMusic(): Promise<Track[] | null> {
  try {
    const res = await fetch(`${BRIDGE_BASE_URL}/api/ytm/liked`);
    if (!res.ok) return null;
    const data = await res.json();
    return data.tracks || [];
  } catch {
    return null;
  }
}

/**
 * Fetches user's actual listening history from YouTube Music.
 */
export async function fetchUserHistory(): Promise<Track[] | null> {
  try {
    const res = await fetch(`${BRIDGE_BASE_URL}/api/ytm/history`);
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}
