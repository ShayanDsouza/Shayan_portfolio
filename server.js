// Static-file server + local API routes (mirrors Vercel serverless functions)
const http  = require('http');
const fs    = require('fs');
const path  = require('path');

// Load .env file if present (local dev only — never committed)
const envPath = path.join(__dirname, '.env');
if (fs.existsSync(envPath)) {
  fs.readFileSync(envPath, 'utf8').split('\n').forEach(line => {
    const [key, ...vals] = line.trim().split('=');
    if (key && !key.startsWith('#')) process.env[key] = vals.join('=');
  });
}

const PORT = process.env.PORT || 3000;
const ROOT = __dirname;
const MAX_JSON_BODY_BYTES = 64 * 1024;

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
  '.mp3':  'audio/mpeg',
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
// ── API: /api/generate-sound ──────────────────────────────────────────────
function readJsonBody(req) {
  return new Promise((resolve, reject) => {
    let raw = '';
    let size = 0;
    let settled = false;

    const cleanup = () => {
      req.off('data', onData);
      req.off('end', onEnd);
      req.off('error', onError);
    };

    const finish = (fn, value) => {
      if (settled) return;
      settled = true;
      cleanup();
      fn(value);
    };

    const onData = chunk => {
      size += chunk.length;
      if (size > MAX_JSON_BODY_BYTES) {
        req.resume();
        finish(reject, { status: 413, body: { ok: false, error: 'Request body too large' } });
        return;
      }
      raw += chunk;
    };

    const onEnd = () => {
      if (!raw) {
        finish(resolve, {});
        return;
      }

      try {
        finish(resolve, JSON.parse(raw));
      } catch {
        finish(resolve, {});
      }
    };

    const onError = () => {
      finish(reject, { status: 400, body: { ok: false, error: 'Invalid request body' } });
    };

    req.on('data', onData);
    req.on('end', onEnd);
    req.on('error', onError);
  });
}

