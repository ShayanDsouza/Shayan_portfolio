// Global Audio Engine: manages BGM, sound effects, cross-fading ambient soundscapes, and mute state.

(function() {
  let isMuted = localStorage.getItem('witcher_audio_muted') === 'true';
  const sfxCache = {};
  
  // Ambient Soundscape Management
  const BIOME_AMBIENTS = {
    BOOT:     'ambient-bg',
    HERO:     'ambient-bg',
    ABOUT:    'ambient_about',
    PROJECTS: 'ambient_projects',
    CONTACT:  'ambient_contact'
  };

  let activeAmbientId = null;
  let activeAmbientAudio = null;
  const ambientCache = {};

  // Helper function to handle smooth volume fading
  function fadeVolume(audio, targetVolume, durationMs, callback) {
    if (!audio) return;
    
    // Clear any active fade interval on this specific audio object
    if (audio.fadeInterval) clearInterval(audio.fadeInterval);
    
    const startVolume = audio.volume;
    const steps = 25;
    const stepTime = durationMs / steps;
    const volumeStep = (targetVolume - startVolume) / steps;
    let currentStep = 0;
    
    audio.fadeInterval = setInterval(() => {
      currentStep++;
      const newVol = startVolume + volumeStep * currentStep;
      audio.volume = Math.max(0, Math.min(1, newVol));
      
      if (currentStep >= steps) {
        clearInterval(audio.fadeInterval);
        audio.fadeInterval = null;
        audio.volume = targetVolume;
        if (callback) callback();
      }
    }, stepTime);
  }

  // Individual Sound Effect Volume Adjustments (fine-tuned decibel balance)
  const SFX_VOLUMES = {
    level_up: 0.18,       // Softened Mario rising chime (highly requested to prevent sharp/loud audio)
    click_ui: 0.35,       // Subtle hover click
    stone_hover: 0.3,     // Quiet dialogue choices click
    sword_draw: 0.5,      // Balanced heroic sword draw
    parchment_open: 0.45, // Crisp paper notice board scroll open
    parchment_close: 0.5, // Clean paper fold close
    beacon_ignite: 0.5    // Fire Igni spell ignition
  };

  const soundManager = {
    isMuted() {
      return isMuted;
    },

    toggleMute() {
      isMuted = !isMuted;
      localStorage.setItem('witcher_audio_muted', isMuted);
      
      // Update all SFX cache mute state
      Object.values(sfxCache).forEach(audio => {
        audio.muted = isMuted;
      });

      // Update ambient loop playback
      if (isMuted) {
        if (activeAmbientAudio) {
          fadeVolume(activeAmbientAudio, 0, 800, () => {
            activeAmbientAudio.pause();
          });
        }
      } else {
        // Unmuting: resume or start the current active biome track
        if (activeAmbientId) {
          this.resumeAmbient();
        }
      }

      // Dispatch event to update React UI triggers
      window.dispatchEvent(new CustomEvent('witcher_audio_mute_change', { detail: { isMuted } }));
      
      // Play a confirmation click when unmuting
      if (!isMuted) {
        this.play('stone_hover');
      }
    },

    prime() {
      // satisfy browser gesture requirement
      if (activeAmbientAudio && !activeAmbientAudio.paused) return;
      
      if (!isMuted && activeAmbientId) {
        this.resumeAmbient();
      }
    },

    resumeAmbient() {
      if (isMuted || !activeAmbientId) return;
      
      const trackId = activeAmbientId;
      if (!ambientCache[trackId]) {
        ambientCache[trackId] = new Audio(`sounds/${trackId}.mp3`);
        ambientCache[trackId].loop = true;
        ambientCache[trackId].volume = 0;
      }
      
      const audio = ambientCache[trackId];
      activeAmbientAudio = audio;
      audio.muted = isMuted;
      
      if (audio.paused) {
        audio.volume = 0;
        audio.play()
          .then(() => {
            const targetVol = trackId === 'ambient-bg' ? 0.55 : 0.45;
            fadeVolume(audio, targetVol, 1500);
          })
          .catch(e => console.log('SoundScape playback priming deferred until gesture:', e.message));
      }
    },

    play(soundId) {
      if (isMuted) return;

      const targetVol = SFX_VOLUMES[soundId] !== undefined ? SFX_VOLUMES[soundId] : 0.65;

      // Lazy load SFX to save network bandwidth
      if (!sfxCache[soundId]) {
        sfxCache[soundId] = new Audio(`sounds/${soundId}.mp3`);
        sfxCache[soundId].muted = isMuted;
      }
      
      const audio = sfxCache[soundId];
      audio.currentTime = 0;
      audio.volume = targetVol;
      audio.play().catch(err => {
        console.warn(`Sound play failed for "${soundId}":`, err.message);
      });
    },

    transitionToBiome(biome) {
      const targetId = BIOME_AMBIENTS[biome];
      if (!targetId || targetId === activeAmbientId) return;
      
      const prevAudio = activeAmbientAudio;
      activeAmbientId = targetId;
      
      console.log(`[SoundScape] Transitioning biome to: ${biome} (Track: ${targetId})`);
      
      // 1. Fade out previous loop smoothly over 1.5 seconds
      if (prevAudio) {
        fadeVolume(prevAudio, 0, 1500, () => {
          prevAudio.pause();
        });
      }
      
      if (isMuted) return;
      
      // 2. Play and fade in the target loop over 1.5 seconds
      if (!ambientCache[targetId]) {
        ambientCache[targetId] = new Audio(`sounds/${targetId}.mp3`);
        ambientCache[targetId].loop = true;
        ambientCache[targetId].volume = 0;
      }
      
      const nextAudio = ambientCache[targetId];
      activeAmbientAudio = nextAudio;
      nextAudio.muted = isMuted;
      
      nextAudio.currentTime = 0;
      nextAudio.volume = 0;
      
      nextAudio.play()
        .then(() => {
          const targetVol = targetId === 'ambient-bg' ? 0.55 : 0.45;
          fadeVolume(nextAudio, targetVol, 1500);
        })
        .catch(e => {
          console.warn(`[SoundScape] Audio playback deferred for loop "${targetId}":`, e.message);
        });
    }
  };

  // SoundToggle Button Component for top-right HUD
  function SoundToggle() {
    const [muted, setMuted] = React.useState(soundManager.isMuted());

    React.useEffect(() => {
      const handleMuteChange = (e) => setMuted(e.detail.isMuted);
      window.addEventListener('witcher_audio_mute_change', handleMuteChange);
      return () => window.removeEventListener('witcher_audio_mute_change', handleMuteChange);
    }, []);

    const toggle = (e) => {
      e.stopPropagation();
      soundManager.prime(); // prime on interaction
      soundManager.toggleMute();
    };

    return (
      <button 
        className="hud-audio-btn" 
        onClick={toggle}
        title={muted ? "Unmute Witcher Audio" : "Mute Witcher Audio"}
        aria-label="Toggle Sound Effects and Music"
      >
        <span style={{ marginRight: 6 }}>
          {muted ? '🔇' : '🔊'}
        </span>
        <span>SOUND: {muted ? 'OFF' : 'ON'}</span>
      </button>
    );
  }

  // Pre-set the initial biome active state to BOOT
  activeAmbientId = BIOME_AMBIENTS['BOOT'];

  // Export globally
  Object.assign(window, { soundManager, SoundToggle });
})();
