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
      <div style={{ maxWidth: 1400, margin: '60px auto 0', display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 0, border: '1px solid rgba(168,154,136,.2)', position: 'relative', zIndex: 2, fontFamily: "'JetBrains Mono', monospace" }}>
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
      { name: 'Australian GP',  date: new Date('2026-03-08T05:00:00Z') },
      { name: 'Chinese GP',     date: new Date('2026-03-22T07:00:00Z') },
      { name: 'Japanese GP',    date: new Date('2026-04-05T05:00:00Z') },
      { name: 'Bahrain GP',     date: new Date('2026-04-12T15:00:00Z') },
      { name: 'Saudi Arabian GP', date: new Date('2026-04-19T17:00:00Z') },
      { name: 'Miami GP',       date: new Date('2026-05-03T19:30:00Z') },
      { name: 'Emilia-Romagna GP', date: new Date('2026-05-17T13:00:00Z') },
      { name: 'Monaco GP',      date: new Date('2026-05-24T13:00:00Z') },
      { name: 'Spanish GP',     date: new Date('2026-06-14T13:00:00Z') },
      { name: 'Canadian GP',    date: new Date('2026-06-21T18:00:00Z') },
      { name: 'British GP',     date: new Date('2026-07-05T14:00:00Z') },
      { name: 'Hungarian GP',   date: new Date('2026-07-26T13:00:00Z') },
      { name: 'Belgian GP',     date: new Date('2026-08-30T13:00:00Z') },
      { name: 'Dutch GP',       date: new Date('2026-09-06T13:00:00Z') },
      { name: 'Italian GP',     date: new Date('2026-09-13T13:00:00Z') },
      { name: 'Azerbaijan GP',  date: new Date('2026-09-27T11:00:00Z') },
      { name: 'Singapore GP',   date: new Date('2026-10-04T12:00:00Z') },
      { name: 'United States GP', date: new Date('2026-10-25T19:00:00Z') },
      { name: 'Mexico City GP', date: new Date('2026-11-01T20:00:00Z') },
      { name: 'São Paulo GP',   date: new Date('2026-11-08T17:00:00Z') },
      { name: 'Las Vegas GP',   date: new Date('2026-11-21T06:00:00Z') },
      { name: 'Qatar GP',       date: new Date('2026-11-29T16:00:00Z') },
      { name: 'Abu Dhabi GP',   date: new Date('2026-12-06T13:00:00Z') },
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
    <div style={{ padding: 24, borderRight: '1px solid rgba(168,154,136,.2)' }}>
      <div style={{ fontSize: 10, letterSpacing: '.25em', color: 'var(--gow-rune)', textTransform: 'uppercase', display: 'flex', justifyContent: 'space-between', marginBottom: 10 }}>
        <span>F1 — {race.name || 'Loading…'}</span><span style={{ color: 'var(--accent)' }}>● LIVE</span>
      </div>
      <div style={{ fontSize: 28, color: 'var(--gow-frost)', letterSpacing: '-.02em' }}>{t}</div>
      <div style={{ fontSize: 10, color: 'var(--fg-dim)', marginTop: 6 }}>Until lights-out · DD:HH:MM:SS</div>
    </div>
  );
}

function NowPlayingCell() {
  const tracks = [
    { mood: 'Late-night alt-rock deep dive', detail: 'prog · ambient · introspective' },
    { mood: 'Acoustic blues fingerstyle', detail: 'slow tempo · clean tone · soul' },
    { mood: 'Pre-set hype mix', detail: 'rock · loud · driving' },
    { mood: 'Sunday race-day instrumentals', detail: 'orchestral · cinematic · tension' },
  ];
  const [idx, setIdx] = React.useState(0);
  React.useEffect(() => {
    const i = setInterval(() => setIdx(p => (p + 1) % tracks.length), 5000);
    return () => clearInterval(i);
  }, []);
  const t = tracks[idx];
  return (
    <div style={{ padding: 24 }}>
      <div style={{ fontSize: 10, letterSpacing: '.25em', color: 'var(--gow-rune)', textTransform: 'uppercase', display: 'flex', justifyContent: 'space-between', marginBottom: 10 }}>
        <span>Now Spinning</span><span style={{ color: 'var(--accent)' }}>♪ LIVE</span>
      </div>
      <div style={{ fontFamily: "'Instrument Serif', serif", fontStyle: 'italic', fontSize: 22, color: 'var(--gow-frost)' }}>
        {t.mood}
      </div>
      <div style={{ fontSize: 10, color: 'var(--fg-dim)', marginTop: 6, letterSpacing: '.1em' }}>{t.detail}</div>
    </div>
  );
}

Object.assign(window, { Hobbies });
