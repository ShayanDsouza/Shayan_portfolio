// Biome transitions — TLoU chapter card, Witcher ink dissolve

function Transition({ kind, label, sub, onDone }) {
  const [phase, setPhase] = React.useState('go'); // go -> hold -> exit
  React.useEffect(() => {
    const t1 = setTimeout(() => setPhase('exit'), 1400);
    const t2 = setTimeout(() => onDone(), 2100);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, []);

  if (kind === 'chapter' || kind === 'tlou') {
    return (
      <div className={`transition tx-tlou ${phase}`}>
        <div className="chapter">
          <div className="chapter-num">Chapter II</div>
          <div className="chapter-name">{label || 'The Frontier'}</div>
          <div className="chapter-rule"></div>
          <div className="chapter-loc">{sub || '— Toronto, ON · 4 years ago —'}</div>
        </div>
      </div>
    );
  }

  if (kind === 'ink' || kind === 'witcher') {
    return (
      <div className={`transition tx-witcher ${phase}`}>
        <div className="ink">
          <div className="ink-eye">⚜</div>
          <div className="ink-title">{label || 'A New Contract'}</div>
          <div className="ink-sub">{sub || 'The board has fresh postings'}</div>
        </div>
      </div>
    );
  }

  return null;
}

Object.assign(window, { Transition });
