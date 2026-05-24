// local development CLI tool to pre-generate and cache sound effects using ElevenLabs
const fs = require('fs');
const path = require('path');

console.log('\n\x1b[33m==================================================');
console.log('⚔️  WITCHER AUDIO SYSTEM: ELEVENLABS SFX GENERATOR  ⚔️');
console.log('==================================================\x1b[0m\n');

// 1. Load .env file
const envPath = path.join(__dirname, '..', '.env');
if (fs.existsSync(envPath)) {
  fs.readFileSync(envPath, 'utf8').split('\n').forEach(line => {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) return;
    const index = trimmed.indexOf('=');
    if (index === -1) return;
    const key = trimmed.substring(0, index).trim();
    const val = trimmed.substring(index + 1).trim();
    process.env[key] = val;
  });
  console.log('✓ Loaded local .env file configuration.');
}

const API_KEY = process.env.ELEVENLABS_API_KEY;

// 2. Define the witcher sound effects map
const SOUND_EFFECTS = [
  {
    id: 'sword_draw',
    prompt: 'A sharp and dramatic medieval steel sword draw, fast and heavy slash, medieval fantasy vibe, cinematic',
    duration: 1.8
  },
  {
    id: 'parchment_open',
    prompt: 'Unrolling a dry rustic parchment paper scroll, crisp leather rustle, medieval quest board feel, short',
    duration: 1.2
  },
  {
    id: 'parchment_close',
    prompt: 'Quick crisp folding of an old paper letter, short medieval sheet rustle',
    duration: 0.8
  },
  {
    id: 'beacon_ignite',
    prompt: 'Epic crackling campfire bonfire igniting suddenly with a whoosh of flames, magical fire burst, heavy igni spell',
    duration: 3.0
  },
  {
    id: 'stone_hover',
    prompt: 'Soft stone click or dull metallic dagger ring, medieval key sliding into a lock, very short and subtle',
    duration: 0.5
  },
  {
    id: 'level_up',
    prompt: 'Classic retro 8-bit video game power-up sound, rising chiptune arcade chime, positive pixel sound effect, short',
    duration: 1.2
  },
  {
    id: 'click_ui',
    prompt: 'A quiet leather wrap rustle, subtle wooden button click, medieval tactile UI sound',
    duration: 0.5
  },
  {
    id: 'ambient_about',
    prompt: 'Gentle crackling wood campfire, cozy fireplace embers popping, relaxing fire warmth, looping ambient',
    duration: 15.0
  },
  {
    id: 'ambient_projects',
    prompt: 'Low ambient rustic medieval tavern chatter, soft background murmurs, distant clinking mugs, medieval inn loop',
    duration: 15.0
  },
  {
    id: 'ambient_contact',
    prompt: 'Cinematic mountain summit wind howling, slow soft whistling breeze, epic high altitude cold wind loop',
    duration: 15.0
  }
];

const SOUNDS_DIR = path.join(__dirname, '..', 'sounds');

// 3. Instructions if API key is missing
if (!API_KEY) {
  console.log('\n\x1b[31m⚠️  ELEVENLABS_API_KEY IS NOT SET IN YOUR .ENV FILE!\x1b[0m');
  console.log('To generate these sounds, please follow these steps:');
  console.log('  1. Go to ElevenLabs (https://elevenlabs.io) and sign up/log in.');
  console.log('  2. Click your profile (bottom left) and copy your API Key.');
  console.log('  3. Paste it into your \x1b[36m.env\x1b[0m file: \x1b[32mELEVENLABS_API_KEY=your_key_here\x1b[0m');
  console.log('  4. Re-run this script: \x1b[35mnpm run generate-sfx\x1b[0m\n');
  console.log('\x1b[36mSuggested prompts for manual generation or dry-run reference:\x1b[0m');
  SOUND_EFFECTS.forEach(s => {
    console.log(`  - \x1b[33m${s.id}.mp3\x1b[0m: "${s.prompt}" (${s.duration}s)`);
  });
  console.log('\n\x1b[90mNote: You can also place any custom .mp3 file with these exact names inside the /sounds/ folder directly!\x1b[0m\n');
  process.exit(0);
}

