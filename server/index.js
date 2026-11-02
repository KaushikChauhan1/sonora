import http from 'http';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = process.env.PORT || 3001;
const STATIC_DIR = path.resolve(__dirname, '../dist');
const CONFIG_FILE = path.resolve(__dirname, '../.ytm_session.json');

// MIME types for static assets
const MIME_TYPES = {
  '.html': 'text/html',
  '.js': 'text/javascript',
  '.css': 'text/css',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.woff2': 'font/woff2',
  '.woff': 'font/woff',
  '.ttf': 'font/ttf',
  '.webp': 'image/webp',
};

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
  // CORS & Security Headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-YTM-Cookie');

  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }

  const url = new URL(req.url, `http://${req.headers.host}`);
  const pathname = url.pathname;

  try {
    const sessionHeaders = getSessionHeaders();

    // Health check endpoint
    if (pathname === '/api/health') {
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ status: 'healthy', version: '3.0.0', service: 'sonora-backend' }));
      return;
    }

    // Session Status Check
    if (pathname === '/api/session/status') {
      const hasAuth = !!sessionHeaders.Cookie || !!sessionHeaders.cookie;
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ connected: hasAuth }));
      return;
    }

    // Save Session Headers
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

    // User Recommendations & Home Feed
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

    // User Liked Songs (FEmusic_liked)
    if (pathname === '/api/ytm/liked') {
      const data = await queryInnerTube('FEmusic_liked', sessionHeaders);
      const items =
        data.contents?.singleColumnBrowseResultsRenderer?.tabs?.[0]?.tabRenderer?.content?.sectionListRenderer?.contents?.[0]?.musicPlaylistShelfRenderer?.contents || [];
      const tracks = parseMusicItems(items);
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ title: 'Liked Music', tracks }));
      return;
    }

    // User History (FEmusic_history)
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

    // Serve Frontend Static Assets if available (Production & Cloud Deployments)
    if (fs.existsSync(STATIC_DIR)) {
      let filePath = path.join(STATIC_DIR, pathname === '/' ? 'index.html' : pathname);

      // Check if file exists, if not fall back to index.html (SPA client routing)
      if (!fs.existsSync(filePath) || fs.statSync(filePath).isDirectory()) {
        filePath = path.join(STATIC_DIR, 'index.html');
      }

      if (fs.existsSync(filePath)) {
        const ext = path.extname(filePath).toLowerCase();
        const contentType = MIME_TYPES[ext] || 'application/octet-stream';
        res.writeHead(200, { 'Content-Type': contentType });
        fs.createReadStream(filePath).pipe(res);
        return;
      }
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
  console.log(`🎵 SONORA Production Server is LIVE on port ${PORT}`);
  console.log(`Frontend: ${fs.existsSync(STATIC_DIR) ? 'Serving static bundle from /dist' : 'Standalone API mode'}`);
  console.log(`Endpoints available:`);
  console.log(`  - GET  /api/health       (Health & Readiness check)`);
  console.log(`  - GET  /api/session/status`);
  console.log(`  - POST /api/session/connect`);
  console.log(`  - GET  /api/ytm/home`);
  console.log(`  - GET  /api/ytm/liked`);
  console.log(`  - GET  /api/ytm/history`);
  console.log(`======================================================\n`);
});
