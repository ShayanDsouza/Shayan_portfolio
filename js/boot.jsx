// Boot screen — Press Start

function BootScreen({ onStart }) {
  const [exiting, setExiting] = React.useState(false);
  const [progress, setProgress] = React.useState(0);

  React.useEffect(() => {
    const i = setInterval(() => setProgress(p => Math.min(100, p + Math.random() * 12)), 180);
    const handler = (e) => {
      if (e.key === 'Enter' || e.key === ' ') start();
    };
    window.addEventListener('keydown', handler);
    return () => { clearInterval(i); window.removeEventListener('keydown', handler); };
  }, []);

  function start() {
    setExiting(true);
    setTimeout(() => onStart(), 700);
  }

  return (
    <div className={'boot' + (exiting ? ' fade-out' : '')}>
      <div className="boot-crt"></div>
      <div className="boot-content boot-flicker">
        <div className="boot-meta">◇ SHAYAN_DSOUZA · v2026.04 · build #042 ◇</div>
        <h1 className="boot-title">
          PRESS<br/>
          <span className="italic">START</span>
        </h1>
        <div className="boot-sub">A FULL-STACK ADVENTURE · ONE PLAYER · NO LIVES</div>

        <button className="boot-press" onClick={start}>
          ▶ PRESS START
        </button>

        <div className="boot-loading"><div></div></div>
        <div style={{ marginTop: 8, fontSize: 9, color: 'var(--fg-mute)', letterSpacing: '.2em' }}>
          LOADING ASSETS... {Math.round(progress)}%
        </div>

        <div className="boot-controls">
          <span><kbd>↵</kbd>or<kbd>SPACE</kbd>begin</span>
          <span><kbd>Q</kbd>quest log</span>
          <span><kbd>SCROLL</kbd>explore</span>
        </div>
      </div>
    </div>
  );
}

Object.assign(window, { BootScreen });
