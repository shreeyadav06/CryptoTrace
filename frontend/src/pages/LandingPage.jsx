function LandingPage({ onStartInvestigation }) {
  const featureCards = [
    { title: 'Wallet Tracing', copy: 'Map suspicious wallet behavior across known transaction neighborhoods.' },
    { title: 'VASP Attribution', copy: 'Identify likely Virtual Asset Service Providers behind a wallet trail.' },
    { title: 'Transaction Graph Analysis', copy: 'Inspect connected addresses and directional transaction flow.' },
    { title: 'Risk & Compliance Insights', copy: 'Surface risk indicators and generate a forensic investigation summary.' },
  ]

  return (
    <main className="landing-page">
      <nav className="landing-nav">
        <a className="landing-brand" href="/" aria-label="CryptoTrace home">
          <span className="landing-brand-mark">CT</span>
          <span className="landing-brand-text">CryptoTrace</span>
        </a>
        <a className="landing-nav-link" href="/dashboard">Investigation</a>
      </nav>

      <section className="landing-hero">
        <div className="landing-copy">
          <div className="landing-kicker">CRYPTOGRAPHIC INTELLIGENCE</div>
          <h1>Trace the Crypto. Reveal the Source.</h1>
          <p className="landing-summary">
            CryptoTrace helps investigators examine unknown cryptocurrency wallets and identify
            nearby Virtual Asset Service Providers (VASPs) through explainable transaction tracing.
          </p>
          <div className="landing-cta-row">
            <button className="landing-cta" type="button" onClick={onStartInvestigation}>
              Start Investigation
            </button>
          </div>
          <div className="landing-proof">
            <span><span className="proof-number">360°</span> Wallet Trace</span>
            <span><span className="proof-number">03</span> Hop View</span>
            <span><span className="proof-number">24/7</span> Signal Mapping</span>
          </div>
        </div>

        <section className="landing-visual" aria-label="CryptoTrace blockchain overview">
          <div className="network-frame">
            <div className="network-top">
              <span className="network-label">TRACE NETWORK</span>
              <span className="network-status"><span /> LIVE</span>
            </div>

            <div className="network-map">
              <span className="map-node map-node-target">Target</span>
              <span className="map-node map-node-hop">Hop 1</span>
              <span className="map-node map-node-hop2">Hop 2</span>
              <span className="map-node map-node-vasp">VASP</span>
              <span className="map-line line-one" />
              <span className="map-line line-two" />
              <span className="map-line line-three" />
              <span className="network-scan" />
            </div>

            <div className="network-grid">
              <div>
                <span className="grid-label">Status</span>
                <span className="grid-value">Consistent</span>
              </div>
              <div>
                <span className="grid-label">Confidence</span>
                <span className="grid-value">87%</span>
              </div>
              <div>
                <span className="grid-label">Risk</span>
                <span className="grid-value risk-text">Low</span>
              </div>
            </div>
          </div>
        </section>
      </section>

      <section className="landing-feature-section">
        <div className="section-heading">
          <span className="section-kicker">INVESTIGATION PLATFORM</span>
          <h2>Operational Intelligence</h2>
        </div>

        <div className="feature-grid">
          {featureCards.map((feature, index) => (
            <article className="feature-card" key={feature.title}>
              <span className="feature-number">0{index + 1}</span>
              <h3>{feature.title}</h3>
              <p>{feature.copy}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="landing-how">
        <div className="section-heading">
          <span className="section-kicker">TRACE FLOW</span>
          <h2>How it works</h2>
        </div>
        <div className="flow-row">
          <span className="flow-step">Wallet</span>
          <span className="flow-arrow">→</span>
          <span className="flow-step">Transaction Graph</span>
          <span className="flow-arrow">→</span>
          <span className="flow-step">VASP Attribution</span>
          <span className="flow-arrow">→</span>
          <span className="flow-step">Investigation Report</span>
        </div>
      </section>

      <footer className="landing-footer">
        <span className="footer-brand">CryptoTrace</span>
        <span className="footer-sep">·</span>
        <span className="footer-copy">Explainable Blockchain Intelligence</span>
      </footer>
    </main>
  )
}

export default LandingPage
