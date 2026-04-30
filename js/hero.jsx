// Hero — dark noir comic title card (Daredevil / Dark Knight inspired)

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

        <div className="comic-panel tilt-r" style={{ gridColumn: '2 / 3', gridRow: '2 / 3', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', gap: 12 }}>
          <div className="comic-caption">// CHOOSE YOUR PATH</div>
          <a href="#projects" className="hero-cta hero-cta-primary">► VIEW THE WORK</a>
          <a href="#contact"  className="hero-cta hero-cta-bone">► LIGHT THE BEACON</a>
          <a href="#about"    className="hero-cta hero-cta-ghost">► READ THE LORE</a>
        </div>
      </div>
    </section>
  );
}

Object.assign(window, { Hero });
