// Projects — Witcher 3 quest contracts

const DEFAULT_QUESTS = [
  { name: "Art by Tvesa",        italic: "Tvesa",   sub: "Artist portfolio + e-commerce",      year: "2025–26", stack: ["React", "Firebase", "Three.js", "Vite"],  desc: "Three.js hero, scroll-driven 3D carousel, Pinterest-style gallery, custom CMS with drag-drop, image compression, real-time Firestore sync. Built for a working artist — the CMS lets her update everything without touching code.",              link: "https://artbytvesa.com",                                                                                                       tag: "// LIVE CONTRACT", category: "fullstack", images: [], video: null },
  { name: "Korotu SAR Monitor",  italic: "SAR",     sub: "Vegetation monitoring via satellite", year: "2025",    stack: ["React", "Leaflet", "Django", "Jest"],       desc: "Map dashboard with overlay toggling, GeoJSON region selection, and side-by-side temporal compare for vegetation change analysis. Shipped a 60-test Jest suite with custom mocks for Leaflet map internals.",                                   link: "https://github.com/csc301-2026-s/project-printf-debuggers",                                                                  tag: "// MAIN QUEST",   category: "fullstack", images: [], video: null },
  { name: "Loyalty Program",     italic: "Loyalty", sub: "Multi-role auth + admin/customer UI", year: "2024",    stack: ["React", "Express", "Prisma"],               desc: "Full-stack rewards platform with role-based dashboards (admin vs customer), REST API with Prisma ORM, and responsive UI. Built as a CSC309 capstone — covered auth, database modelling, and deployment end-to-end.",                    link: "https://github.com/stalight/CSC309-A3",                                                                                      tag: "// SIDE QUEST",   category: "fullstack", images: [], video: null },
  { name: "SWSFC Draft Sim",     italic: "Draft",   sub: "FIFA-style XI builder",               year: "2024",    stack: ["Java", "Football API"],                     desc: "Live Football API integration — draft your starting XI and watch the chemistry score punish you for picking five strikers. Handles live squad data, position logic, and a surprisingly brutal scoring model.",                          link: "https://github.com/willgc88/SWSFC",                                                                                          tag: "// SIDE QUEST",   category: "fullstack", images: [], video: null },
  { name: "Diagnostic Quiz ML",  italic: "ML",      sub: "Predicting student outcomes",         year: "2024",    stack: ["PyTorch", "NumPy"],                         desc: "Ensemble of ML models predicting student performance on diagnostic questions for adaptive, personalised education. Explored logistic regression, neural nets, and ensemble methods — then evaluated which actually generalised.",             link: "https://github.com/anthony-chen-ca/CSC311-project",                                                                           tag: "// MAIN QUEST",   category: "ml-ai",     images: [], video: null },
  { name: "Dr. Mario in MIPS",   italic: "MIPS",    sub: "Pixel-pushin' assembly",              year: "2023",    stack: ["MIPS Assembly"],                            desc: "Built a Dr. Mario clone from scratch in MIPS assembly language. Pixel collision detection, falling pieces, a working game loop, and the existential dread of hunting bugs in register land. No debugger. Just vibes and pain.",           link: "#",                                                                                                                           tag: "// LEGENDARY",    category: "fullstack", images: [], video: null },
  { name: "Soccer Market Value", italic: "Stats",   sub: "What drives a striker's price",       year: "2024",    stack: ["R", "Linear Regression"],                   desc: "Statistical deep-dive on Transfermarkt and Kaggle data. Linear regression, feature selection, and a paper arguing that age is overrated as a market value predictor — performance metrics tell a far more interesting story.",          link: "https://docs.google.com/document/d/1JHNvzIGjuUvvlSqM1lN6jsVmNrZdg64o8C0nRinXkPk/edit?usp=sharing",                          tag: "// SCROLL QUEST", category: "data",      images: [], video: null },
  { name: "Housing Affordability",italic: "Dash",   sub: "Canadian housing pain, charted",      year: "2024",    stack: ["R", "Shiny", "Plotly"],                     desc: "Interactive Shiny dashboard visualising weighted median income-to-housing metrics across Canadian cities using 2016 vs 2021 census data. Built to make the affordability crisis legible — which it absolutely is, and it's bleak.",          link: "https://jackkfan.shinyapps.io/Final/",                                                                                        tag: "// SIDE QUEST",   category: "data",      images: [], video: null },
];

const FILTERS = [
  { id: 'all',       label: 'All Contracts', icon: '⚜' },
  { id: 'fullstack', label: 'Full Stack',    icon: '⚔' },
  { id: 'ml-ai',     label: 'ML / AI',       icon: '✦' },
  { id: 'data',      label: 'Data',          icon: 'ᚱ' },
];

function Projects() {
  const ref = React.useRef(null);
  const [filter, setFilter] = React.useState('all');
  const [selectedQuest, setSelectedQuest] = React.useState(null);

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

  const allQuests = getCMS('projects', DEFAULT_QUESTS);
  const quests    = filter === 'all' ? allQuests : allQuests.filter(q => q.category === filter);

  return (
    <>
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

          {/* Filter legend */}
          <div className="contract-filters">
            {FILTERS.map(f => (
              <button
                key={f.id}
                className={'contract-filter' + (filter === f.id ? ' active' : '')}
                onClick={() => setFilter(f.id)}
              >
                <span className="cf-icon">{f.icon}</span>
                <span className="cf-label">{f.label}</span>
              </button>
            ))}
          </div>

          <div className="quest-list">
            {quests.map((q, i) => (
              <QuestRow key={q.name} q={q} i={i} onSelect={setSelectedQuest} />
            ))}
          </div>

          <div style={{ marginTop: 30, fontFamily: "'Instrument Serif', serif", fontStyle: 'italic', textAlign: 'center', color: 'var(--witcher-gold)', fontSize: 18 }}>
            "More contracts forthcoming. Speak with Shayan if you have work."
          </div>
        </div>
      </section>
      {selectedQuest ? <ProjectDetail quest={selectedQuest} onClose={() => setSelectedQuest(null)} /> : null}
    </>
  );
}

function QuestRow({ q, i, onSelect }) {
  const num      = ['I','II','III','IV','V','VI','VII','VIII','IX','X'][i] || (i + 1);
  const stackArr = Array.isArray(q.stack) ? q.stack : (q.stack || '').split(',').map(s => s.trim()).filter(Boolean);

  return (
    <button type="button" className="quest-row" onClick={() => onSelect(q)}>
      <div className="quest-num">{num}.</div>
      <div className="quest-name">
        {q.name}
        <span className="small">{q.tag} · {q.sub} · {q.year}</span>
      </div>
      <div className="quest-stack">{stackArr.map(t => <span key={t} className="quest-tag">{t}</span>)}</div>
      <div className="quest-arrow">→</div>
    </button>
  );
}

Object.assign(window, { Projects, DEFAULT_QUESTS });
