// Static-file server + local API routes (mirrors Vercel serverless functions)
const http  = require('http');
const fs    = require('fs');
const path  = require('path');
const https = require('https');

const PORT = process.env.PORT || 3000;
const ROOT = __dirname;

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.css':  'text/css; charset=utf-8',
  '.js':   'application/javascript; charset=utf-8',
  '.jsx':  'application/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png':  'image/png',
  '.jpg':  'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif':  'image/gif',
  '.svg':  'image/svg+xml',
  '.ico':  'image/x-icon',
  '.woff': 'font/woff',
  '.woff2':'font/woff2',
  '.ttf':  'font/ttf',
  '.webp': 'image/webp',
};

// ── API: /api/now-playing ──────────────────────────────────────────────────
async function handleNowPlaying(res) {
  const CLIENT_ID     = process.env.SPOTIFY_CLIENT_ID;
  const CLIENT_SECRET = process.env.SPOTIFY_CLIENT_SECRET;
  const REFRESH_TOKEN = process.env.SPOTIFY_REFRESH_TOKEN;

  const json = (data) => {
    res.writeHead(200, { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' });
    res.end(JSON.stringify(data));
  };

  if (!CLIENT_ID || !CLIENT_SECRET || !REFRESH_TOKEN) {
    return json({ isPlaying: false, error: 'Spotify env vars not set' });
  }

  try {
    // 1. Get access token
    const basic    = Buffer.from(`${CLIENT_ID}:${CLIENT_SECRET}`).toString('base64');
    const tokenRes = await fetch('https://accounts.spotify.com/api/token', {
      method: 'POST',
      headers: { Authorization: `Basic ${basic}`, 'Content-Type': 'application/x-www-form-urlencoded' },
      body:    new URLSearchParams({ grant_type: 'refresh_token', refresh_token: REFRESH_TOKEN }),
    });
    const { access_token } = await tokenRes.json();

    // 2. Get currently playing
    const spotRes = await fetch('https://api.spotify.com/v1/me/player/currently-playing', {
      headers: { Authorization: `Bearer ${access_token}` },
    });

    if (spotRes.status === 204) return json({ isPlaying: false });
    if (spotRes.status >= 400) return json({ isPlaying: false, error: spotRes.status });

    const data = await spotRes.json();
    if (!data?.item)  return json({ isPlaying: false });

    return json({
      isPlaying: data.is_playing,
      title:     data.item.name,
      artist:    data.item.artists.map(a => a.name).join(', '),
      album:     data.item.album.name,
      albumArt:  data.item.album.images[1]?.url ?? data.item.album.images[0]?.url,
      songUrl:   data.item.external_urls.spotify,
    });
  } catch (err) {
    console.error('Spotify error:', err.message);
    return json({ isPlaying: false });
  }
}

// ── HTTP server ────────────────────────────────────────────────────────────
const server = http.createServer(async (req, res) => {
  const urlPath = req.url.split('?')[0];

  // API routes
  if (urlPath === '/api/now-playing') {
    return handleNowPlaying(res);
  }

  // Static files
  let filePath = path.join(ROOT, urlPath);

  if (fs.existsSync(filePath) && fs.statSync(filePath).isDirectory()) {
    const indexHtml = path.join(filePath, 'index.html');
    if (fs.existsSync(indexHtml)) filePath = indexHtml;
    else { send404(res); return; }
  }

  if (urlPath === '/') filePath = path.join(ROOT, 'index.html');

  fs.readFile(filePath, (err, data) => {
    if (err) { send404(res); return; }
    const ext  = path.extname(filePath).toLowerCase();
    const mime = MIME[ext] || 'application/octet-stream';
    res.writeHead(200, { 'Content-Type': mime });
    res.end(data);
  });
});

function send404(res) {
  res.writeHead(404, { 'Content-Type': 'text/plain' });
  res.end('404 Not Found');
}

server.listen(PORT, () => {
  console.log(`Portfolio running at http://localhost:${PORT}`);
  console.log(`  /                 → index.html`);
  console.log(`  /login            → login/index.html`);
  console.log(`  /cms              → cms/index.html`);
  console.log(`  /api/now-playing  → Spotify API`);
  console.log('\nSpotify env vars:', process.env.SPOTIFY_CLIENT_ID ? '✓ set' : '✗ not set');
  console.log('\nPress Ctrl+C to stop.');
});
