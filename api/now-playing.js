// Vercel serverless function — Spotify Now Playing
// Keeps client_secret server-side, safe from the browser.

const CLIENT_ID     = process.env.SPOTIFY_CLIENT_ID;
const CLIENT_SECRET = process.env.SPOTIFY_CLIENT_SECRET;
const REFRESH_TOKEN = process.env.SPOTIFY_REFRESH_TOKEN;

const TOKEN_URL    = 'https://accounts.spotify.com/api/token';
const NOW_PLAYING  = 'https://api.spotify.com/v1/me/player/currently-playing';

async function getAccessToken() {
  const basic = Buffer.from(`${CLIENT_ID}:${CLIENT_SECRET}`).toString('base64');
  const res = await fetch(TOKEN_URL, {
    method: 'POST',
    headers: {
      Authorization: `Basic ${basic}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({
      grant_type:    'refresh_token',
      refresh_token: REFRESH_TOKEN,
    }),
  });
  const data = await res.json();
  return data.access_token;
}

module.exports = async function handler(req, res) {
  // CORS — restrict to production domain
  res.setHeader('Access-Control-Allow-Origin', 'https://shayan-dsouza.vercel.app');
  res.setHeader('Cache-Control', 'no-store, max-age=0');

  try {
    const token    = await getAccessToken();
    const spotRes  = await fetch(NOW_PLAYING, {
      headers: { Authorization: `Bearer ${token}` },
    });

    // 204 = nothing playing, 401/403 = auth error
    if (spotRes.status === 204) {
      return res.status(200).json({ isPlaying: false });
    }
    if (spotRes.status >= 400) {
      return res.status(200).json({ isPlaying: false, error: spotRes.status });
    }

    const data = await spotRes.json();

    if (!data?.item) {
      return res.status(200).json({ isPlaying: false });
    }

    return res.status(200).json({
      isPlaying: data.is_playing,
      title:     data.item.name,
      artist:    data.item.artists.map(a => a.name).join(', '),
      album:     data.item.album.name,
      albumArt:  data.item.album.images[1]?.url ?? data.item.album.images[0]?.url,
      songUrl:   data.item.external_urls.spotify,
    });
  } catch (err) {
    console.error('Spotify error:', err);
    return res.status(200).json({ isPlaying: false });
  }
}
