// Hobbies — Norse-inspired class select with rune cards

const CLASSES = [
  {
    id: 'guitar',
    rune: 'ᚠ',
    name: 'The Bard',
    tier: 'TIER III · MUSICIAN',
    bio: '"Hendrix, Mayer, Gilmour. Fingerstyle apprentice, rock disciple."',
    stats: [
      { label: 'RHY', val: 7, max: 10 },
      { label: 'TONE', val: 6, max: 10 },
      { label: 'SOUL', val: 9, max: 10 },
      { label: 'SLAP', val: 1, max: 10 },
    ],
  },
  {
    id: 'f1',
    rune: 'ᛟ',
    name: 'The Driver',
    tier: 'TIER IV · FORMULA',
    bio: '"Papaya since \'20. Suzuka PB: 1:29.4."',
    stats: [
      { label: 'APEX', val: 8, max: 10 },
      { label: 'BRAKE', val: 7, max: 10 },
      { label: 'STRAT', val: 9, max: 10 },
      { label: 'COPE', val: 10, max: 10 },
    ],
  },
  {
    id: 'lift',
    rune: 'ᚦ',
    name: 'The Berserker',
    tier: 'TIER III · IRON SECT',
    bio: '"PPL split, 5 days. 315 deadlift incoming."',
    stats: [
      { label: 'STR', val: 8, max: 10 },
      { label: 'GRIT', val: 9, max: 10 },
      { label: 'FORM', val: 8, max: 10 },
      { label: 'DIET', val: 5, max: 10 },
    ],
  },
  {
    id: 'gaming',
    rune: 'ᚷ',
    name: 'The Apex Hunter',
    tier: 'TIER IV · ARENA RAT',
    bio: '"Diamond rank. FIFA chats since \'17."',
    stats: [
      { label: 'AIM', val: 9, max: 10 },
      { label: 'GAME', val: 8, max: 10 },
      { label: 'MAP', val: 7, max: 10 },
      { label: 'RAGE', val: 10, max: 10 },
    ],
  },
];

function Hobbies() {
  const ref = React.useRef(null);
  React.useEffect(() => {
    const obs = new IntersectionObserver(([e]) => {
      if (e.isIntersecting && e.intersectionRatio > 0.3) {
        window.gameStore.setBiome('HOBBIES');
        window.gameStore.unlock('hobbies');
      }
    }, { threshold: [0.3] });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);

  return (
    <section className="world-hobbies" id="hobbies" ref={ref}>
      <div className="runes-bg" aria-hidden="true">
        ᚠᚢᚦᚨᚱᚲᚷᚹᚺᚾᛁᛃᛇᛈᛉᛊᛏᛒᛖᛗᛚᛜᛞᛟ ᚠᚢᚦᚨᚱᚲᚷᚹᚺᚾᛁᛃᛇᛈᛉᛊᛏᛒᛖᛗᛚᛜᛞᛟ ᚠᚢᚦᚨᚱᚲᚷᚹᚺᚾᛁᛃᛇᛈᛉᛊᛏᛒᛖᛗᛚᛜᛞᛟ
      </div>
      <div className="gow-header">
        <div className="gow-prelabel">◇ Realm of Runes ◇</div>
        <h2 className="gow-title">Choose your <span className="accent">class.</span></h2>
        <div className="gow-sub">Off-the-clock skill trees</div>
      </div>

      <div className="classes" style={{ position: 'relative' }}>
        {CLASSES.map(c => <ClassCard key={c.id} c={c} />)}
      </div>

      {/* Live telemetry strip — F1 countdown + Now Spinning */}
      <div className="telemetry-strip" style={{ maxWidth: 1400, margin: '60px auto 0', display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 0, border: '1px solid rgba(168,154,136,.2)', position: 'relative', zIndex: 2, fontFamily: "'JetBrains Mono', monospace" }}>
        <F1Cell />
        <NowPlayingCell />
      </div>
    </section>
  );
}

function ClassCard({ c }) {
  return (
    <div className="class-card">
      <span className="class-rune">{c.rune}</span>
      <div className="class-name">{c.name}</div>
      <div className="class-tier">{c.tier}</div>
      <div className="class-stats">
        {c.stats.map(s => (
          <div className="class-stat" key={s.label}>
            <span>{s.label}</span>
            <div className="class-stat-bar">
              <div className="class-stat-fill" style={{ '--lvl': s.val / s.max }}></div>
            </div>
            <span className="class-stat-val">{s.val}</span>
          </div>
        ))}
      </div>
      <div className="class-bio">{c.bio}</div>
    </div>
  );
}

function F1Cell() {
  const [t, setT] = React.useState('');
  const [race, setRace] = React.useState({ name: '', date: null });

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
      const now = new Date();
      const next = calendar.find(r => r.date - now > 0) || calendar[calendar.length - 1];
      setRace({ name: next.name, date: next.date });
      const diff = next.date - now;
      if (diff < 0) { setT('LIGHTS OUT'); return; }
      const d = Math.floor(diff / 86400000);
      const h = Math.floor((diff % 86400000) / 3600000);
      const m = Math.floor((diff % 3600000) / 60000);
      const s = Math.floor((diff % 60000) / 1000);
      const f = n => String(n).padStart(2, '0');
      setT(`${f(d)}:${f(h)}:${f(m)}:${f(s)}`);
    };
    upd();
    const i = setInterval(upd, 1000);
    return () => clearInterval(i);
  }, []);

  return (
    <div className="telemetry-cell" style={{ padding: 24, borderRight: '1px solid rgba(168,154,136,.2)' }}>
      <div style={{ fontSize: 10, letterSpacing: '.25em', color: 'var(--gow-rune)', textTransform: 'uppercase', display: 'flex', justifyContent: 'space-between', marginBottom: 10 }}>
        <span>F1 — {race.name || 'Loading…'}</span><span style={{ color: 'var(--accent)' }}>● LIVE</span>
      </div>
      <div style={{ fontSize: 28, color: 'var(--gow-frost)', letterSpacing: '-.02em' }}>{t}</div>
      <div style={{ fontSize: 10, color: 'var(--fg-dim)', marginTop: 6 }}>Until lights-out · DD:HH:MM:SS</div>
    </div>
  );
}