// 4. Create sounds directory
if (!fs.existsSync(SOUNDS_DIR)) {
  fs.mkdirSync(SOUNDS_DIR);
  console.log(`✓ Created directory: ${SOUNDS_DIR}`);
}

// 5. Generate sounds
async function generateAll() {
  console.log(`\n🔊 Starting generation of \x1b[36m${SOUND_EFFECTS.length}\x1b[0m Witcher SFX...\n`);
  
  for (const sfx of SOUND_EFFECTS) {
    const destPath = path.join(SOUNDS_DIR, `${sfx.id}.mp3`);
    
    // Check if already exists to save characters
    if (fs.existsSync(destPath)) {
      console.log(`  [SKIP] \x1b[90m${sfx.id}.mp3 already exists. Delete it if you wish to re-generate it.\x1b[0m`);
      continue;
    }
    
    console.log(`  [GEN] Generating \x1b[33m${sfx.id}.mp3\x1b[0m...`);
    console.log(`        Prompt: "${sfx.prompt}"`);
    
    try {
      const response = await fetch('https://api.elevenlabs.io/v1/sound-generation', {
        method: 'POST',
        headers: {
          'xi-api-key': API_KEY,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          text: sfx.prompt,
          duration_seconds: sfx.duration,
          prompt_influence: 0.8
        })
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`ElevenLabs API returned ${response.status}: ${errorText}`);
      }
      
      const buffer = Buffer.from(await response.arrayBuffer());
      fs.writeFileSync(destPath, buffer);
      console.log(`        \x1b[32m✓ Successfully saved to sounds/${sfx.id}.mp3 (${buffer.length} bytes)\x1b[0m`);
    } catch (err) {
      console.error(`        \x1b[31m✗ Generation failed for ${sfx.id}: ${err.message}\x1b[0m`);
    }
    
    // Slight pause to respect rate limits
    await new Promise(r => setTimeout(r, 1000));
  }

  // Generate starting screen background music (BGM)
  await generateBGM();
  
  console.log('\n\x1b[32m⚔️  SOUND EFFECTS GENERATION PROCESS COMPLETE!  ⚔️\x1b[0m\n');
}

async function generateBGM() {
  const destPath = path.join(SOUNDS_DIR, 'ambient-bg.mp3');
  
  if (fs.existsSync(destPath)) {
    console.log(`  [SKIP] \x1b[90mambient-bg.mp3 already exists. Delete it if you wish to re-generate it.\x1b[0m`);
    return;
  }
  
  console.log(`\n🎼 Generating starting screen background music \x1b[33mambient-bg.mp3\x1b[0m using ElevenLabs Music API...`);
  const bgmPrompt = 'A chaotic, sparse, melancholic acoustic guitar tremolo melody in the style of The Last of Us and Red Dead 2, backed by a slow dusty lo-fi hip-hop drum beat, deep warm bass, and a gentle, weeping 8-bit chiptune whistle lead. Atmospheric, emotional, instrumental only.';
  console.log(`        Prompt: "${bgmPrompt}"`);
  
  try {
    const response = await fetch('https://api.elevenlabs.io/v1/music', {
      method: 'POST',
      headers: {
        'xi-api-key': API_KEY,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        prompt: bgmPrompt,
        music_length_ms: 30000, // 30 seconds
        force_instrumental: true
      })
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`ElevenLabs API returned ${response.status}: ${errorText}`);
    }
    
    const buffer = Buffer.from(await response.arrayBuffer());
    fs.writeFileSync(destPath, buffer);
    console.log(`        \x1b[32m✓ Successfully saved BGM to sounds/ambient-bg.mp3 (${buffer.length} bytes)\x1b[0m`);
  } catch (err) {
    console.error(`        \x1b[31m✗ BGM generation failed: ${err.message}\x1b[0m`);
  }
}

generateAll();
