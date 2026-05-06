// Hero — dark noir comic title card + live telemetry (F1 + Spotify)

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

/* ── F1 Countdown ──────────────────────────────── */
function F1Cell() {
  const [t, setT]     = React.useState('--:--:--:--');
  const [race, setRace] = React.useState({ name: 'Loading…' });

  React.useEffect(() => {
    const calendar = [
      { name: 'Australian GP',    date: new Date('2026-03-08T05:00:00Z') },
      { name: 'Chinese GP',       date: new Date('2026-03-15T07:00:00Z') },
      { name: 'Japanese GP',      date: new Date('2026-03-29T05:00:00Z') },
      { name: 'Miami GP',         date: new Date('2026-05-03T19:30:00Z') },
      { name: 'Canadian GP',      date: new Date('2026-05-24T18:00:00Z') },
      { name: 'Monaco GP',        date: new Date('2026-06-07T13:00:00Z') },
      { name: 'Barcelona GP',     date: new Date('2026-06-14T13:00:00Z') },
      { name: 'Austrian GP',      date: new Date('2026-06-28T13:00:00Z') },
      { name: 'British GP',       date: new Date('2026-07-05T14:00:00Z') },
      { name: 'Belgian GP',       date: new Date('2026-07-19T13:00:00Z') },
      { name: 'Hungarian GP',     date: new Date('2026-07-26T13:00:00Z') },
      { name: 'Dutch GP',         date: new Date('2026-08-23T13:00:00Z') },
      { name: 'Italian GP',       date: new Date('2026-09-06T13:00:00Z') },
      { name: 'Spanish GP',       date: new Date('2026-09-13T13:00:00Z') },
      { name: 'Azerbaijan GP',    date: new Date('2026-09-26T11:00:00Z') },
      { name: 'Singapore GP',     date: new Date('2026-10-11T12:00:00Z') },
      { name: 'United States GP', date: new Date('2026-10-25T19:00:00Z') },
      { name: 'Mexico City GP',   date: new Date('2026-11-01T20:00:00Z') },
      { name: 'Brazilian GP',     date: new Date('2026-11-08T17:00:00Z') },
      { name: 'Las Vegas GP',     date: new Date('2026-11-22T06:00:00Z') },
      { name: 'Qatar GP',         date: new Date('2026-11-29T16:00:00Z') },
      { name: 'Abu Dhabi GP',     date: new Date('2026-12-06T13:00:00Z') },
    ];

    const upd = () => {
      const now  = new Date();
      const next = calendar.find(r => r.date - now > 0) || calendar[calendar.length - 1];
      setRace({ name: next.name });
      const diff = next.date - now;
      if (diff <= 0) { setT('LIGHTS OUT'); return; }
      const d = Math.floor(diff / 86400000);
      const h = Math.floor((diff % 86400000) / 3600000);
      const m = Math.floor((diff % 3600000) / 60000);
      const s = Math.floor((diff % 60000) / 1000);
      const f = n => String(n).padStart(2, '0');
      setT(`${f(d)}:${f(h)}:${f(m)}:${f(s)}`);
    };
    upd();
    const iv = setInterval(upd, 1000);
    return () => clearInterval(iv);
  }, []);

  return (
    <div className="hero-telemetry-cell">
      <div className="hero-telemetry-label">
        <span>F1 · {race.name}</span>
        <span style={{ color: 'var(--accent)' }}>● LIVE</span>
      </div>
      <div className="hero-telemetry-value">{t}</div>
      <div className="hero-telemetry-sub">Until lights-out · DD:HH:MM:SS</div>
    </div>
  );
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
          {/* Bouncing bars */}
          <div style={{ display: 'flex', gap: 3, alignItems: 'flex-end', height: 20, flexShrink: 0 }}>
            {[1,2,3,4,5].map(i => (
              <div key={i} style={{ width: 3, height: '100%', background: 'var(--accent)', transformOrigin: 'bottom',
                animation: `nowBar 0.${8+i}s ease-in-out infinite alternate`, animationDelay: `${i*0.1}s` }} />
            ))}
          </div>
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

Object.assign(window, { Hero });