const REST_QUIPS = [
  { mood: 'Silence — the rarest track in existence',        detail: 'not currently playing · ears resting' },
  { mood: 'Streaming: ambient keyboard clicks',             detail: 'lo-fi · mechanical · 60wpm' },
  { mood: '404: Music not found',                           detail: 'have you tried turning it off and on again' },
  { mood: 'Currently loading next banger…',                 detail: 'buffering · please stand by · ♪' },
  { mood: 'The aux cord is charging',                       detail: 'standby mode · do not unplug' },
  { mood: 'Vibing with: the sound of compilation errors',   detail: 'syntax error jazz · undefined groove' },
  { mood: 'Off-duty. Guitar is also on break.',             detail: 'all instruments resting · come back later' },
];

function NowPlayingCell() {
  const [data, setData]   = React.useState(null);   // null = loading
  const [quip, setQuip]   = React.useState(() => REST_QUIPS[Math.floor(Math.random() * REST_QUIPS.length)]);
  const [error, setError] = React.useState(false);

  React.useEffect(() => {
    let alive = true;
    const poll = async () => {
      try {
        const res  = await fetch('/api/now-playing');
        const json = await res.json();
        if (alive) setData(json);
      } catch {
        if (alive) setError(true);
      }
    };
    poll();
    const iv = setInterval(poll, 30000); // refresh every 30s
    return () => { alive = false; clearInterval(iv); };
  }, []);

  // Rotate quips when not playing
  React.useEffect(() => {
    if (data?.isPlaying) return;
    const iv = setInterval(() => {
      setQuip(REST_QUIPS[Math.floor(Math.random() * REST_QUIPS.length)]);
    }, 8000);
    return () => clearInterval(iv);
  }, [data?.isPlaying]);

  const isPlaying = data?.isPlaying;

  return (
    <div style={{ padding: 24 }}>
      {/* Header row */}
      <div style={{ fontSize: 10, letterSpacing: '.25em', color: 'var(--gow-rune)', textTransform: 'uppercase', display: 'flex', justifyContent: 'space-between', marginBottom: 10 }}>
        <span>Now Spinning</span>
        <span style={{ color: isPlaying ? 'var(--accent)' : 'var(--fg-mute)' }}>
          {isPlaying ? '♪ LIVE' : '— OFFLINE'}
        </span>
      </div>

      {/* Loading state */}
      {data === null && !error && (
        <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 11, color: 'var(--fg-mute)', letterSpacing: '.1em' }}>
          ◌ tuning in…
        </div>
      )}

      {/* Currently playing */}
      {isPlaying && (
        <>
          <a href={data.songUrl} target="_blank" rel="noopener"
             style={{ display: 'flex', alignItems: 'center', gap: 12, textDecoration: 'none', color: 'inherit' }}>
            {data.albumArt && (
              <img src={data.albumArt} alt="album art"
                   style={{ width: 48, height: 48, objectFit: 'cover', border: '1px solid rgba(138,160,180,.2)', flexShrink: 0 }} />
            )}
            <div style={{ minWidth: 0 }}>
              <div style={{ fontFamily: "'Instrument Serif', serif", fontStyle: 'italic', fontSize: 20,
                            color: 'var(--gow-frost)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {data.title}
              </div>
              <div style={{ fontSize: 10, color: 'var(--fg-dim)', marginTop: 4, letterSpacing: '.1em',
                            whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {data.artist} · {data.album}
              </div>
            </div>
          </a>
          {/* Animated bar */}
          <div style={{ display: 'flex', gap: 3, alignItems: 'flex-end', height: 16, marginTop: 10 }}>
            {[1,2,3,4,5].map(i => (
              <div key={i} style={{
                width: 3, background: 'var(--accent)',
                animation: `nowBar 0.${8+i}s ease-in-out infinite alternate`,
                animationDelay: `${i * 0.1}s`,
                height: '100%', transformOrigin: 'bottom',
              }} />
            ))}
          </div>
        </>
      )}

      {/* Not playing / error */}
      {(data !== null && !isPlaying) && (
        <>
          <div style={{ fontFamily: "'Instrument Serif', serif", fontStyle: 'italic', fontSize: 19, color: 'var(--gow-frost)', lineHeight: 1.3 }}>
            {quip.mood}
          </div>
          <div style={{ fontSize: 10, color: 'var(--fg-dim)', marginTop: 6, letterSpacing: '.1em' }}>{quip.detail}</div>
        </>
      )}
    </div>
  );
}

Object.assign(window, { Hobbies });
