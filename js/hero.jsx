// Hero — dark noir comic title card + live telemetry (F1 + Spotify)

// Shared F1 state — lets HUD read countdown data without prop drilling
const _f1Listeners = new Set();
const _f1State = { mode: 'load', raceName: '', countdown: '--:--:--:--', sessionLabel: '' };
function setF1State(patch) {
  Object.assign(_f1State, patch);
  _f1Listeners.forEach(fn => fn({ ..._f1State }));
}
function useF1State() {
  const [s, setS] = React.useState({ ..._f1State });
  React.useEffect(() => {
    _f1Listeners.add(setS);
    return () => _f1Listeners.delete(setS);
  }, []);
  return s;
}
window.useF1State = useF1State;

const REST_QUIPS = [
  { mood: 'Silence — the rarest track in existence',       detail: 'not currently playing · ears resting' },
  { mood: 'Streaming: ambient keyboard clicks',            detail: 'lo-fi · mechanical · 60wpm' },
  { mood: '404: Music not found',                          detail: 'have you tried turning it off and on again' },
  { mood: 'Currently loading next banger…',                detail: 'buffering · please stand by · ♪' },
  { mood: 'The aux cord is charging',                      detail: 'standby mode · do not unplug' },
  { mood: 'Vibing with: the sound of compilation errors',  detail: 'syntax error jazz · undefined groove' },
  { mood: 'Off-duty. Guitar is also on break.',            detail: 'all instruments resting · come back later' },
];

