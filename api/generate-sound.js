// Vercel serverless function — ElevenLabs Sound Effects dynamic generator
// Serves POST requests with { prompt, duration } and returns binary MP3 audio

const API_KEY = process.env.ELEVENLABS_API_KEY;

module.exports = async function handler(req, res) {
  // Only allow POST
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  res.setHeader('Cache-Control', 'no-store');

  if (!API_KEY) {
    console.error('ELEVENLABS_API_KEY is not configured in environment variables');
    return res.status(500).json({ ok: false, error: 'ElevenLabs API key is not configured' });
  }

  try {
    const { prompt, duration } = req.body;

    if (!prompt?.trim()) {
      return res.status(400).json({ ok: false, error: 'Prompt is required' });
    }

    const durationSeconds = duration ? parseFloat(duration) : undefined;

    // Contact ElevenLabs Text-to-Sound-Effects API
    const response = await fetch('https://api.elevenlabs.io/v1/sound-generation', {
      method: 'POST',
      headers: {
        'xi-api-key': API_KEY,
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
      console.error('ElevenLabs API returned error response:', errText);
      return res.status(response.status).json({ ok: false, error: `ElevenLabs failed: ${errText}` });
    }

    // Forward the binary MP3 stream
    const arrayBuffer = await response.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    
    res.setHeader('Content-Type', 'audio/mpeg');
    res.setHeader('Content-Length', buffer.length);
    return res.status(200).send(buffer);
  } catch (err) {
    console.error('Sound generation serverless error:', err);
    return res.status(500).json({ ok: false, error: 'Server error generating sound' });
  }
};
