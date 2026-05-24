// HUD: persistent UI chrome — biome label, level/xp, mini-map, quest log

function HUD() {
  const s = useGameState();

  const biomes = [
    { id: 'HERO',     label: 'Title Card',   target: '#hero'     },
    { id: 'ABOUT',    label: 'The Frontier', target: '#about'    },
    { id: 'PROJECTS', label: 'Notice Board', target: '#projects' },
    { id: 'CONTACT',  label: 'The Beacon',   target: '#contact'  },
  ];
  const currentBiome = biomes.find(b => b.id === s.biome) || biomes[0];

  return (
    <>
      <div className="hud">
        <div className="hud-block hud-biome">
          NOW IN: {currentBiome.label}
        </div>
        <HudF1Mini />
      </div>

      <div className="hud-right">
        <SoundToggle />
        <button className="hud-quest-btn" onClick={() => window.gameStore.toggleQuestLog(true)}>
          ⚔ Quest Log [Q]
        </button>
      </div>

      {/* Mini-map */}
      <div className="minimap">
        <div className="minimap-title">
          <span>WORLD MAP</span>
        </div>
        <div className="minimap-track">
          {biomes.map(b => (
            <a key={b.id} href={b.target} className={'minimap-node' + (b.id === s.biome ? ' active' : '')}>
              <span className="dot">●</span>
              <span>{b.label}</span>
            </a>
          ))}
        </div>
      </div>

      {/* Quest log overlay */}
      {s.questLogOpen ? <QuestLog /> : null}
    </>
  );
}

function HudF1Mini() {
  const f1 = window.useF1State();
  if (!f1 || f1.mode === 'load') return null;

  const isLive = f1.mode === 'live';
  const isResults = f1.mode === 'results';

  let icon = null;
  if (isLive) {
    icon = (
      <svg className="hud-f1-icon live-pulse" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden="true">
        <circle cx="12" cy="12" r="2" fill="currentColor"/>
        <path d="M16.24 7.76a6 6 0 0 1 0 8.49M7.76 7.76a6 6 0 0 0 0 8.49M19.07 4.93a10 10 0 0 1 0 14.14M4.93 4.93a10 10 0 0 0 0 14.14"/>
      </svg>
    );
  } else if (isResults) {
    icon = (
      <svg className="hud-f1-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z"/>
        <line x1="4" y1="22" x2="4" y2="15"/>
      </svg>
    );
  } else {
    icon = (
      <svg className="hud-f1-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <circle cx="12" cy="12" r="10"/>
        <polyline points="12 6 12 12 16 14"/>
      </svg>
    );
  }

  return (
    <div className={'hud-block hud-f1' + (isLive ? ' hud-f1-live' : '')}>
      <span className="hud-f1-flag">{icon}</span>
      <div className="hud-f1-info">
        <span className="hud-f1-race">{f1.raceName || 'Grand Prix'}</span>
        <span className="hud-f1-time">
          {isLive
            ? `LIVE · ${f1.sessionLabel}`
            : isResults
              ? `${f1.sessionLabel} · FINAL`
              : f1.countdown
          }
        </span>
      </div>
    </div>
  );
}

function QuestLog() {
  const s = useGameState();
  const all = Object.values(window.ACHIEVEMENTS);

  React.useEffect(() => {
    if (window.soundManager) {
      window.soundManager.play('parchment_open');
    }
    return () => {
      if (window.soundManager) {
        window.soundManager.play('parchment_close');
      }
    };
  }, []);

  return (
    <div className="quest-log-overlay" onClick={(e) => { if (e.target === e.currentTarget) window.gameStore.toggleQuestLog(false); }}>
      <div className="quest-log">
        <button className="quest-log-close" onClick={() => window.gameStore.toggleQuestLog(false)}>×</button>
        <h2>QUEST LOG</h2>
        <p style={{ marginBottom: 16, fontSize: 13, fontStyle: 'italic' }}>
          A record of your travels. {s.achievements.length} of {all.length} waypoints visited.
        </p>
        {all.map(a => {
          const got = s.achievements.includes(a.id);
          return (
            <div key={a.id} className="quest-log-item" style={{ opacity: got ? 1 : .5 }}>
              <div className="meta">{got ? '✓ VISITED' : '✗ UNVISITED'} · +{a.xp} XP</div>
              <h4>{got ? a.title : '???'}</h4>
              <p>{got ? a.desc : 'Keep scrolling to discover.'}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
}

Object.assign(window, { HUD });
