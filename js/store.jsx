// Global game state — XP, current biome, quest log
// Shared via window so all babel scripts can use it.

const ACHIEVEMENTS = {
  boot:     { id: 'boot',     title: 'Game Started',  desc: 'You pressed start.',           xp: 50, icon: '▶' },
  hero:     { id: 'hero',     title: 'Title Screen',  desc: 'Saw the splash page.',         xp: 50, icon: '✦' },
  about:    { id: 'about',    title: 'Read the Lore', desc: 'Lit the campfire.',            xp: 50, icon: '✎' },
  hobbies:  { id: 'hobbies',  title: 'Class Selected',desc: 'Inspected the runes.',         xp: 50, icon: 'ᚱ' },
  projects: { id: 'projects', title: 'Notice Board',  desc: 'Found the contracts.',         xp: 50, icon: '⚔' },
  contact:  { id: 'contact',  title: 'Beacon Lit',    desc: 'Sent the signal.',             xp: 50, icon: '◉' },
};

// Event bus
const listeners = new Set();
const state = {
  xp: 0,
  level: 1,
  biome: 'BOOT',
  achievements: new Set(),
  bootDone: false,
  questLogOpen: false,
};

function emit() { listeners.forEach(fn => fn(snapshot())); }
function snapshot() {
  return {
    xp: state.xp,
    level: state.level,
    biome: state.biome,
    achievements: [...state.achievements],
    bootDone: state.bootDone,
    questLogOpen: state.questLogOpen,
  };
}

function xpForLevel(lvl) { return 200 + (lvl - 1) * 250; }

function addXP(amount) {
  state.xp += amount;
  while (state.xp >= xpForLevel(state.level)) {
    state.xp -= xpForLevel(state.level);
    state.level++;
  }
  emit();
}

function unlock(achId) {
  const a = ACHIEVEMENTS[achId];
  if (!a || state.achievements.has(achId)) return;
  state.achievements.add(achId);
  addXP(a.xp);
  emit();
}

function setBiome(biome) {
  if (state.biome === biome) return;
  state.biome = biome;
  emit();
}

function setBootDone(v) {
  state.bootDone = v;
  emit();
  if (v) unlock('boot');
}

function toggleQuestLog(force) {
  state.questLogOpen = force !== undefined ? force : !state.questLogOpen;
  emit();
}

function useGameState() {
  const [s, setS] = React.useState(snapshot());
  React.useEffect(() => {
    const fn = (snap) => setS(snap);
    listeners.add(fn);
    return () => listeners.delete(fn);
  }, []);
  return s;
}

// CMS helper — reads from localStorage, falls back to default
function getCMS(path, fallback) {
  try {
    const data = JSON.parse(localStorage.getItem('portfolio_cms') || '{}');
    const val = path.split('.').reduce((o, k) => (o && o[k] !== undefined ? o[k] : undefined), data);
    return val !== undefined ? val : fallback;
  } catch { return fallback; }
}

Object.assign(window, {
  ACHIEVEMENTS,
  gameStore: { snapshot, addXP, unlock, setBiome, setBootDone, toggleQuestLog, xpForLevel },
  useGameState,
  getCMS,
});