async function handleGenerateSound(req, res) {
  const ELEVENLABS_API_KEY = process.env.ELEVENLABS_API_KEY;

  const json = (status, data) => {
    res.writeHead(status, { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' });
    res.end(JSON.stringify(data));
  };

  if (!ELEVENLABS_API_KEY) {
    return json(500, { ok: false, error: 'ElevenLabs API key is not configured' });
  }

  let body;
  try {
    body = await readJsonBody(req);
  } catch (err) {
    return json(err.status || 400, err.body || { ok: false, error: 'Invalid request body' });
  }

  const { prompt, duration } = body;
  if (!prompt?.trim()) {
    return json(400, { ok: false, error: 'Prompt is required' });
  }

  try {
    const durationSeconds = duration ? parseFloat(duration) : undefined;
    const response = await fetch('https://api.elevenlabs.io/v1/sound-generation', {
      method: 'POST',
      headers: {
        'xi-api-key': ELEVENLABS_API_KEY,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        text: prompt.trim(),
        duration_seconds: durationSeconds,
        prompt_influence: 0.8
      })
    });

    if (!response.ok) {
      const errText = await response.text();
      console.error('ElevenLabs local API error:', errText);
      return json(response.status, { ok: false, error: `ElevenLabs failed: ${errText}` });
    }

    const arrayBuffer = await response.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    res.writeHead(200, {
      'Content-Type': 'audio/mpeg',
      'Content-Length': buffer.length,
      'Cache-Control': 'no-store'
    });
    res.end(buffer);
  } catch (err) {
    console.error('Local generate sound error:', err.message);
    return json(500, { ok: false, error: 'Server error' });
  }
}

// ── API: /api/contact ──────────────────────────────────────────────────────
async function handleContact(req, res) {
  const RESEND_API_KEY = process.env.RESEND_API_KEY;
  const TO_EMAIL       = process.env.CONTACT_EMAIL || 'dsouza.shayan@gmail.com';

  const json = (status, data) => {
    res.writeHead(status, { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' });
    res.end(JSON.stringify(data));
  };

  if (!RESEND_API_KEY) {
    return json(500, { ok: false, error: 'Email service not configured' });
  }

  let body;
  try {
    body = await readJsonBody(req);
  } catch (err) {
    return json(err.status || 400, err.body || { ok: false, error: 'Invalid request body' });
  }

  const { name, email, topic, message } = body;
  if (!name?.trim())  return json(400, { ok: false, error: 'Name is required' });
  if (!email?.trim() || !/.+@.+\..+/.test(email)) return json(400, { ok: false, error: 'Valid email is required' });
  if (!message?.trim()) return json(400, { ok: false, error: 'Message is required' });

  const subject = `Portfolio Contact : ${(topic || 'No subject').trim()}`;

  const escapeHtml = s => s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');

  const textBody = `Name: ${name.trim()}\nEmail: ${email.trim()}\nSubject: ${(topic||'N/A').trim()}\n\nMessage:\n${message.trim()}`;
  const htmlBody = `
    <div style="font-family: -apple-system, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px;">
      <div style="background: #0a0a0a; border: 1px solid #222; border-radius: 8px; padding: 24px; color: #c8c0b4;">
        <h2 style="margin: 0 0 20px; color: #e8e0d4; font-size: 18px; border-bottom: 1px solid #222; padding-bottom: 12px;">🔥 New Beacon Signal</h2>
        <table style="width: 100%; font-size: 14px; border-collapse: collapse;">
          <tr><td style="padding: 8px 12px; color: #8a7a5a; font-weight: 600;">From</td><td style="padding: 8px 12px; color: #c8c0b4;">${escapeHtml(name.trim())}</td></tr>
          <tr><td style="padding: 8px 12px; color: #8a7a5a; font-weight: 600;">Email</td><td style="padding: 8px 12px;"><a href="mailto:${escapeHtml(email.trim())}" style="color: #8a1520;">${escapeHtml(email.trim())}</a></td></tr>
          <tr><td style="padding: 8px 12px; color: #8a7a5a; font-weight: 600;">Subject</td><td style="padding: 8px 12px; color: #c8c0b4;">${escapeHtml((topic||'N/A').trim())}</td></tr>
        </table>
        <div style="margin-top: 20px; padding: 16px; background: #111; border: 1px solid #1a1a1a; border-radius: 4px;">
          <div style="font-size: 10px; text-transform: uppercase; letter-spacing: 0.15em; color: #8a7a5a; margin-bottom: 8px;">Message</div>
          <div style="color: #c8c0b4; font-size: 14px; line-height: 1.6; white-space: pre-wrap;">${escapeHtml(message.trim())}</div>
        </div>
        <div style="margin-top: 20px; font-size: 11px; color: #3a3630; text-align: center;">Sent from your portfolio contact form</div>
      </div>
    </div>`;

  try {
    const resendRes = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${RESEND_API_KEY}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ from: 'Portfolio <onboarding@resend.dev>', to: [TO_EMAIL], reply_to: email.trim(), subject, html: htmlBody, text: textBody }),
    });
    const result = await resendRes.json();
    if (!resendRes.ok) {
      console.error('Resend error:', result);
      return json(500, { ok: false, error: 'Failed to send email' });
    }
    return json(200, { ok: true });
  } catch (err) {
    console.error('Contact error:', err.message);
    return json(500, { ok: false, error: 'Server error' });
  }
}

// ── HTTP server ────────────────────────────────────────────────────────────
const server = http.createServer(async (req, res) => {
  const urlPath = req.url.split('?')[0];

  // API routes
  if (urlPath === '/api/now-playing') {
    return handleNowPlaying(res);
  }

  if (urlPath === '/api/contact' && req.method === 'POST') {
    return handleContact(req, res);
  }

  if (urlPath === '/api/generate-sound' && req.method === 'POST') {
    return handleGenerateSound(req, res);
  }

  // Static files
  let filePath = path.join(ROOT, urlPath);

  // Security: prevent path traversal (e.g. ../../etc/passwd)
  if (!filePath.startsWith(ROOT + path.sep) && filePath !== ROOT) {
    send404(res); return;
  }

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
