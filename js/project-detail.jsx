// Project Detail — full-screen overlay

// ── Fan position params ─────────────────────────────────────────────────────
function fanParams(i, total) {
  const configs = {
    1: { steps: [0],                      rotStep: 0,  txStep: 0  },
    2: { steps: [-1, 1],                  rotStep: 9,  txStep: 72 },
    3: { steps: [-1, 0, 1],              rotStep: 9,  txStep: 65 },
    4: { steps: [-1.5, -0.5, 0.5, 1.5], rotStep: 7,  txStep: 56 },
    5: { steps: [-2, -1, 0, 1, 2],       rotStep: 8,  txStep: 59 },
  };
  const cfg = configs[Math.min(total, 5)] || configs[5];
  const pos = cfg.steps[i] ?? 0;
  // Default z: centre highest, outer lowest
  const z = Math.round(5 - Math.abs(pos) * 1.4);
  return {
    pos,
    rot:      pos * cfg.rotStep,
    tx:       pos * cfg.txStep,
    baseY:    pos === 0 ? -14 : Math.abs(pos) * 7,
    z:        Math.max(1, z),
    isCenter: pos === 0,
  };
}

// ── Single card (visual only — hover managed by parent container) ────────────
function FanCard({ i, total, fanSpread, isActive, bg, isMobile, children }) {
  const p    = fanParams(i, total);
  const base = isMobile ? 0.82 : 1;
  const w    = (p.isCenter ? 278 : 258) * base;
  const h    = (p.isCenter ? 386 : 358) * base;

  // Two visual layers: spread (whole-fan hover) + lift (active card)
  const spreadTx  = p.tx  * (fanSpread ? 1.65 : 1);
  const spreadRot = p.rot * (fanSpread ? 1.18 : 1);
  const liftY     = isActive ? -26 : 0;
  const liftScale = isActive ? ' scale(1.06)' : '';

  const shadow = isActive
    ? '0 36px 80px rgba(0,0,0,.92), 0 0 0 1px rgba(196,168,112,.28)'
    : fanSpread
    ? '0 22px 68px rgba(0,0,0,.76)'
    : '0 18px 56px rgba(0,0,0,.65)';

  const z = isActive ? 10 : p.z;

  return (
    <div style={{
      position: 'absolute',
      width: w, height: h,
      borderRadius: 18,
      overflow: 'hidden',
      top: '50%', left: '50%',
      transformOrigin: 'center bottom',
      transform: `translate(-50%,-50%) rotate(${spreadRot}deg) translate(${spreadTx}px,${p.baseY + liftY}px)${liftScale}`,
      zIndex: z,
      boxShadow: shadow,
      transition: 'transform .48s cubic-bezier(.22,1,.36,1), box-shadow .48s',
      background: bg || undefined,
      willChange: 'transform',
      pointerEvents: 'none',   // container handles all pointer events
    }}>
      {children}
    </div>
  );
}

