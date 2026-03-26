import type { Metadata } from 'next'
import { createClient } from '@/lib/supabase/server'

export const metadata: Metadata = {
  title: 'ScoreForge — Il Portfolio che la tua Arte Merita',
  description: 'La piattaforma per artisti creativi che vogliono presentare il proprio lavoro con la stessa cura con cui lo creano. Portfolio cinematografici, analytics avanzate, landing page pubbliche.',
  openGraph: {
    title: 'ScoreForge — Il Portfolio che la tua Arte Merita',
    description: 'Portfolio professionali per compositori, musicisti e artisti creativi. Crea la tua presenza digitale in minuti.',
    type: 'website',
  },
}

export default async function HomePage() {
  const supabase = await createClient()
  const { data: plans } = await supabase
    .from('subscription_plans')
    .select('name, label, price_eur, price_eur_annual, max_portfolios, max_tracks, max_storage_mb, features')
    .eq('active', true)
    .order('sort_order')

  return <LandingPage plans={plans || []} />
}

function LandingPage({ plans }: { plans: any[] }) {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || ''

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,600;1,300;1,400;1,600&family=Outfit:wght@200;300;400;500;600&family=DM+Mono:wght@300;400&display=swap');

        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        :root {
          --black:  #07070d;
          --black2: #0d0d18;
          --black3: #13131f;
          --black4: #1a1a2a;
          --gold1:  #c8a45a;
          --gold2:  #e2c47e;
          --gold3:  #f5e4b8;
          --cream:  #f0ebe0;
          --muted:  #a09888;
          --faint:  #5a5548;
          --border: rgba(255,255,255,0.07);
          --serif:  'Cormorant Garamond', Georgia, serif;
          --sans:   'Outfit', system-ui, sans-serif;
          --mono:   'DM Mono', monospace;
        }

        html { scroll-behavior: smooth; }

        body {
          background: var(--black);
          color: var(--cream);
          font-family: var(--sans);
          -webkit-font-smoothing: antialiased;
          overflow-x: hidden;
        }

        /* ── Scrollbar ── */
        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-track { background: var(--black); }
        ::-webkit-scrollbar-thumb { background: var(--gold1); border-radius: 2px; }

        /* ── Animations ── */
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(30px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to   { opacity: 1; }
        }
        @keyframes waveFlow {
          0%   { stroke-dashoffset: 0; }
          100% { stroke-dashoffset: -200; }
        }
        @keyframes pulse {
          0%, 100% { opacity: 0.4; }
          50%       { opacity: 0.9; }
        }
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50%       { transform: translateY(-8px); }
        }
        @keyframes shimmer {
          0%   { background-position: -200% center; }
          100% { background-position: 200% center; }
        }

        .reveal {
          animation: fadeUp .9s ease both;
        }
        .reveal:nth-child(1) { animation-delay: .1s; }
        .reveal:nth-child(2) { animation-delay: .2s; }
        .reveal:nth-child(3) { animation-delay: .3s; }

        /* ── Utility ── */
        .container { max-width: 1100px; margin: 0 auto; padding: 0 clamp(20px, 4vw, 52px); }
        .tag { font-family: var(--mono); font-size: 10px; letter-spacing: .2em; text-transform: uppercase; color: var(--gold1); opacity: .85; }
        .section { padding: clamp(72px, 10vw, 130px) 0; }
        .divider { height: 1px; background: var(--border); }

        /* ── Nav ── */
        nav {
          position: fixed; top: 0; left: 0; right: 0; z-index: 100;
          display: flex; align-items: center; justify-content: space-between;
          padding: 18px clamp(20px,4vw,52px);
          background: rgba(7,7,13,.85);
          backdrop-filter: blur(16px);
          border-bottom: 1px solid var(--border);
          transition: padding .3s;
        }
        .nav-logo { display: flex; align-items: center; gap: 10px; text-decoration: none; }
        .nav-links { display: flex; align-items: center; gap: 28px; }
        .nav-links a { color: var(--faint); text-decoration: none; font-size: 13px; transition: color .2s; }
        .nav-links a:hover { color: var(--gold1); }
        .btn-nav {
          padding: 9px 22px; border-radius: 6px; font-size: 13px; font-weight: 500;
          cursor: pointer; text-decoration: none; transition: all .2s; font-family: var(--sans);
          background: var(--gold1); color: var(--black); border: none;
          display: inline-block;
        }
        .btn-nav:hover { background: var(--gold2); }

        /* ── Hero ── */
        .hero {
          min-height: 100vh;
          display: flex; flex-direction: column; align-items: center; justify-content: center;
          text-align: center;
          position: relative;
          overflow: hidden;
          padding: 120px clamp(20px,4vw,52px) 80px;
        }
        .hero-bg {
          position: absolute; inset: 0; pointer-events: none;
        }
        .hero-grid {
          position: absolute; inset: 0;
          background-image:
            linear-gradient(var(--border) 1px, transparent 1px),
            linear-gradient(90deg, var(--border) 1px, transparent 1px);
          background-size: 60px 60px;
          mask-image: radial-gradient(ellipse at 50% 50%, black 30%, transparent 80%);
        }
        .hero-glow {
          position: absolute;
          width: 700px; height: 700px;
          background: radial-gradient(ellipse, rgba(200,164,90,.08) 0%, transparent 70%);
          top: 50%; left: 50%; transform: translate(-50%, -50%);
        }
        .hero-tagline {
          font-family: var(--serif);
          font-size: clamp(42px, 7vw, 92px);
          font-weight: 300;
          line-height: 1.04;
          letter-spacing: -.01em;
          margin: 20px 0 28px;
          animation: fadeUp .9s ease both;
          animation-delay: .2s;
        }
        .hero-tagline em {
          font-style: italic;
          color: var(--gold2);
        }
        .hero-sub {
          font-size: clamp(15px, 2vw, 18px);
          color: var(--muted);
          max-width: 540px;
          line-height: 1.8;
          animation: fadeUp .9s ease both;
          animation-delay: .4s;
        }
        .hero-cta {
          display: flex; gap: 12px; justify-content: center; flex-wrap: wrap;
          margin-top: 40px;
          animation: fadeUp .9s ease both;
          animation-delay: .6s;
        }
        .btn-primary {
          padding: 14px 36px; border-radius: 8px; font-size: 15px; font-weight: 500;
          cursor: pointer; text-decoration: none; transition: all .2s; font-family: var(--sans);
          background: var(--gold1); color: var(--black); border: none;
          display: inline-flex; align-items: center; gap: 8px;
        }
        .btn-primary:hover { background: var(--gold2); transform: translateY(-2px); }
        .btn-ghost {
          padding: 14px 32px; border-radius: 8px; font-size: 15px; font-weight: 400;
          cursor: pointer; text-decoration: none; transition: all .2s; font-family: var(--sans);
          background: transparent; color: var(--muted);
          border: 1px solid rgba(255,255,255,.12);
          display: inline-flex; align-items: center; gap: 8px;
        }
        .btn-ghost:hover { border-color: var(--gold1); color: var(--gold1); }

        /* Score wave SVG hero */
        .hero-wave {
          margin: 48px auto 0;
          opacity: .5;
          animation: fadeIn 1.4s ease both;
          animation-delay: .8s;
        }
        .wave-line { stroke-dasharray: 12 4; animation: waveFlow 4s linear infinite; }
        .wave-line-main { stroke-dasharray: none; animation: none; }

        /* ── Manifesto ── */
        .manifesto {
          background: var(--black2);
          border-top: 1px solid var(--border);
          border-bottom: 1px solid var(--border);
        }
        .manifesto-text {
          font-family: var(--serif);
          font-size: clamp(26px, 4vw, 46px);
          font-weight: 300;
          font-style: italic;
          line-height: 1.4;
          color: var(--cream);
          max-width: 820px;
          margin: 0 auto;
          text-align: center;
        }
        .manifesto-text strong { font-style: normal; color: var(--gold2); font-weight: 400; }

        /* ── Features ── */
        .features-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
          gap: 20px;
          margin-top: 48px;
        }
        .feature-card {
          background: var(--black3);
          border: 1px solid var(--border);
          border-radius: 16px;
          padding: 32px 28px;
          transition: border-color .3s, transform .3s;
          position: relative;
          overflow: hidden;
        }
        .feature-card::before {
          content: '';
          position: absolute; top: 0; left: 0; right: 0; height: 1px;
          background: linear-gradient(90deg, transparent, var(--gold1), transparent);
          opacity: 0;
          transition: opacity .3s;
        }
        .feature-card:hover { border-color: rgba(200,164,90,.3); transform: translateY(-4px); }
        .feature-card:hover::before { opacity: 1; }
        .feature-icon {
          width: 48px; height: 48px;
          border-radius: 12px;
          background: rgba(200,164,90,.1);
          border: 1px solid rgba(200,164,90,.2);
          display: flex; align-items: center; justify-content: center;
          margin-bottom: 20px;
          font-size: 20px;
        }
        .feature-title {
          font-family: var(--serif);
          font-size: 22px;
          font-weight: 400;
          margin-bottom: 10px;
          color: var(--cream);
        }
        .feature-desc {
          font-size: 14px;
          line-height: 1.8;
          color: var(--muted);
        }

        /* ── Showcase ── */
        .showcase {
          background: linear-gradient(to bottom, var(--black), var(--black2));
        }
        .showcase-mockup {
          background: var(--black3);
          border: 1px solid var(--border);
          border-radius: 16px;
          overflow: hidden;
          margin-top: 48px;
          box-shadow: 0 40px 100px rgba(0,0,0,.6), 0 0 0 1px var(--border);
        }
        .mockup-bar {
          background: var(--black4);
          border-bottom: 1px solid var(--border);
          padding: 12px 20px;
          display: flex; align-items: center; gap: 8px;
        }
        .mockup-dot { width: 10px; height: 10px; border-radius: 50%; }
        .mockup-url {
          flex: 1; margin: 0 16px;
          background: var(--black);
          border: 1px solid var(--border);
          border-radius: 6px;
          padding: 5px 12px;
          font-family: var(--mono);
          font-size: 10px;
          color: var(--faint);
        }
        .mockup-content {
          padding: 32px;
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 20px;
        }
        .mockup-stat {
          background: var(--black4);
          border: 1px solid var(--border);
          border-radius: 12px;
          padding: 20px;
        }
        .mockup-stat-num {
          font-family: var(--serif);
          font-size: 40px;
          font-weight: 300;
          color: var(--gold2);
          line-height: 1;
        }
        .mockup-stat-label {
          font-size: 10px;
          font-family: var(--mono);
          color: var(--faint);
          text-transform: uppercase;
          letter-spacing: .1em;
          margin-top: 6px;
        }
        .mockup-track {
          background: var(--black4);
          border: 1px solid var(--border);
          border-radius: 10px;
          padding: 14px 16px;
          display: flex; align-items: center; gap: 12px;
          margin-bottom: 8px;
        }
        .play-btn {
          width: 32px; height: 32px; border-radius: 50%;
          background: var(--gold1);
          display: flex; align-items: center; justify-content: center;
          font-size: 10px; color: var(--black);
          flex-shrink: 0;
        }
        .waveform {
          flex: 1; height: 28px;
          display: flex; align-items: center; gap: 1.5px;
        }
        .waveform-bar {
          flex-shrink: 0;
          width: 2px;
          border-radius: 1px;
          background: var(--gold1);
        }

        /* ── Pricing ── */
        .plans-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
          gap: 16px;
          margin-top: 48px;
          align-items: start;
        }
        .plan-card {
          background: var(--black3);
          border: 1px solid var(--border);
          border-radius: 18px;
          padding: 32px 28px;
          position: relative;
          transition: transform .3s, border-color .3s;
        }
        .plan-card:hover { transform: translateY(-4px); }
        .plan-card.featured {
          background: linear-gradient(160deg, var(--black4), var(--black3));
          border-color: rgba(200,164,90,.4);
          transform: scale(1.03);
        }
        .plan-card.featured:hover { transform: scale(1.03) translateY(-4px); }
        .featured-badge {
          position: absolute; top: -12px; left: 50%; transform: translateX(-50%);
          background: var(--gold1); color: var(--black);
          padding: 4px 16px; border-radius: 20px;
          font-size: 10px; font-family: var(--mono); letter-spacing: .1em;
          font-weight: 500;
        }
        .plan-name {
          font-family: var(--serif);
          font-size: 26px; font-weight: 400;
          margin-bottom: 4px;
        }
        .plan-price {
          font-family: var(--serif);
          font-size: 48px; font-weight: 300;
          color: var(--gold2);
          line-height: 1;
          margin: 16px 0 4px;
        }
        .plan-price sup { font-size: 22px; vertical-align: top; margin-top: 8px; display: inline-block; }
        .plan-price span { font-size: 16px; color: var(--faint); }
        .plan-annual { font-size: 11px; color: var(--faint); font-family: var(--mono); margin-bottom: 20px; }
        .plan-divider { height: 1px; background: var(--border); margin: 20px 0; }
        .plan-features { list-style: none; }
        .plan-features li {
          font-size: 13.5px; color: var(--muted);
          padding: 6px 0;
          display: flex; align-items: center; gap: 10px;
        }
        .plan-features li::before {
          content: ''; width: 5px; height: 5px; border-radius: 50%;
          background: var(--gold1); flex-shrink: 0;
        }
        .plan-cta {
          width: 100%; padding: 13px;
          border-radius: 8px; font-size: 14px; font-weight: 500;
          cursor: pointer; text-decoration: none;
          font-family: var(--sans);
          margin-top: 24px; display: block; text-align: center;
          transition: all .2s;
        }
        .plan-cta.gold {
          background: var(--gold1); color: var(--black); border: none;
        }
        .plan-cta.gold:hover { background: var(--gold2); }
        .plan-cta.outline {
          background: transparent; color: var(--muted);
          border: 1px solid var(--border);
        }
        .plan-cta.outline:hover { border-color: var(--gold1); color: var(--gold1); }

        /* ── Storia ── */
        .story-grid {
          display: grid;
          grid-template-columns: 1fr 1.4fr;
          gap: 64px;
          align-items: center;
        }
        .story-visual {
          position: relative;
        }
        .story-card {
          background: var(--black3);
          border: 1px solid var(--border);
          border-radius: 20px;
          padding: 28px;
          animation: float 6s ease-in-out infinite;
        }
        .story-names {
          font-family: var(--serif);
          font-size: 28px;
          font-weight: 300;
          margin-bottom: 6px;
        }
        .story-role { font-size: 12px; color: var(--faint); font-family: var(--mono); letter-spacing: .1em; }
        .story-text {
          font-family: var(--serif);
          font-size: clamp(20px, 3vw, 30px);
          font-weight: 300;
          font-style: italic;
          line-height: 1.55;
          color: var(--cream);
        }
        .story-text strong { font-style: normal; color: var(--gold2); font-weight: 400; }

        /* ── CTA finale ── */
        .final-cta {
          background: var(--black2);
          border-top: 1px solid var(--border);
          text-align: center;
        }
        .final-heading {
          font-family: var(--serif);
          font-size: clamp(36px, 6vw, 72px);
          font-weight: 300;
          line-height: 1.1;
          margin: 20px 0 16px;
        }
        .final-heading em { font-style: italic; color: var(--gold2); }

        /* ── Footer ── */
        footer {
          background: var(--black);
          border-top: 1px solid var(--border);
          padding: 36px clamp(20px,4vw,52px);
        }
        .footer-inner {
          max-width: 1100px; margin: 0 auto;
          display: flex; justify-content: space-between; align-items: center;
          flex-wrap: wrap; gap: 16px;
        }
        .footer-links { display: flex; gap: 24px; flex-wrap: wrap; }
        .footer-links a { font-size: 11px; color: var(--faint); text-decoration: none; font-family: var(--mono); transition: color .2s; }
        .footer-links a:hover { color: var(--gold1); }
        .footer-copy { font-size: 11px; color: var(--faint); font-family: var(--mono); }

        /* ── Responsive ── */
        @media (max-width: 768px) {
          .nav-links { display: none; }
          .story-grid { grid-template-columns: 1fr; }
          .story-visual { display: none; }
          .mockup-content { grid-template-columns: 1fr; }
          .plan-card.featured { transform: none; }
        }
      `}</style>

      {/* ── NAV ── */}
      <nav>
        <a href="/" className="nav-logo">
          <svg width="110" height="24" viewBox="0 0 110 24">
            <path d="M16,2 Q22,1.5 22,7 Q22,12.5 16,12.5" fill="none" stroke="#e2c47e" strokeWidth="2.2" strokeLinecap="round"/>
            <path d="M10,12.5 Q4,12.5 4,17.5 Q4,22.5 10,22" fill="none" stroke="#c8a45a" strokeWidth="2.2" strokeLinecap="round"/>
            <line x1="10" y1="12.5" x2="16" y2="12.5" stroke="#e2c47e" strokeWidth="2.2" strokeLinecap="round"/>
            <text x="30" y="10" fontFamily="'Cormorant Garamond',serif" fontSize="12" fontWeight="300" fill="#f0ebe0" letterSpacing="1.5">SCORE</text>
            <line x1="30" y1="13.5" x2="100" y2="13.5" stroke="#2a2830" strokeWidth="0.4"/>
            <text x="30" y="22" fontFamily="'Outfit',sans-serif" fontSize="7" fontWeight="500" fill="#c8a45a" letterSpacing="4">FORGE</text>
          </svg>
        </a>
        <div className="nav-links">
          <a href="#features">Funzionalità</a>
          <a href="#piani">Piani</a>
          <a href="#storia">La nostra storia</a>
          <a href={`${appUrl}/login`} className="btn-nav">Accedi</a>
        </div>
      </nav>

      {/* ── HERO ── */}
      <section className="hero">
        <div className="hero-bg">
          <div className="hero-grid" />
          <div className="hero-glow" />
        </div>
        <div className="tag" style={{ animation: 'fadeUp .6s ease both' }}>Il portfolio per chi crea musica originale</div>
        <h1 className="hero-tagline">
          La tua arte<br />
          merita <em>il palco</em><br />
          che si merita.
        </h1>
        <p className="hero-sub">
          ScoreForge è la piattaforma che trasforma il tuo lavoro artistico in una presenza digitale indimenticabile. Creata da un artista, per gli artisti.
        </p>
        <div className="hero-cta">
          <a href={`${appUrl}/login`} className="btn-primary">
            Inizia gratis
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M2 7h10M7 2l5 5-5 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
          </a>
          <a href="#features" className="btn-ghost">Scopri come funziona</a>
        </div>
        {/* Onda partitura animata */}
        <svg className="hero-wave" width="540" height="54" viewBox="0 0 540 54">
          <path className="wave-line" d="M0,12 L80,12 C100,12 108,6 120,4 C132,2 140,8 150,12 C160,16 168,12 188,12 L220,12" fill="none" stroke="#c8a45a" strokeWidth="0.9" opacity="0.5"/>
          <path className="wave-line" d="M0,22 L78,22 C98,22 106,14 120,10 C134,6 142,16 152,22 C162,28 170,22 188,22 L220,22" fill="none" stroke="#c8a45a" strokeWidth="1.2" opacity="0.7"/>
          <path className="wave-line-main" d="M0,32 L75,32 C95,32 105,16 120,10 C135,4 145,22 155,32 C165,42 174,32 188,32 L220,32" fill="none" stroke="#e2c47e" strokeWidth="2" opacity="0.9"/>
          <path className="wave-line" d="M0,42 L78,42 C98,42 106,50 120,54 C134,58 142,48 152,42 C162,36 170,42 188,42 L220,42" fill="none" stroke="#c8a45a" strokeWidth="1.2" opacity="0.7"/>
          <circle cx="120" cy="10" r="3.5" fill="#f5e4b8" opacity="0.9" style={{ animation: 'pulse 2s ease-in-out infinite' }}/>
          {/* Rispecchia la forma sull'asse */}
          <path className="wave-line" d="M320,12 L400,12 C420,12 428,6 440,4 C452,2 460,8 470,12 C480,16 488,12 508,12 L540,12" fill="none" stroke="#c8a45a" strokeWidth="0.9" opacity="0.5"/>
          <path className="wave-line" d="M320,22 L398,22 C418,22 426,14 440,10 C454,6 462,16 472,22 C482,28 490,22 508,22 L540,22" fill="none" stroke="#c8a45a" strokeWidth="1.2" opacity="0.7"/>
          <path className="wave-line-main" d="M320,32 L395,32 C415,32 425,16 440,10 C455,4 465,22 475,32 C485,42 494,32 508,32 L540,32" fill="none" stroke="#e2c47e" strokeWidth="2" opacity="0.9"/>
          <path className="wave-line" d="M320,42 L398,42 C418,42 426,50 440,54 C454,58 462,48 472,42 C482,36 490,42 508,42 L540,42" fill="none" stroke="#c8a45a" strokeWidth="1.2" opacity="0.7"/>
          <circle cx="440" cy="10" r="3.5" fill="#f5e4b8" opacity="0.9" style={{ animation: 'pulse 2s ease-in-out infinite', animationDelay: '1s' }}/>
        </svg>
      </section>

      {/* ── MANIFESTO ── */}
      <section className="manifesto section">
        <div className="container reveal">
          <p className="manifesto-text">
            "Hai dedicato anni a costruire il tuo suono.<br />
            Ogni composizione è una storia. Ogni nota, una scelta.<br />
            <strong>Il tuo portfolio dovrebbe raccontarle tutte.</strong>"
          </p>
        </div>
      </section>

      {/* ── FEATURES ── */}
      <section className="section" id="features">
        <div className="container">
          <div className="reveal">
            <div className="tag">Funzionalità</div>
            <h2 style={{ fontFamily: 'var(--serif)', fontSize: 'clamp(32px,5vw,54px)', fontWeight: 300, marginTop: 12, lineHeight: 1.1 }}>
              Tutto ciò di cui hai<br /><em style={{ fontStyle: 'italic', color: 'var(--gold2)' }}>davvero bisogno</em>
            </h2>
          </div>
          <div className="features-grid">
            {[
              { icon: '◈', title: 'Landing page cinematografiche', desc: 'Tre temi esclusivi — Dark, Ivory, Neon — progettati per far risaltare la tua musica. Personalizza colori, contenuti e struttura. La tua pagina, la tua identità.' },
              { icon: '▶', title: 'Player audio professionale', desc: 'Waveform interattivo, visualizzazione in tempo reale, gestione della riproduzione fluida. La tua musica suona come merita, ovunque venga ascoltata.' },
              { icon: '◎', title: 'Analytics dettagliate', desc: 'Scopri chi ascolta le tue composizioni, per quanto tempo, da dove nel mondo. Traccia ogni invio con link personalizzati e monitora i risultati.' },
              { icon: '◻', title: 'Embed ovunque', desc: 'Incorpora il tuo portfolio su qualsiasi sito — Systeme.io, WordPress, Wix. Un codice, infinite possibilità.' },
              { icon: '◆', title: 'Gestione multi-progetto', desc: 'Crea portfolio tematici diversi — uno per il cinema, uno per il teatro, uno per i brand. Ogni progetto ha la sua identità, tutte sotto un unico tetto.' },
              { icon: '⌘', title: 'Link tracciabili', desc: 'Quando invii il portfolio a un regista o produttore, saprai esattamente se lo ha aperto, cosa ha ascoltato e per quanto tempo. Nessuna incertezza.' },
            ].map((f, i) => (
              <div key={i} className="feature-card reveal" style={{ transitionDelay: `${i * .08}s` }}>
                <div className="feature-icon" style={{ fontSize: 18, color: 'var(--gold1)' }}>{f.icon}</div>
                <div className="feature-title">{f.title}</div>
                <div className="feature-desc">{f.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── MOCKUP DASHBOARD ── */}
      <section className="section showcase" style={{ paddingTop: 0 }}>
        <div className="container">
          <div className="showcase-mockup reveal">
            <div className="mockup-bar">
              <div className="mockup-dot" style={{ background: '#ff5f56' }} />
              <div className="mockup-dot" style={{ background: '#ffbd2e' }} />
              <div className="mockup-dot" style={{ background: '#27c93f' }} />
              <div className="mockup-url">scoreforge.app/andrea-pagliara · Orchestra per il Cinema</div>
            </div>
            <div className="mockup-content">
              <div>
                <div className="mockup-stat">
                  <div className="mockup-stat-num">2.4k</div>
                  <div className="mockup-stat-label">Ascolti questo mese</div>
                </div>
                <div className="mockup-stat" style={{ marginTop: 12 }}>
                  <div className="mockup-stat-num">87%</div>
                  <div className="mockup-stat-label">Tasso di completamento</div>
                </div>
              </div>
              <div>
                <div style={{ fontSize: 11, fontFamily: 'var(--mono)', color: 'var(--faint)', letterSpacing: '.1em', textTransform: 'uppercase', marginBottom: 12 }}>Tracce più ascoltate</div>
                {['Main Theme · Orchestral', 'Requiem per voce e archi', 'Suite per pianoforte'].map((t, i) => (
                  <div key={i} className="mockup-track">
                    <div className="play-btn">▶</div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 12, color: 'var(--cream)', marginBottom: 4 }}>{t}</div>
                      <div className="waveform">
                        {Array.from({ length: 40 }, (_, j) => (
                          <div key={j} className="waveform-bar" style={{
                            height: `${6 + Math.abs(Math.sin(j * 0.7 + i)) * 18}px`,
                            opacity: j < 16 ? 1 : 0.3,
                          }} />
                        ))}
                      </div>
                    </div>
                    <div style={{ fontSize: 10, fontFamily: 'var(--mono)', color: 'var(--faint)' }}>3:4{i + 2}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── PRICING ── */}
      <section className="section" id="piani">
        <div className="container">
          <div className="reveal" style={{ textAlign: 'center', marginBottom: 8 }}>
            <div className="tag">Piani e prezzi</div>
            <h2 style={{ fontFamily: 'var(--serif)', fontSize: 'clamp(32px,5vw,54px)', fontWeight: 300, marginTop: 12, lineHeight: 1.1 }}>
              Inizia gratis.<br />
              <em style={{ fontStyle: 'italic', color: 'var(--gold2)' }}>Cresci senza limiti.</em>
            </h2>
            <p style={{ color: 'var(--muted)', marginTop: 16, fontSize: 15 }}>Nessun contratto. Cambia piano quando vuoi.</p>
          </div>
          <div className="plans-grid">
            {plans.filter(p => p.name !== 'enterprise').map((p, i) => {
              const isFeatured = p.name === 'pro'
              const storageLabel = p.max_storage_mb >= 1024
                ? `${Math.round(p.max_storage_mb / 1024)} GB`
                : `${p.max_storage_mb} MB`
              const features = Array.isArray(p.features) ? p.features : []
              return (
                <div key={p.name} className={`plan-card reveal${isFeatured ? ' featured' : ''}`} style={{ transitionDelay: `${i * .1}s` }}>
                  {isFeatured && <div className="featured-badge">Più scelto</div>}
                  <div className="plan-name">{p.label}</div>
                  <div style={{ fontSize: 13, color: 'var(--faint)', marginBottom: 8 }}>
                    {p.max_portfolios === 999 ? 'Illimitati' : p.max_portfolios} portfolio · {p.max_tracks === 9999 ? 'Illimitate' : p.max_tracks} tracce
                  </div>
                  <div className="plan-price">
                    {p.price_eur === 0 ? (
                      <span style={{ fontSize: 40 }}>Gratis</span>
                    ) : (
                      <><sup>€</sup>{p.price_eur}<span>/mese</span></>
                    )}
                  </div>
                  {p.price_eur_annual > 0 && (
                    <div className="plan-annual">€{p.price_eur_annual}/anno — risparmia il {Math.round((1 - p.price_eur_annual / (p.price_eur * 12)) * 100)}%</div>
                  )}
                  {p.price_eur === 0 && <div className="plan-annual">Per sempre gratuito</div>}
                  <div className="plan-divider" />
                  <ul className="plan-features">
                    <li>{storageLabel} di storage</li>
                    {features.slice(0, 5).map((f: string, fi: number) => (
                      <li key={fi}>{f}</li>
                    ))}
                  </ul>
                  <a href={`${appUrl}/login`} className={`plan-cta ${isFeatured ? 'gold' : 'outline'}`}>
                    {p.price_eur === 0 ? 'Inizia gratis' : 'Scegli questo piano'}
                  </a>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* ── STORIA ── */}
      <section className="section" id="storia" style={{ background: 'var(--black2)', borderTop: '1px solid var(--border)' }}>
        <div className="container">
          <div className="story-grid">
            <div className="story-visual reveal">
              <div className="story-card">
                <svg width="100%" height="60" viewBox="0 0 300 60">
                  <path d="M0,20 L40,20 C55,20 60,10 70,7 C80,4 85,12 95,20 C105,28 110,20 125,20 L145,20" fill="none" stroke="#c8a45a" strokeWidth="1" opacity="0.5"/>
                  <path d="M0,30 L38,30 C53,30 58,18 70,12 C82,6 87,20 97,30 C107,40 113,30 125,30 L145,30" fill="none" stroke="#e2c47e" strokeWidth="2.2"/>
                  <path d="M0,40 L40,40 C55,40 60,50 70,53 C80,56 85,48 95,40 C105,32 110,40 125,40 L145,40" fill="none" stroke="#c8a45a" strokeWidth="1" opacity="0.5"/>
                  <circle cx="70" cy="12" r="4" fill="#f5e4b8" opacity="0.9"/>
                </svg>
                <div className="story-names">Angelo & Andrea</div>
                <div style={{ display: 'flex', gap: 8, marginTop: 6 }}>
                  <span className="story-role">Fondatori · ScoreForge</span>
                </div>
                <div style={{ height: 1, background: 'var(--border)', margin: '18px 0' }} />
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                  {[{ n: '1', l: 'Artista fondatore' }, { n: '∞', l: 'Portfolio possibili' }, { n: '3', l: 'Temi esclusivi' }, { n: '24/7', l: 'Analytics in tempo reale' }].map(s => (
                    <div key={s.l}>
                      <div style={{ fontFamily: 'var(--serif)', fontSize: 28, fontWeight: 300, color: 'var(--gold2)', lineHeight: 1 }}>{s.n}</div>
                      <div style={{ fontSize: 10, color: 'var(--faint)', fontFamily: 'var(--mono)', marginTop: 3 }}>{s.l}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <div className="reveal">
              <div className="tag">La nostra storia</div>
              <p className="story-text" style={{ marginTop: 20 }}>
                ScoreForge nasce da una domanda semplice: <strong>perché i compositori professionisti non hanno uno strumento che sia all'altezza del loro lavoro?</strong>
              </p>
              <p className="story-text" style={{ marginTop: 24, fontSize: 'clamp(16px,2vw,22px)' }}>
                Andrea Pagliara, compositore laureato con lode in Musica Applicata, ha vissuto in prima persona la frustrazione di dover presentare il proprio portfolio con strumenti generici, pensati per altri.
              </p>
              <p className="story-text" style={{ marginTop: 24, fontSize: 'clamp(16px,2vw,22px)' }}>
                Insieme a suo padre Angelo, hanno deciso di costruire <strong>la piattaforma che avrebbero voluto usare</strong> — e di renderla disponibile a tutti gli artisti che condividono la stessa esigenza.
              </p>
              <div style={{ marginTop: 36, display: 'flex', gap: 16, flexWrap: 'wrap' }}>
                <a href={`${appUrl}/login`} className="btn-primary">Prova ScoreForge gratis</a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── CTA FINALE ── */}
      <section className="section final-cta">
        <div className="container reveal" style={{ textAlign: 'center' }}>
          <div className="tag">Inizia oggi</div>
          <h2 className="final-heading">
            Il tuo prossimo<br />
            collaboratore ti sta<br />
            <em>cercando online.</em>
          </h2>
          <p style={{ color: 'var(--muted)', fontSize: 16, maxWidth: 480, margin: '0 auto 36px', lineHeight: 1.8 }}>
            Ogni giorno registi, produttori e supervisori musicali cercano compositori. Assicurati che quando trovano il tuo nome, trovino anche il tuo meglio.
          </p>
          <a href={`${appUrl}/login`} className="btn-primary" style={{ fontSize: 16, padding: '16px 44px' }}>
            Crea il tuo portfolio gratis
          </a>
          <p style={{ color: 'var(--faint)', fontSize: 12, marginTop: 16, fontFamily: 'var(--mono)' }}>
            Nessuna carta di credito · Attivo in 5 minuti
          </p>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer>
        <div className="footer-inner">
          <div>
            <svg width="90" height="20" viewBox="0 0 90 20">
              <path d="M13,1.5 Q18,1 18,5.5 Q18,10 13,10" fill="none" stroke="#e2c47e" strokeWidth="1.8" strokeLinecap="round"/>
              <path d="M8,10 Q3,10 3,14 Q3,18 8,17.5" fill="none" stroke="#c8a45a" strokeWidth="1.8" strokeLinecap="round"/>
              <line x1="8" y1="10" x2="13" y2="10" stroke="#e2c47e" strokeWidth="1.8" strokeLinecap="round"/>
              <text x="24" y="8" fontFamily="'Cormorant Garamond',serif" fontSize="10" fontWeight="300" fill="#f0ebe0" letterSpacing="1.2">SCORE</text>
              <line x1="24" y1="10.5" x2="80" y2="10.5" stroke="#2a2830" strokeWidth="0.4"/>
              <text x="24" y="18" fontFamily="'Outfit',sans-serif" fontSize="6" fontWeight="500" fill="#c8a45a" letterSpacing="3.5">FORGE</text>
            </svg>
            <div style={{ fontSize: 10, color: 'var(--faint)', fontFamily: 'var(--mono)', marginTop: 8 }}>
              © {new Date().getFullYear()} ScoreForge · Artist Portfolio Platform
            </div>
          </div>
          <div className="footer-links">
            <a href="/legal/privacy">Privacy Policy</a>
            <a href="/legal/cookie">Cookie Policy</a>
            <a href="/legal/termini">Termini di Servizio</a>
            <a href={`${appUrl}/login`}>Accedi</a>
          </div>
        </div>
      </footer>

      {/* Scroll reveal: handled via CSS animation */}
    </>
  )
}
