// Root app — orchestrates boot, sections, transitions

function App() {
  const [booted, setBooted] = React.useState(false);
  const [tx, setTx] = React.useState(null);
  const lastBiomeRef = React.useRef(null);

  // Custom cursor
  React.useEffect(() => {
    const cursor = document.getElementById('cursor');
    if (!cursor) return;
    let mx = 0, my = 0, cx = 0, cy = 0;
    const move = e => { mx = e.clientX; my = e.clientY; };
    document.addEventListener('mousemove', move);
    let raf;
    const loop = () => {
      cx += (mx - cx) * 0.25;
      cy += (my - cy) * 0.25;
      cursor.style.left = cx + 'px';
      cursor.style.top = cy + 'px';
      raf = requestAnimationFrame(loop);
    };
    loop();
    const onEnter = () => cursor.classList.add('hover');
    const onLeave = () => cursor.classList.remove('hover');
    const wire = () => {
      document.querySelectorAll('a, button, input, textarea, .class-card, .quest-row, .comic-panel, .polaroid, .signal-card, .dialog-choice, .minimap-node').forEach(el => {
        el.removeEventListener('mouseenter', onEnter);
        el.removeEventListener('mouseleave', onLeave);
        el.addEventListener('mouseenter', onEnter);
        el.addEventListener('mouseleave', onLeave);
      });
    };
    wire();
    const obs = new MutationObserver(wire);
    obs.observe(document.body, { childList: true, subtree: true });
    return () => {
      document.removeEventListener('mousemove', move);
      cancelAnimationFrame(raf);
      obs.disconnect();
    };
  }, [booted]);

  // MJ hee-hee easter egg
  React.useEffect(() => {
    let buffer = '';
    const onKey = (e) => {
      if (['INPUT', 'TEXTAREA'].includes(document.activeElement?.tagName)) return;
      buffer += e.key.toLowerCase();
      if (buffer.length > 10) buffer = buffer.slice(-10);
      if (buffer.endsWith('mj')) {
        buffer = '';
        const el = document.createElement('div');
        el.textContent = 'hee-hee!';
        el.style.cssText = 'position:fixed;top:50%;left:50%;transform:translate(-50%,-50%) rotate(-6deg);font-family:"Instrument Serif",serif;font-style:italic;font-size:clamp(40px,8vw,100px);color:var(--accent);opacity:0;pointer-events:none;z-index:8500;animation:heeHee .8s forwards;';
        document.body.appendChild(el);
        setTimeout(() => el.remove(), 900);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  const state = useGameState();
  React.useEffect(() => {
    if (!booted) return;
    const prev = lastBiomeRef.current;
    if (prev && state.biome !== prev && state.biome !== 'BOOT') {
      const map = {
        ABOUT:    { kind: 'chapter', label: 'Chapter II',     sub: 'The Frontier · Toronto, ON' },
        PROJECTS: { kind: 'ink',     label: 'A New Contract', sub: 'The board has fresh postings' },
      };
      const t = map[state.biome];
      if (t) setTx(t);
    }
    lastBiomeRef.current = state.biome;
  }, [state.biome, booted]);

  // XP for scrolling
  React.useEffect(() => {
    let last = 0;
    const onScroll = () => {
      const now = Date.now();
      if (now - last > 1500) {
        last = now;
        window.gameStore.addXP(2);
      }
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  if (!booted) {
    return <BootScreen onStart={() => { setBooted(true); window.gameStore.setBootDone(true); }} />;
  }

  return (
    <>
      {tx && <Transition kind={tx.kind} label={tx.label} sub={tx.sub} onDone={() => setTx(null)} />}

      <Hero />
      <WorldMarquee />
      <About />
      <WorldMarquee variant="rdr" />
      <Hobbies />
      <WorldMarquee variant="gow" />
      <Projects />
      <WorldMarquee variant="quest" />
      <Contact />
      <Footer />
    </>
  );
}

function WorldMarquee({ variant }) {
  const items = {
    default: ['◇ FULL-STACK ◇', 'REACT', 'PYTHON', 'THREE.JS', 'JAVA', 'AVAILABLE FALL \'26', '★ ★ ★'],
    rdr: ['CHAPTER ENDS', '— THE FRONTIER —', 'NEXT WAYPOINT', '◇ REALM OF RUNES ◇'],
    gow: ['ᚠᚢᚦᚨᚱᚲ', 'GATES OPEN', '◇ CONTRACTS AHEAD ◇', '— TRAVEL ON —'],
    witcher: ['HMM…', '◇ FRESH CONTRACTS POSTED ◇', '— TOSS A COIN —', 'LIGHT THE BEACON'],
    quest: ['◇ FRESH CONTRACTS POSTED ◇', '— THE BEACON AWAITS —', 'SEND THE SIGNAL'],
  };
  const list = items[variant || 'default'];
  return (
    <div className="world-marquee">
      <div className="world-marquee-track">
        <span>{list.map((t, i) => <span key={i} style={{ marginRight: 60 }}>{t}</span>)}</span>
        <span>{list.map((t, i) => <span key={i} style={{ marginRight: 60 }}>{t}</span>)}</span>
      </div>
    </div>
  );
}

function Footer() {
  return (
    <footer className="world-footer">
      <div>© 2026 Shayan Dsouza · Hand-coded in Toronto</div>
      <div>v2026.04 · BUILD #042</div>
      <div style={{ color: 'var(--accent)' }}>Press [Q] for quest log</div>
    </footer>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(<App />);