function Hero() {
  const ref = React.useRef(null);

  React.useEffect(() => {
    const obs = new IntersectionObserver(([e]) => {
      if (e.isIntersecting && e.intersectionRatio > 0.4) {
        window.gameStore.setBiome('HERO');
        window.gameStore.unlock('hero');
      }
    }, { threshold: [0.4] });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);

  const firstName = getCMS('hero.firstName', 'SHAYAN');
  const lastName  = getCMS('hero.lastName',  'DSOUZA');
  const tagline   = getCMS('hero.tagline',   'Full-stack dev · Toronto, ON · CS @ UofT');
  const status    = getCMS('hero.status',    "AVAILABLE FALL '26");

  return (
    <section className="world-hero" id="hero" ref={ref}>
      <div className="hero-comic-grid">
        {/* Name panel */}
        <div className="comic-panel tilt-l" style={{ gridColumn: '1 / 2', gridRow: '1 / 2', padding: 28, position: 'relative' }}>
          <div className="comic-caption">// PLAYER 01</div>
          <h1 className="comic-name">
            {firstName}<br/>
            <span>{lastName}</span>
          </h1>
          <p style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 12, marginTop: 16, letterSpacing: '.15em', textTransform: 'uppercase', opacity: .7 }}>
            {tagline}
          </p>
          <div className="halftone-dots"></div>
        </div>

        {/* Mission brief panel */}
        <div className="comic-panel tilt-r" style={{ gridColumn: '2 / 3', gridRow: '1 / 2' }}>
          <div className="comic-caption">// MISSION BRIEF</div>
          <p className="comic-thought">
            Our hero ships <b>full-stack web apps</b> by day,
            chases <b>apex clips</b> by night, and accidentally
            <b> learns guitar solos</b> in between.
          </p>
          <div style={{ marginTop: 16, fontFamily: "'JetBrains Mono', monospace", fontSize: 11, letterSpacing: '.15em', textTransform: 'uppercase', opacity: .8 }}>
            <div>◇ CLASS: Full-Stack Mage</div>
            <div>◇ ALIGNMENT: Lawful Caffeinated</div>
            <div>◇ STATUS: <span style={{ color: 'var(--accent)' }}>● {status}</span></div>
          </div>
        </div>

        {/* Stats panel */}
        <div className="comic-panel" style={{ gridColumn: '1 / 2', gridRow: '2 / 3', padding: 24 }}>
          <div className="comic-caption">// PLAYER STATS</div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, alignItems: 'end' }}>
            <div>
              <div className="comic-stat-label">Projects</div>
              <div className="comic-stat">08</div>
            </div>
            <div>
              <div className="comic-stat-label">Coffees/d</div>
              <div className="comic-stat">∞</div>
            </div>
            <div>
              <div className="comic-stat-label">Race PB</div>
              <div className="comic-stat">1:29</div>
            </div>
          </div>
        </div>

        {/* CTA panel */}
        <div className="comic-panel tilt-r" style={{ gridColumn: '2 / 3', gridRow: '2 / 3', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', gap: 12 }}>
          <div className="comic-caption">// CHOOSE YOUR PATH</div>
          <a href="#projects" className="hero-cta hero-cta-primary">► VIEW THE WORK</a>
          <a href="#contact"  className="hero-cta hero-cta-bone">► LIGHT THE BEACON</a>
          <a href="#about"    className="hero-cta hero-cta-ghost">► READ THE LORE</a>
        </div>

        {/* Telemetry strip — spans full width, row 3 */}
        <div className="hero-telemetry" style={{ gridColumn: '1 / -1', gridRow: '3 / 4' }}>
          <F1Cell />
          <NowPlayingCell />
        </div>
      </div>
    </section>
  );
}

/* ── F1 Countdown (API-powered) ─────────────────── */

// Session duration estimates (minutes) for detecting "live" windows
const SESSION_DURATIONS = {
  FirstPractice: 60, SecondPractice: 60, ThirdPractice: 60,
  SprintQualifying: 45, Sprint: 40, Qualifying: 90, Race: 180,
};

const SESSION_LABELS = {
  FirstPractice: 'Practice 1', SecondPractice: 'Practice 2', ThirdPractice: 'Practice 3',
  SprintQualifying: 'Sprint Quali', Sprint: 'Sprint', Qualifying: 'Qualifying', Race: 'Race',
};

// OpenF1 session_name values for matching
const OPENF1_SESSION_MAP = {
  FirstPractice: 'Practice 1', SecondPractice: 'Practice 2', ThirdPractice: 'Practice 3',
  SprintQualifying: 'Sprint Qualifying', Sprint: 'Sprint', Qualifying: 'Qualifying', Race: 'Race',
};

function F1Cell() {
  const [schedule, setSchedule] = React.useState(null);   // { raceName, sessions: [{key, label, start, end}] }
  const [mode, setMode]         = React.useState('load');  // 'load' | 'countdown' | 'live' | 'results'
  const [countdown, setCountdown] = React.useState('--:--:--:--');
  const [activeSession, setActiveSession] = React.useState(null);
  const [nextSession, setNextSession]     = React.useState(null);
  const [podium, setPodium]     = React.useState(null);    // [{name, team, pos}]
  const [error, setError]       = React.useState(false);

  // 1. Fetch next race schedule from Jolpica-F1
  React.useEffect(() => {
    let alive = true;
    
    // Check if simulating live mode via query parameter: ?f1test=live
    const urlParams = new URLSearchParams(window.location.search);
    const isTesting = urlParams.get('f1test') === 'live';
    
    if (isTesting) {
      const timer = setTimeout(() => {
        if (!alive) return;
        setSchedule({
          raceName: 'Simulation Grand Prix',
          round: '1',
          season: '2026',
          sessions: [
            { key: 'Race', label: 'Race', start: new Date(Date.now() - 3600000), end: new Date(Date.now() + 3600000) }
          ]
        });
        setF1State({ raceName: 'Simulation Grand Prix' });
      }, 500);
      return () => {
        alive = false;
        clearTimeout(timer);
      };
    }

    (async () => {
      try {
        const res = await fetch('https://api.jolpi.ca/ergast/f1/current/next.json');
        const json = await res.json();
        const race = json?.MRData?.RaceTable?.Races?.[0];
        if (!race || !alive) return;

        // Build sessions array with start/end times
        const sessionKeys = ['FirstPractice', 'SecondPractice', 'ThirdPractice', 'SprintQualifying', 'Sprint', 'Qualifying', 'Race'];
        const sessions = sessionKeys
          .filter(k => race[k] || (k === 'Race' && race.date))
          .map(k => {
            const d = k === 'Race' ? race.date : race[k]?.date;
            const t = k === 'Race' ? race.time : race[k]?.time;
            if (!d || !t) return null;
            // Enforce UTC parsing by ensuring the time string ends with 'Z'
            const timeStr = t.endsWith('Z') ? t : `${t}Z`;
            const start = new Date(`${d}T${timeStr}`);
            const dur = SESSION_DURATIONS[k] || 120;
            const end = new Date(start.getTime() + dur * 60000);
            return { key: k, label: SESSION_LABELS[k], start, end };
          })
          .filter(Boolean)
          .sort((a, b) => a.start - b.start);

        if (alive) {
          setSchedule({ raceName: race.raceName, round: race.round, season: race.season, sessions });
          setF1State({ raceName: race.raceName });
        }
      } catch (e) {
        console.warn('F1 schedule fetch failed:', e);
        if (alive) setError(true);
      }
    })();
    return () => { alive = false; };
  }, []);

  // 2. Tick every second — determine mode (countdown vs live vs results)
  React.useEffect(() => {
    if (!schedule) return;

    const tick = () => {
      const now = new Date();
      // Find if a session is currently live
      const live = schedule.sessions.find(s => now >= s.start && now <= s.end);
      if (live) {
        setMode(prev => { if (prev !== 'live') setPodium(null); return 'live'; });
        setActiveSession(live);
        setNextSession(null);
        setF1State({ mode: 'live', sessionLabel: live.label });
        return;
      }

      // Find next upcoming session
      const upcoming = schedule.sessions.find(s => now < s.start);
      if (upcoming) {
        setMode(prev => { if (prev !== 'countdown') setPodium(null); return 'countdown'; });
        setNextSession(upcoming);
        setActiveSession(null);
        const diff = upcoming.start - now;
        const d = Math.floor(diff / 86400000);
        const h = Math.floor((diff % 86400000) / 3600000);
        const m = Math.floor((diff % 3600000) / 60000);
        const s = Math.floor((diff % 60000) / 1000);
        const f = n => String(n).padStart(2, '0');
        const cd = `${f(d)}:${f(h)}:${f(m)}:${f(s)}`;
        setCountdown(cd);
        setF1State({ mode: 'countdown', countdown: cd, sessionLabel: upcoming.label });
        return;
      }

      // All sessions past — check if the last session just ended (show results)
      const lastSession = schedule.sessions[schedule.sessions.length - 1];
      if (lastSession && now > lastSession.end) {
        setMode(prev => { if (prev !== 'results') setPodium(null); return 'results'; });
        setActiveSession(lastSession);
        setF1State({ mode: 'results', sessionLabel: lastSession.label });
      }
    };

    tick();
    const iv = setInterval(tick, 1000);
    return () => clearInterval(iv);
  }, [schedule]);

  // 3. Fetch top 3 results/live standings from OpenF1
  React.useEffect(() => {
    if ((mode !== 'results' && mode !== 'live') || !activeSession) return;
    let alive = true;
    let timer = null;

    const fetchData = async () => {
      try {
        const urlParams = new URLSearchParams(window.location.search);
        const isTesting = urlParams.get('f1test') === 'live';
        
        if (mode === 'live' && isTesting) {
          const mockTop3 = [
            { pos: 1, name: 'NOR', fullName: 'Lando Norris', team: 'McLaren', color: '#ff8700' },
            { pos: 2, name: 'LEC', fullName: 'Charles Leclerc', team: 'Ferrari', color: '#dc0000' },
            { pos: 3, name: 'VER', fullName: 'Max Verstappen', team: 'Red Bull Racing', color: '#0600ef' }
          ];
          if (alive) setPodium(mockTop3);
          return;
        }

        const sessionName = OPENF1_SESSION_MAP[activeSession.key] || 'Race';
        const sessRes = await fetch(`https://api.openf1.org/v1/sessions?session_name=${encodeURIComponent(sessionName)}&year=${schedule.season}`);
        const sessData = await sessRes.json();
        if (!sessData?.length || !alive) return;

        const latestSess = sessData[sessData.length - 1];
        const sessionKey = latestSess.session_key;

        // Fetch driver info
        const driverRes = await fetch(`https://api.openf1.org/v1/drivers?session_key=${sessionKey}`);
        const drivers = await driverRes.json();
        if (!alive) return;

        const driverMap = {};
        drivers.forEach(d => { driverMap[d.driver_number] = d; });

        let top3 = [];

        if (mode === 'results') {
          // Fetch final top 3 classification
          const resultRes = await fetch(`https://api.openf1.org/v1/session_result?session_key=${sessionKey}&position<=3`);
          const results = await resultRes.json();
          if (!results?.length || !alive) return;

          top3 = results
            .sort((a, b) => a.position - b.position)
            .slice(0, 3)
            .map(r => {
              const d = driverMap[r.driver_number] || {};
              return {
                pos: r.position,
                name: d.name_acronym || `#${r.driver_number}`,
                fullName: d.full_name || d.broadcast_name || `Driver ${r.driver_number}`,
                team: d.team_name || '',
                color: d.team_colour ? `#${d.team_colour}` : 'var(--accent)',
              };
            });
        } else if (mode === 'live') {
          // Fetch live position changes
          const posRes = await fetch(`https://api.openf1.org/v1/position?session_key=${sessionKey}`);
          const posData = await posRes.json();
          if (!posData?.length || !alive) return;

          // Group by driver and get latest record
          const latestByDriver = {};
          posData.forEach(p => {
            const num = p.driver_number;
            if (!latestByDriver[num] || new Date(p.date) > new Date(latestByDriver[num].date)) {
              latestByDriver[num] = p;
            }
          });

          top3 = Object.values(latestByDriver)
            .sort((a, b) => a.position - b.position)
            .slice(0, 3)
            .map(p => {
              const d = driverMap[p.driver_number] || {};
              return {
                pos: p.position,
                name: d.name_acronym || `#${p.driver_number}`,
                fullName: d.full_name || d.broadcast_name || `Driver ${p.driver_number}`,
                team: d.team_name || '',
                color: d.team_colour ? `#${d.team_colour}` : 'var(--accent)',
              };
            });
        }

        if (alive) setPodium(top3);
      } catch (e) {
        console.warn('OpenF1 live/results fetch failed:', e);
      }
    };

    fetchData();

    // If live, poll every 30 seconds for real-time standing updates
    if (mode === 'live') {
      timer = setInterval(fetchData, 30000);
    }

    return () => {
      alive = false;
      if (timer) clearInterval(timer);
    };
  }, [mode, activeSession, schedule]);

  // ── Render ────────────────────────────────────────

  // Loading state
  if (mode === 'load') {
    return (
      <div className="hero-telemetry-cell">
        <div className="hero-telemetry-label">
          <span>F1 · {error ? 'Offline' : 'Loading…'}</span>
          <span style={{ color: 'var(--fg-mute)' }}>◌</span>
        </div>
        <div className="hero-telemetry-value" style={{ fontSize: 14, opacity: .5 }}>
          {error ? 'schedule unavailable' : 'fetching schedule…'}
        </div>
      </div>
    );
  }

  const raceName = schedule?.raceName || 'Grand Prix';

  // Countdown mode
  if (mode === 'countdown') {
    return (
      <div className="hero-telemetry-cell">
        <div className="hero-telemetry-label">
          <span>F1 · {raceName}</span>
          <span className="f1-next-badge">⏱ {nextSession?.label || 'NEXT'}</span>
        </div>
        <div className="hero-telemetry-value f1-countdown-digits">{countdown}</div>
        <div className="hero-telemetry-sub">
          Until {nextSession?.label?.toLowerCase() || 'session'} · DD:HH:MM:SS
        </div>
      </div>
    );
  }

  // Live mode
  if (mode === 'live') {
    return (
      <div className="hero-telemetry-cell f1-cell-live">
        <div className="hero-telemetry-label">
          <span>F1 · {raceName}</span>
          <span className="f1-live-badge">
            <span className="f1-live-dot"></span> LIVE · {activeSession?.label?.toUpperCase()}
          </span>
        </div>
        {podium && podium.length > 0 ? (
          <div className="f1-podium">
            {podium.map(d => (
              <div key={d.pos} className="f1-podium-row">
                <span className="f1-podium-pos" data-pos={d.pos}>P{d.pos}</span>
                <span className="f1-podium-bar" style={{ background: d.color }}></span>
                <span className="f1-podium-name">{d.name}</span>
                <span className="f1-podium-team">{d.team}</span>
              </div>
            ))}
          </div>
        ) : (
          <div className="hero-telemetry-value" style={{ fontSize: 20 }}>
            {activeSession?.label} in progress
          </div>
        )}
        <div className="hero-telemetry-sub">
          {podium && podium.length > 0 ? 'current standings · updating live' : 'session is live · check your screens'}
        </div>
      </div>
    );
  }

  // Results mode
  if (mode === 'results') {
    return (
      <div className="hero-telemetry-cell">
        <div className="hero-telemetry-label">
          <span>F1 · {raceName}</span>
          <span style={{ color: 'var(--fg-mute)' }}>🏁 {activeSession?.label} RESULT</span>
        </div>
        {podium ? (
          <div className="f1-podium">
            {podium.map(d => (
              <div key={d.pos} className="f1-podium-row">
                <span className="f1-podium-pos" data-pos={d.pos}>P{d.pos}</span>
                <span className="f1-podium-bar" style={{ background: d.color }}></span>
                <span className="f1-podium-name">{d.name}</span>
                <span className="f1-podium-team">{d.team}</span>
              </div>
            ))}
          </div>
        ) : (
          <div className="hero-telemetry-value" style={{ fontSize: 14, opacity: .5 }}>
            loading results…
          </div>
        )}
        <div className="hero-telemetry-sub">final classification</div>
      </div>
    );
  }

  return null;
}

/* ── Spotify Now Playing ───────────────────────── */
function NowPlayingCell() {
  const [data, setData]   = React.useState(null);
  const [quip, setQuip]   = React.useState(() => REST_QUIPS[Math.floor(Math.random() * REST_QUIPS.length)]);

  React.useEffect(() => {
    let alive = true;
    const poll = async () => {
      try {
        const res  = await fetch('/api/now-playing');
        const json = await res.json();
        if (alive) setData(json);
      } catch { if (alive) setData({ isPlaying: false }); }
    };
    poll();
    const iv = setInterval(poll, 30000);
    return () => { alive = false; clearInterval(iv); };
  }, []);

  React.useEffect(() => {
    if (data?.isPlaying) return;
    const iv = setInterval(() => {
      setQuip(REST_QUIPS[Math.floor(Math.random() * REST_QUIPS.length)]);
    }, 8000);
    return () => clearInterval(iv);
  }, [data?.isPlaying]);

  const isPlaying = data?.isPlaying;

  return (
    <div className="hero-telemetry-cell">
      <div className="hero-telemetry-label">
        <span>Now Spinning</span>
        <span style={{ color: isPlaying ? 'var(--accent)' : 'var(--fg-mute)' }}>
          {data === null ? '◌' : isPlaying ? '♪ LIVE' : '— OFFLINE'}
        </span>
      </div>

      {/* Loading */}
      {data === null && (
        <div className="hero-telemetry-value" style={{ fontSize: 14, opacity: .5 }}>tuning in…</div>
      )}

      {/* Playing */}
      {isPlaying && (
        <a href={data.songUrl} target="_blank" rel="noopener"
           style={{ display: 'flex', alignItems: 'center', gap: 12, textDecoration: 'none', color: 'inherit', marginTop: 4 }}>
          {data.albumArt && (
            <img src={data.albumArt} alt="album"
                 style={{ width: 44, height: 44, objectFit: 'cover', border: '1px solid rgba(160,144,128,.2)', flexShrink: 0 }} />
          )}
          <div style={{ minWidth: 0 }}>
            <div className="hero-telemetry-value" style={{ fontSize: 18, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {data.title}
            </div>
            <div className="hero-telemetry-sub" style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {data.artist} · {data.album}
            </div>
          </div>
          {/* Spinning record */}
          <RecordPlayer />
        </a>
      )}

      {/* Not playing */}
      {data !== null && !isPlaying && (
        <>
          <div className="hero-telemetry-value" style={{ fontSize: 16, fontStyle: 'italic', fontFamily: "'Instrument Serif', serif" }}>
            {quip.mood}
          </div>
          <div className="hero-telemetry-sub">{quip.detail}</div>
        </>
      )}
    </div>
  );
}

/* ── Animated Record Player ────────────────────────── */
function RecordPlayer() {
  return (
    <svg
      viewBox="0 0 48 48"
      width="44" height="44"
      style={{ flexShrink: 0, overflow: 'visible' }}
      aria-hidden="true"
    >
      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to   { transform: rotate(360deg); }
        }
        .record-disc {
          transform-origin: 24px 24px;
          animation: spin 2s linear infinite;
        }
        /* tonearm pivot */
        .record-arm {
          transform-origin: 40px 8px;
          animation: tonearm 2s linear infinite;
        }
        @keyframes tonearm {
          0%,100% { transform: rotate(0deg); }
          50%      { transform: rotate(-3deg); }
        }
      `}</style>

      {/* Spinning disc group */}
      <g className="record-disc">
        {/* Vinyl body */}
        <circle cx="24" cy="24" r="22" fill="#111" />
        {/* Grooves */}
        {[18,15,12,9].map(r => (
          <circle key={r} cx="24" cy="24" r={r} fill="none" stroke="#2a2a2a" strokeWidth="0.8" />
        ))}
        {/* Label */}
        <circle cx="24" cy="24" r="7" fill="var(--accent)" opacity=".9" />
        {/* Label sheen */}
        <circle cx="24" cy="24" r="7" fill="url(#labelSheen)" />
        {/* Spindle hole */}
        <circle cx="24" cy="24" r="1.5" fill="#060508" />
        {/* Highlight on vinyl edge */}
        <circle cx="24" cy="24" r="22" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="1" />
      </g>

      {/* Tonearm */}
      <g className="record-arm">
        <line x1="40" y1="8" x2="30" y2="26" stroke="rgba(200,192,180,0.5)" strokeWidth="1.2" strokeLinecap="round" />
        {/* Cartridge */}
        <rect x="28.5" y="25" width="3" height="2" rx="0.5" fill="rgba(200,192,180,0.4)" />
        {/* Pivot dot */}
        <circle cx="40" cy="8" r="2" fill="rgba(200,192,180,0.3)" />
      </g>

      {/* Gradient defs */}
      <defs>
        <radialGradient id="labelSheen" cx="40%" cy="35%" r="60%">
          <stop offset="0%"   stopColor="rgba(255,255,255,0.15)" />
          <stop offset="100%" stopColor="rgba(0,0,0,0)" />
        </radialGradient>
      </defs>
    </svg>
  );
}

Object.assign(window, { Hero });
