// Projects — Witcher 3 quest contracts

const DEFAULT_QUESTS = [
  { name: "Art by Tvesa", italic: "Tvesa", sub: "Artist portfolio + e-commerce", year: "2025–26", stack: ["React", "Firebase", "Three.js", "Vite"], desc: "Three.js hero, scroll-driven 3D carousel, Pinterest-style gallery, custom CMS with drag-drop, image compression, real-time Firestore sync.", link: "https://artbytvesa.com", tag: "// LIVE CONTRACT" },
  { name: "Korotu SAR Monitor", italic: "SAR", sub: "Vegetation monitoring via satellite", year: "2025", stack: ["React", "Leaflet", "Django", "Jest"], desc: "Map dashboard with overlay toggling, GeoJSON regions, side-by-side compare, 60-test Jest suite with custom mocks.", link: "https://github.com/csc301-2026-s/project-printf-debuggers", tag: "// MAIN QUEST" },
  { name: "Loyalty Program", italic: "Loyalty", sub: "Multi-role auth + admin/customer UI", year: "2024", stack: ["React", "Express", "Prisma"], desc: "Full-stack platform, role-based dashboards, REST API, responsive UI. CSC309 capstone.", link: "https://github.com/stalight/CSC309-A3", tag: "// SIDE QUEST" },
  { name: "SWSFC Draft Sim", italic: "Draft", sub: "FIFA-style XI builder", year: "2024", stack: ["Java", "Football API"], desc: "Live Football API, draft your XI, watch chemistry score wreck you for picking five strikers.", link: "https://github.com/willgc88/SWSFC", tag: "// SIDE QUEST" },
  { name: "Diagnostic Quiz ML", italic: "ML", sub: "Predicting student outcomes", year: "2024", stack: ["PyTorch", "NumPy"], desc: "Ensemble of ML models predicting student performance on diagnostic questions for personalized education.", link: "https://github.com/anthony-chen-ca/CSC311-project", tag: "// MAIN QUEST" },
  { name: "Dr. Mario in MIPS", italic: "MIPS", sub: "Pixel-pushin' assembly", year: "2023", stack: ["MIPS Assembly"], desc: "Built a Dr. Mario clone from scratch in MIPS assembly. Pixel collisions, falling pieces, the existential dread of register management.", link: "#", tag: "// LEGENDARY" },
  { name: "Soccer Market Value", italic: "Stats", sub: "What drives a striker's price", year: "2024", stack: ["R", "Linear Regression"], desc: "Statistical analysis on Transfermarkt + Kaggle data. Linear regression, feature selection, paper arguing age is overrated.", link: "https://docs.google.com/document/d/1JHNvzIGjuUvvlSqM1lN6jsVmNrZdg64o8C0nRinXkPk/edit?usp=sharing", tag: "// SCROLL QUEST" },
  { name: "Housing Affordability", italic: "Dash", sub: "Canadian housing pain, charted", year: "2024", stack: ["R", "Shiny", "Plotly"], desc: "Interactive Shiny dashboard with weighted median income-to-housing metrics across Canadian cities, 2016 vs 2021 census.", link: "https://jackkfan.shinyapps.io/Final/", tag: "// SIDE QUEST" },
];

function Projects() {
  const ref = React.useRef(null);
  React.useEffect(() => {
    const obs = new IntersectionObserver(([e]) => {
      if (e.isIntersecting && e.intersectionRatio > 0.25) {
        window.gameStore.setBiome('PROJECTS');
        window.gameStore.unlock('projects');
      }
    }, { threshold: [0.25] });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);

  const quests = getCMS('projects', DEFAULT_QUESTS);

  return (
    <section className="world-projects" id="projects" ref={ref}>
      <div className="witcher-container">
        <div className="witcher-header">
          <div>
            <div className="witcher-prelabel">◇ Notice Board ◇</div>
            <h2 className="witcher-title">Active <span className="gold">contracts.</span></h2>
          </div>
          <div className="witcher-meta">
            <span className="big">{['I','II','III','IV','V','VI','VII','VIII','IX','X'][quests.length - 1] || quests.length}</span>
            quests · 2023 — 2026
          </div>
        </div>

        <div className="quest-list">
          {quests.map((q, i) => <QuestRow key={i} q={q} i={i} />)}
        </div>

        <div style={{ marginTop: 30, fontFamily: "'Instrument Serif', serif", fontStyle: 'italic', textAlign: 'center', color: 'var(--witcher-gold)', fontSize: 18 }}>
          "More contracts forthcoming. Speak with the witcher if you have work."
        </div>
      </div>
    </section>
  );
}

function QuestRow({ q, i }) {
  const num = ['I','II','III','IV','V','VI','VII','VIII','IX','X'][i] || (i + 1);
  const stackArr = Array.isArray(q.stack) ? q.stack : (q.stack || '').split(',').map(s => s.trim()).filter(Boolean);

  return (
    <a href={q.link || '#'} target="_blank" rel="noopener" className="quest-row">
      <div className="quest-num">{num}.</div>
      <div className="quest-name">
        {q.name}
        <span className="small">{q.tag} · {q.sub} · {q.year}</span>
      </div>
      <div className="quest-stack">{stackArr.map(t => <span key={t} className="quest-tag">{t}</span>)}</div>
      <div className="quest-arrow">→</div>
    </a>
  );
}

Object.assign(window, { Projects });
