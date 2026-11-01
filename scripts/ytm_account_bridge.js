#!/usr/bin/env node
/**
 * SONORA YouTube Music Account Bridge
 * Connects your personal YouTube Music account (Playlists, Liked Songs, History, Recommendations)
 * to SONORA with real-time word-by-word synchronized lyrics.
 */

import http from 'http';
import fs from 'fs';
import path from 'path';

const PORT = 3001;
const CONFIG_FILE = path.resolve('.ytm_session.json');

// Helper to load saved session headers
function getSessionHeaders() {
  if (fs.existsSync(CONFIG_FILE)) {
    try {
      const data = JSON.parse(fs.readFileSync(CONFIG_FILE, 'utf8'));
      return data.headers || {};
    } catch {
      return {};
    }
  }
  return {};
}

function saveSessionHeaders(headers) {
  fs.writeFileSync(CONFIG_FILE, JSON.stringify({ headers, savedAt: new Date().toISOString() }, null, 2));
}

async function queryInnerTube(browseId, sessionHeaders = {}) {
  const headers = {
    'Content-Type': 'application/json',
    'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    'X-YouTube-Client-Name': '67',
    'X-YouTube-Client-Version': '1.20231201.01.00',
    'Origin': 'https://music.youtube.com',
    ...sessionHeaders,
  };

  const res = await fetch('https://music.youtube.com/youtubei/v1/browse?prettyPrint=false', {
    method: 'POST',
    headers,
    body: JSON.stringify({
      context: {
        client: {
          clientName: 'WEB_REMIX',
          clientVersion: '1.20231201.01.00',
          hl: 'en',
          gl: 'US',
        },
      },
      browseId,
    }),
  });

  if (!res.ok) {
    throw new Error(`InnerTube request failed: ${res.statusText}`);
  }

  return await res.json();
}

function parseMusicItems(sectionContents) {
  const tracks = [];
  for (const item of sectionContents) {
    const twoRow = item.musicTwoRowItemRenderer;
    const respItem = item.musicResponsiveListItemRenderer;

    if (twoRow) {
      const title = twoRow.title?.runs?.[0]?.text;
      const subtitle = twoRow.subtitle?.runs?.map((r) => r.text).join('') || '';
      const videoId =
        twoRow.navigationEndpoint?.watchEndpoint?.videoId ||
        twoRow.onTap?.watchEndpoint?.videoId;
      const artworkUrl =
        twoRow.thumbnailRenderer?.musicThumbnailRenderer?.thumbnail?.thumbnails?.slice(-1)[0]?.url;

      if (title && videoId) {
        tracks.push({
          id: `yt-${videoId}`,
          videoId,
          title,
          artist: subtitle.split('•')[0]?.trim() || 'YouTube Music',
          album: subtitle.split('•')[1]?.trim() || '',
          durationSeconds: 210,
          artworkUrl: artworkUrl || 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=600&q=80',
          provider: 'youtube-music',
        });
      }
    } else if (respItem) {
      const flex = respItem.flexColumns || [];
      const title = flex[0]?.musicResponsiveListItemFlexColumnRenderer?.title?.runs?.[0]?.text;
      const artist = flex[1]?.musicResponsiveListItemFlexColumnRenderer?.title?.runs?.[0]?.text || 'YouTube Music';
      const videoId =
        respItem.overlay?.musicItemThumbnailOverlayRenderer?.content?.musicPlayButtonRenderer?.playNavigationEndpoint?.watchEndpoint?.videoId ||
        flex[0]?.musicResponsiveListItemFlexColumnRenderer?.title?.runs?.[0]?.navigationEndpoint?.watchEndpoint?.videoId;
      const artworkUrl =
        respItem.thumbnail?.musicThumbnailRenderer?.thumbnail?.thumbnails?.slice(-1)[0]?.url;

      if (title && videoId) {
        tracks.push({
          id: `yt-${videoId}`,
          videoId,
          title,
          artist,
          durationSeconds: 210,
          artworkUrl: artworkUrl || 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=600&q=80',
          provider: 'youtube-music',
        });
      }
    }
  }
  return tracks;
}

