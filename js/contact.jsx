// Contact — Light the Beacon

function Contact() {
  const ref = React.useRef(null);
  const [choice, setChoice] = React.useState('hire');
  const [errors, setErrors] = React.useState({});
  const [sent, setSent] = React.useState(false);
  const [sending, setSending] = React.useState(false);
  const [lit, setLit] = React.useState(false);

  React.useEffect(() => {
    const obs = new IntersectionObserver(([e]) => {
      if (e.isIntersecting && e.intersectionRatio > 0.3) {
        window.gameStore.setBiome('CONTACT');
        window.gameStore.unlock('contact');
        setTimeout(() => setLit(true), 400);
      }
    }, { threshold: [0.3] });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);

  const email    = getCMS('contact.email',    'shayan.dsouza@mail.utoronto.ca');
  const github   = getCMS('contact.github',   'https://github.com/');
  const linkedin = getCMS('contact.linkedin', 'https://linkedin.com/');
  const resume   = getCMS('contact.resume',   '#');

  const placeholders = {
    hire:    { topic: 'Frontend internship for fall 2026', msg: "Hey, we're hiring a frontend intern and your work caught our eye..." },
    project: { topic: 'Build me an artist portfolio',      msg: "I'm a [whatever] looking for a portfolio site that..." },
    chat:    { topic: 'Just saying hi',                    msg: "No agenda. Liked the character sheet." },
    f1:      { topic: 'F1 take exchange',                  msg: "Lando 2026 WDC. Discuss." },
  };
  const ph = placeholders[choice];

  function submit(e) {
    e.preventDefault();
    const fd = new FormData(e.target);
    const next = {};
    if (!fd.get('name')?.trim()) next.name = 'required';
    if (!/.+@.+\..+/.test(fd.get('email') || '')) next.email = 'valid email';
    if (!fd.get('message')?.trim()) next.message = 'required';
    setErrors(next);
    if (Object.keys(next).length) return;
    setSending(true);
    setTimeout(() => { setSent(true); setSending(false); }, 1100);
  }

  return (
    <section className="world-contact" id="contact" ref={ref}>
      <div className="beacon-mountains" aria-hidden="true">
        <svg viewBox="0 0 1600 600" preserveAspectRatio="none">
          <defs>
            <linearGradient id="mtnGrad" x1="0" x2="0" y1="0" y2="1">
              <stop offset="0%"   stopColor="#1a1410" stopOpacity="0"/>
              <stop offset="100%" stopColor="#0a0807" stopOpacity="1"/>
            </linearGradient>
          </defs>
          <path d="M0,600 L0,360 L120,260 L220,310 L340,200 L480,300 L580,240 L720,330 L860,210 L980,290 L1100,250 L1240,330 L1380,240 L1500,300 L1600,260 L1600,600 Z" fill="url(#mtnGrad)" opacity=".85"/>
          <path d="M0,600 L0,420 L160,360 L300,400 L460,330 L620,400 L780,350 L920,420 L1080,360 L1240,420 L1400,370 L1600,410 L1600,600 Z" fill="#070504"/>
        </svg>
      </div>
      <div className="beacon-trails" aria-hidden="true">
        <span className="beacon-trail" style={{ left: '18%' }}></span>
        <span className="beacon-trail" style={{ left: '52%', animationDelay: '-2s' }}></span>
        <span className="beacon-trail" style={{ left: '78%', animationDelay: '-4s' }}></span>
      </div>

      <div className="contact-container">
        <div className="contact-header">
          <div className="label">— THE LAST WAYPOINT —</div>
          <h2 className="contact-title">LIGHT<br/><span className="ember">THE BEACON</span></h2>
          <p className="contact-tag">Send the signal. I'll see it.</p>
        </div>

        <div className="dialog-grid">
          <div>
            <div className="dialog-choices-label">— CALLS FOR AID —</div>
            <div className="dialog-choices">
              {[['hire','A','Hire me — internship / contract'],['project','B','Project quote — freelance build'],['chat','C','Just chat — say hi, no agenda'],['f1','D','F1 takes — exchange opinions']].map(([id, key, text]) => (
                <button key={id} className={'dialog-choice' + (choice === id ? ' active' : '')} onClick={() => setChoice(id)}>
                  <span className="key">{key}</span><span className="text">{text}</span>
                </button>
              ))}
            </div>

            <div style={{ marginTop: 30 }}>
              <div className="dialog-choices-label">— DIRECT FREQUENCIES —</div>
              <div className="signal-tower">
                <a href={`mailto:${email}`} className="signal-card">
                  <div className="signal-card-label">EMAIL</div>
                  <div className="signal-card-val">@utoronto</div>
                </a>
                <a href={github} target="_blank" rel="noopener" className="signal-card">
                  <div className="signal-card-label">GITHUB</div>
                  <div className="signal-card-val">↗</div>
                </a>
                <a href={linkedin} target="_blank" rel="noopener" className="signal-card">
                  <div className="signal-card-label">LINKEDIN</div>
                  <div className="signal-card-val">↗</div>
                </a>
                <a href={resume} className="signal-card">
                  <div className="signal-card-label">RESUME</div>
                  <div className="signal-card-val">PDF ↓</div>
                </a>
              </div>
            </div>
          </div>

          {sent ? (
            <div className="contact-form">
              <div className="form-success">
                <BeaconFlame lit={true} big={true} />
                <div className="success-title">SIGNAL SEEN</div>
                <div className="desc">REPLY WITHIN 48H</div>
                <p style={{ marginTop: 24, fontFamily: "'Instrument Serif', serif", fontStyle: 'italic', color: 'var(--ember-bone)', fontSize: 18 }}>
                  Thanks for the call. The fire has been lit.
                </p>
              </div>
            </div>
          ) : (
            <form className="contact-form" onSubmit={submit}>
              <div className="contact-form-label">
                <BeaconFlame lit={lit} />
                <span>BEACON · {lit ? 'LIT' : 'COLD'}</span>
              </div>
              <div className="form-row">
                <div className="form-field">
                  <label>Name</label>
                  <input name="name" type="text" placeholder="who calls?" />
                  {errors.name && <div className="form-error">✗ {errors.name}</div>}
                </div>
                <div className="form-field">
                  <label>Email</label>
                  <input name="email" type="email" placeholder="you@somewhere" />
                  {errors.email && <div className="form-error">✗ {errors.email}</div>}
                </div>
              </div>
              <div className="form-field" style={{ marginBottom: 16 }}>
                <label>Subject ({choice})</label>
                <input name="topic" type="text" placeholder={ph.topic} defaultValue={ph.topic} key={choice} />
              </div>
              <div className="form-field" style={{ marginBottom: 16 }}>
                <label>Message</label>
                <textarea name="message" placeholder={ph.msg} key={'m' + choice}></textarea>
                {errors.message && <div className="form-error">✗ {errors.message}</div>}
              </div>
              <button type="submit" className="form-submit" disabled={sending}>
                {sending ? '◌ LIGHTING…' : '◉ LIGHT THE BEACON'}
              </button>
            </form>
          )}
        </div>
      </div>
    </section>
  );
}

function BeaconFlame({ lit, big }) {
  return (
    <span className={'beacon-flame' + (lit ? ' lit' : '') + (big ? ' big' : '')} aria-hidden="true">
      <svg viewBox="0 0 24 32">
        <path d="M12 2 Q8 10 10 16 Q6 20 8 26 Q12 30 12 30 Q12 30 16 26 Q18 20 14 16 Q16 10 12 2" fill="currentColor"/>
        <path d="M12 12 Q10 18 12 24 Q14 18 12 12" fill="#ffeac2" opacity=".9"/>
      </svg>
    </span>
  );
}

Object.assign(window, { Contact });
