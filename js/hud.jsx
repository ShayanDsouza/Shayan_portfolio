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
      </div>

      <div className="hud-right">
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

function QuestLog() {
  const s = useGameState();
  const all = Object.values(window.ACHIEVEMENTS);
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