const server = http.createServer(async (req, res) => {
  // Enable CORS for SONORA web app
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, Cookie');

  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }

  const url = new URL(req.url, `http://${req.headers.host}`);
  const pathname = url.pathname;

  try {
    const sessionHeaders = getSessionHeaders();

    // 1. Session Status Check
    if (pathname === '/api/session/status') {
      const hasAuth = !!sessionHeaders.Cookie || !!sessionHeaders.cookie;
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ connected: hasAuth }));
      return;
    }

    // 2. Save Session Headers (e.g. from pasted cURL or cookie string)
    if (pathname === '/api/session/connect' && req.method === 'POST') {
      let body = '';
      req.on('data', (chunk) => (body += chunk));
      req.on('end', () => {
        try {
          const parsed = JSON.parse(body);
          let headersToSave = {};

          if (parsed.cookie) {
            headersToSave['Cookie'] = parsed.cookie;
          } else if (parsed.curl) {
            // Extract cookie from curl
            const cookieMatch = parsed.curl.match(/-b\s+['"]([^'"]+)['"]|-H\s+['"]cookie:\s*([^'"]+)['"]/i);
            if (cookieMatch) {
              headersToSave['Cookie'] = cookieMatch[1] || cookieMatch[2];
            }
          } else if (parsed.headers) {
            headersToSave = parsed.headers;
          }

          saveSessionHeaders(headersToSave);
          res.writeHead(200, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ success: true, message: 'Session saved successfully!' }));
        } catch (e) {
          res.writeHead(400, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ error: e.message }));
        }
      });
      return;
    }

    // 3. User Recommendations & Home Feed
    if (pathname === '/api/ytm/home') {
      const data = await queryInnerTube('FEmusic_home', sessionHeaders);
      const sections =
        data.contents?.singleColumnBrowseResultsRenderer?.tabs?.[0]?.tabRenderer?.content?.sectionListRenderer?.contents || [];

      const recommendations = [];
      for (const s of sections) {
        const shelf = s.musicCarouselShelfRenderer;
        if (!shelf) continue;
        const title = shelf.header?.musicCarouselShelfBasicHeaderRenderer?.title?.runs?.[0]?.text || 'Recommendations';
        const tracks = parseMusicItems(shelf.contents || []);
        if (tracks.length > 0) {
          recommendations.push({ title, tracks });
        }
      }

      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify(recommendations));
      return;
    }

    // 4. User Liked Songs (FEmusic_liked)
    if (pathname === '/api/ytm/liked') {
      const data = await queryInnerTube('FEmusic_liked', sessionHeaders);
      const items =
        data.contents?.singleColumnBrowseResultsRenderer?.tabs?.[0]?.tabRenderer?.content?.sectionListRenderer?.contents?.[0]?.musicPlaylistShelfRenderer?.contents || [];
      const tracks = parseMusicItems(items);
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ title: 'Liked Music', tracks }));
      return;
    }

    // 5. User History (FEmusic_history)
    if (pathname === '/api/ytm/history') {
      const data = await queryInnerTube('FEmusic_history', sessionHeaders);
      const sections =
        data.contents?.singleColumnBrowseResultsRenderer?.tabs?.[0]?.tabRenderer?.content?.sectionListRenderer?.contents || [];
      const allHistoryTracks = [];
      for (const s of sections) {
        const shelf = s.musicShelfRenderer;
        if (shelf?.contents) {
          allHistoryTracks.push(...parseMusicItems(shelf.contents));
        }
      }
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify(allHistoryTracks));
      return;
    }

    // 404
    res.writeHead(404, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: 'Endpoint not found' }));
  } catch (err) {
    res.writeHead(500, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: err.message }));
  }
});

server.listen(PORT, () => {
  console.log(`\n======================================================`);
  console.log(`🎵 SONORA YouTube Music Bridge is LIVE on http://localhost:${PORT}`);
  console.log(`Endpoints available:`);
  console.log(`  - GET  /api/session/status`);
  console.log(`  - POST /api/session/connect (send { cookie: "..." })`);
  console.log(`  - GET  /api/ytm/home     (Your Recommendations & Mixes)`);
  console.log(`  - GET  /api/ytm/liked    (Your Liked Songs)`);
  console.log(`  - GET  /api/ytm/history  (Your Real Playback History)`);
  console.log(`======================================================\n`);
});
