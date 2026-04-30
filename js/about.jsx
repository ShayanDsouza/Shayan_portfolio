// About — D&D character sheet on aged parchment

function About() {
  const ref = React.useRef(null);
  React.useEffect(() => {
    const obs = new IntersectionObserver(([e]) => {
      if (e.isIntersecting && e.intersectionRatio > 0.3) {
        window.gameStore.setBiome('ABOUT');
        window.gameStore.unlock('about');
      }
    }, { threshold: [0.3] });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);

  const portrait = getCMS('about.portrait', null);
  const p1 = getCMS('about.p1', "Ships first, polishes loud. Reads docs cover to cover, then ignores the part that's wrong. Builds things people use, not things people benchmark.");
  const p2 = getCMS('about.p2', "Currently chasing: a 315 deadlift, a clean fingerstyle solo, and a frontend role that lets me actually design.");

  const abilities = [
    { name: 'STR', score: 14, mod: '+2', note: '225 bench · PPL split, 5/wk' },
    { name: 'DEX', score: 16, mod: '+3', note: 'Apex Diamond · clean keys-on-keyboard' },
    { name: 'CON', score: 17, mod: '+3', note: 'Sleep is a myth. So is rest day.' },
    { name: 'INT', score: 18, mod: '+4', note: 'CS @ UofT · ML, systems, distributed' },
    { name: 'WIS', score: 13, mod: '+1', note: 'Knows when not to push to main' },
    { name: 'CHA', score: 15, mod: '+2', note: 'Demos well · explains worse' },
  ];

  const proficiencies = [
    { group: 'Languages', items: ['JavaScript / TypeScript', 'Python', 'Java', 'R', 'C / MIPS Assembly', 'SQL'] },
    { group: 'Tools',     items: ['React · Three.js · Vite', 'Node · Express · Prisma', 'Django · Firebase', 'PyTorch · NumPy', 'Git · Jest · CI'] },
    { group: 'Off-clock', items: ['Fingerstyle guitar', 'Powerlifting (PPL)', 'F1 strategy nerd', 'Apex Legends'] },
  ];

  return (
    <section className="world-about" id="about" ref={ref}>
      <div className="about-container">
        <div className="about-header">
          <div className="about-chapter">Chapter II — The Frontier</div>
          <h2 className="about-title">Character <em>sheet.</em></h2>
        </div>

        <div className="dnd-sheet">
          <header className="dnd-top">
            <div className="dnd-portrait">
              <div className="dnd-portrait-frame">
                <div className="dnd-portrait-img">
                  {portrait
                    ? <img src={portrait} alt="Portrait" />
                    : <span>[ portrait ]</span>
                  }
                </div>
              </div>
              <div className="dnd-portrait-cap">— self-portrait, ink on paper —</div>
            </div>

            <div className="dnd-identity">
              <div className="dnd-id-grid">
                <Field label="Character Name"  value="Shayan Dsouza" big />
                <Field label="Class & Level"   value="Full-Stack Mage · Lvl 4" />
                <Field label="Background"      value="CS @ UofT" />
                <Field label="Race"            value="Human · Toronto, ON" />
                <Field label="Alignment"       value="Lawful Caffeinated" />
                <Field label="Player"          value="Available — Fall '26" />
              </div>

              <div className="dnd-flavor">
                <div className="dnd-flavor-label">— Personality —</div>
                <p>{p1}</p>
                <p>{p2}</p>
              </div>
            </div>
          </header>

          <section className="dnd-abilities">
            {abilities.map(a => (
              <div className="dnd-ability" key={a.name}>
                <div className="dnd-ability-mod">{a.mod}</div>
                <div className="dnd-ability-score">{a.score}</div>
                <div className="dnd-ability-name">{a.name}</div>
                <div className="dnd-ability-note">{a.note}</div>
              </div>
            ))}
          </section>

          <section className="dnd-mid">
            <div className="dnd-block">
              <div className="dnd-block-title">⚔ Proficiencies & Languages</div>
              {proficiencies.map(p => (
                <div className="dnd-prof-row" key={p.group}>
                  <div className="dnd-prof-group">{p.group}</div>
                  <div className="dnd-prof-items">
                    {p.items.map(i => <span key={i}>· {i}</span>)}
                  </div>
                </div>
              ))}
            </div>

            <div className="dnd-block">
              <div className="dnd-block-title">🜲 Equipment & Inventory</div>
              <ul className="dnd-equip">
                <li>· 16" laptop (battle-worn, +2 to typing)</li>
                <li>· Mechanical keyboard (loud, glowing)</li>
                <li>· Acoustic guitar (un-tuned, lovingly)</li>
                <li>· One squat belt of holding</li>
                <li>· Several half-finished side projects</li>
                <li>· Coffee mug (cursed, refills self)</li>
              </ul>
              <div className="dnd-block-title" style={{ marginTop: 18 }}>✶ Saving Throws</div>
              <div className="dnd-saves">
                <Save label="Deadlines" mod="+5" />
                <Save label="Code Review" mod="+4" />
                <Save label="Imposter Syndrome" mod="−1" />
                <Save label="Tab Hoarding" mod="−6" />
              </div>
            </div>
          </section>

          <footer className="dnd-foot">
            <div className="dnd-stamp">◇ FILED · TORONTO · APR 2026 ◇</div>
            <div className="dnd-sig">— Shayan</div>
          </footer>
        </div>
      </div>
    </section>
  );
}

function Field({ label, value, big }) {
  return (
    <div className={'dnd-field' + (big ? ' big' : '')}>
      <div className="dnd-field-label">{label}</div>
      <div className="dnd-field-value">{value}</div>
    </div>
  );
}

function Save({ label, mod }) {
  return (
    <div className="dnd-save">
      <span className="dnd-save-mod">{mod}</span>
      <span className="dnd-save-label">{label}</span>
    </div>
  );
}

Object.assign(window, { About });