// ── Fan spread — mouse-column-based activation (no z-index interference) ─────
function FanSpread({ cards, isMobile }) {
  const total      = Math.min(cards.length, 5);
  const fanW       = isMobile ? 260 : [320, 360, 400, 440, 470][total - 1] || 470;
  const fanH       = isMobile ? 380 : 510;
  // Extra invisible hit-area so extreme-edge cards are reachable in spread state
  const hitPad     = 60;

  const [fanSpread, setFanSpread] = React.useState(false);
  const [activeIdx, setActiveIdx] = React.useState(null);
  const ref        = React.useRef(null);

  function onMove(e) {
    if (!ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    // Offset by hitPad since container is wider
    const x     = e.clientX - rect.left - hitPad;
    const pct   = Math.max(0, Math.min(1, x / fanW));
    const idx   = Math.min(total - 1, Math.floor(pct * total));
    setActiveIdx(idx);
  }

  function onLeave() {
    setFanSpread(false);
    setActiveIdx(null);
  }

  return (
    <div
      ref={ref}
      aria-hidden="true"
      style={{
        position: 'relative',
        width:    fanW + hitPad * 2,
        height:   fanH,
        flexShrink: 0,
        // pull margins inward so grid layout sees fanW, not the extra hit-pad
        marginLeft:  -hitPad,
        marginRight: -hitPad,
        cursor: 'default',
      }}
      onMouseEnter={() => setFanSpread(true)}
      onMouseLeave={onLeave}
      onMouseMove={onMove}
    >
      {cards.slice(0, 5).map((c, i) => (
        <FanCard
          key={i}
          i={i} total={total}
          fanSpread={fanSpread}
          isActive={activeIdx === i}
          bg={c.bg}
          isMobile={isMobile}
        >
          {c.content}
        </FanCard>
      ))}
    </div>
  );
}

// ── Small fan strip (below video when both video + images present) ────────────
function SmallFanSpread({ cards }) {
  const total  = Math.min(cards.length, 3);
  const W      = 340;
  const H      = 210;
  const hitPad = 30;
  const [spread, setSpread]   = React.useState(false);
  const [active, setActive]   = React.useState(null);
  const ref    = React.useRef(null);

  function onMove(e) {
    if (!ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    const x    = e.clientX - rect.left - hitPad;
    const idx  = Math.min(total - 1, Math.max(0, Math.floor((x / W) * total)));
    setActive(idx);
  }

  return (
    <div ref={ref} aria-hidden="true"
      style={{ position: 'relative', width: W + hitPad * 2, height: H, margin: `0 -${hitPad}px`, flexShrink: 0 }}
      onMouseEnter={() => setSpread(true)}
      onMouseLeave={() => { setSpread(false); setActive(null); }}
      onMouseMove={onMove}
    >
      {cards.slice(0, total).map((c, i) => {
        const p        = fanParams(i, total);
        const spreadTx = p.tx * 0.7 * (spread ? 1.5 : 1);
        const liftY    = active === i ? -14 : 0;
        const scale    = active === i ? ' scale(1.07)' : '';
        const shadow   = active === i ? '0 20px 50px rgba(0,0,0,.85)' : '0 12px 40px rgba(0,0,0,.6)';
        return (
          <div key={i} style={{
            position: 'absolute',
            width: p.isCenter ? 145 : 130,
            height: p.isCenter ? 196 : 178,
            borderRadius: 12, overflow: 'hidden',
            top: '50%', left: '50%',
            transformOrigin: 'center bottom',
            transform: `translate(-50%,-50%) rotate(${p.rot}deg) translate(${spreadTx}px,${p.baseY + liftY}px)${scale}`,
            zIndex: active === i ? 10 : p.z,
            boxShadow: shadow,
            transition: 'transform .44s cubic-bezier(.22,1,.36,1), box-shadow .44s',
            background: c.bg || undefined,
            pointerEvents: 'none',
          }}>
            {c.content}
          </div>
        );
      })}
    </div>
  );
}

// ── Main overlay ──────────────────────────────────────────────────────────────
function ProjectDetail({ quest, onClose }) {

  const [isMobile, setIsMobile] = React.useState(window.innerWidth <= 900);
  React.useEffect(() => {
    const h = () => setIsMobile(window.innerWidth <= 900);
    window.addEventListener('resize', h);
    return () => window.removeEventListener('resize', h);
  }, []);

  React.useEffect(() => {
    if (window.soundManager) {
      window.soundManager.play('parchment_open');
    }
    const onKey = e => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
      if (window.soundManager) {
        window.soundManager.play('parchment_close');
      }
    };
  }, [onClose]);

  const stackArr = Array.isArray(quest.stack)
    ? quest.stack
    : (quest.stack || '').split(',').map(s => s.trim()).filter(Boolean);

  function getLinkMeta(link) {
    if (!link || link === '#') return null;
    if (link.includes('github.com'))      return { label: '↗ GitHub',     cls: 'pdetail-btn-github' };
    if (link.includes('docs.google.com')) return { label: '↗ View Paper', cls: 'pdetail-btn-live'   };
    return                                       { label: '↗ Live Demo',  cls: 'pdetail-btn-live'   };
  }

  const linkMeta  = getLinkMeta(quest.link);
  const hasImages = Array.isArray(quest.images) && quest.images.length > 0;
  const hasVideo  = !!quest.video;
  const catIcon   = { fullstack: '⚔', 'ml-ai': '✦', data: 'ᚱ' }[quest.category] || '◇';

  // ── Placeholder parchment cards ──
  const placeholderCards = [
    {
      bg: '#6b4c22',
      content: (
        <div className="pdetail-card-inner">
          <div className="pdetail-card-glyph">{catIcon}</div>
          <div>
            <div className="pdetail-card-micro">{(quest.category || 'project').toUpperCase().replace('-', ' ')}</div>
            <div className="pdetail-card-micro" style={{ marginTop: 4 }}>{quest.year}</div>
          </div>
        </div>
      ),
    },
    {
      bg: '#8a6234',
      content: (
        <div className="pdetail-card-inner">
          <div className="pdetail-card-micro" style={{ marginBottom: 16 }}>STACK</div>
          <div className="pdetail-card-list">
            {stackArr.map(t => <div key={t} className="pdetail-card-list-item">{t}</div>)}
          </div>
          <div className="pdetail-card-tag-label">{quest.tag}</div>
        </div>
      ),
    },
    {
      bg: '#c4a870',
      content: (
        <div className="pdetail-card-inner pdetail-card-main-inner">
          <div>
            <div className="pdetail-card-micro dark" style={{ marginBottom: 12 }}>◇ CONTRACT ◇</div>
            <div className="pdetail-card-title-main">{quest.name}</div>
            <div className="pdetail-card-subtitle-main">{quest.sub}</div>
          </div>
          <div>
            <div className="pdetail-card-glyph-dark">{catIcon}</div>
            <div className="pdetail-card-micro dark">{quest.year}</div>
          </div>
        </div>
      ),
    },
    {
      bg: '#8a6234',
      content: (
        <div className="pdetail-card-inner">
          <div className="pdetail-card-micro" style={{ marginBottom: 14 }}>DISPATCH</div>
          <div className="pdetail-card-desc-snippet">
            {(quest.desc || '').slice(0, 130)}{(quest.desc || '').length > 130 ? '…' : ''}
          </div>
        </div>
      ),
    },
    {
      bg: '#6b4c22',
      content: (
        <div className="pdetail-card-inner">
          <div className="pdetail-card-glyph">{catIcon}</div>
          <div className="pdetail-card-micro">{(quest.tag || '').replace('// ', '')}</div>
        </div>
      ),
    },
  ];

  const imageCards = hasImages
    ? quest.images.slice(0, 5).map((src, i) => ({
        bg: null,
        content: <img src={src} alt={`${quest.name} screenshot ${i + 1}`} className="pdetail-card-img" />,
      }))
    : null;

  const fanCards = imageCards || placeholderCards;

  return (
    <div className="pdetail-overlay">
      <div className="pdetail-mountains" aria-hidden="true">
        <svg viewBox="0 0 1600 500" preserveAspectRatio="xMidYMax slice">
          <path d="M0,500 L0,310 L100,230 L200,270 L330,160 L470,250 L570,190 L710,270 L850,160 L970,235 L1090,198 L1230,275 L1370,195 L1490,258 L1600,215 L1600,500 Z" fill="rgba(138,122,90,.07)"/>
          <path d="M0,500 L0,385 L150,325 L290,365 L450,295 L610,362 L770,308 L910,378 L1070,318 L1230,378 L1390,328 L1600,368 L1600,500 Z" fill="rgba(18,12,6,.55)"/>
        </svg>
      </div>

      <button className="pdetail-back" onClick={onClose}>← BACK TO CONTRACTS</button>

      <div className="pdetail-body">

        {hasVideo ? (
          <div className="pdetail-media">
            <div className="pdetail-video-wrap">
              <video src={quest.video} controls autoPlay muted loop playsInline />
            </div>
            {hasImages && <SmallFanSpread cards={fanCards} />}
          </div>
        ) : (
          <div className="pdetail-media">
            <FanSpread cards={fanCards} isMobile={isMobile} />
          </div>
        )}

        <div className="pdetail-info">
          <div className="pdetail-eyebrow">{quest.tag} · {quest.year}</div>
          <h1 className="pdetail-title">{quest.name}</h1>
          <p className="pdetail-subtitle">{quest.sub}</p>

          <div className="pdetail-links">
            {linkMeta ? (
              <a href={quest.link} target="_blank" rel="noopener" className={`pdetail-btn ${linkMeta.cls}`}>
                {linkMeta.label}
              </a>
            ) : (
              <span className="pdetail-no-link">// no public link</span>
            )}
          </div>

          <div className="pdetail-section-head"><span>STACK</span></div>
          <div className="pdetail-stack">
            {stackArr.map(t => <span key={t} className="pdetail-stack-tag">{t}</span>)}
          </div>

          <div className="pdetail-section-head"><span>DISPATCH</span></div>
          <p className="pdetail-desc">{quest.desc}</p>
        </div>

      </div>
    </div>
  );
}

Object.assign(window, { ProjectDetail });
