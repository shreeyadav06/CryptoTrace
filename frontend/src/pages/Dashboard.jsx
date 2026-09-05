import { useState } from 'react'
import WalletInput from '../components/WalletInput'
import { mockTraceResponse } from '../data/mockData'

/* ── Radar SVG (empty state graphic) ───────────────────── */
function RadarGraphic() {
  return (
    <svg className="empty-radar" viewBox="0 0 128 128" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Concentric radar orbits */}
      <circle cx="64" cy="64" r="58" stroke="#4f46e5" strokeOpacity="0.2" strokeWidth="1" strokeDasharray="3 3" />
      <circle cx="64" cy="64" r="42" stroke="#4f46e5" strokeOpacity="0.35" strokeWidth="1" />
      <circle cx="64" cy="64" r="26" stroke="#818cf8" strokeOpacity="0.4" strokeWidth="1" strokeDasharray="2 2" />

      {/* Crosshair lines */}
      <line x1="64" y1="10" x2="64" y2="118" stroke="#4f46e5" strokeOpacity="0.15" strokeWidth="1" strokeDasharray="2 4" />
      <line x1="10" y1="64" x2="118" y2="64" stroke="#4f46e5" strokeOpacity="0.15" strokeWidth="1" strokeDasharray="2 4" />

      {/* Network connection vectors */}
      <path d="M64 64L96 38" stroke="#818cf8" strokeOpacity="0.4" strokeWidth="1" strokeDasharray="2 3" />
      <path d="M64 64L34 88" stroke="#22d3ee" strokeOpacity="0.3" strokeWidth="1" strokeDasharray="2 3" />
      <path d="M64 64L98 84" stroke="#4f46e5" strokeOpacity="0.25" strokeWidth="1" strokeDasharray="2 3" />

      {/* Peripheral nodes */}
      <circle cx="96" cy="38" r="3.5" fill="#1e293b" stroke="#818cf8" strokeOpacity="0.8" strokeWidth="1.5" />
      <circle cx="34" cy="88" r="3" fill="#1e293b" stroke="#22d3ee" strokeOpacity="0.6" strokeWidth="1.5" />
      <circle cx="98" cy="84" r="2.5" fill="#1e293b" stroke="#64748b" strokeOpacity="0.6" strokeWidth="1" />

      {/* Core pulse center */}
      <circle cx="64" cy="64" r="16" fill="#1e1b4b" fillOpacity="0.6" stroke="#4f46e5" strokeOpacity="0.5" strokeWidth="1.5" />
      <circle cx="64" cy="64" r="7" fill="#4f46e5" fillOpacity="0.3" />
      <circle cx="64" cy="64" r="3" fill="#818cf8" />
    </svg>
  )
}

/* ── Dashboard ─────────────────────────────────────────── */
function Dashboard() {
  const [traceResult, setTraceResult] = useState(null)
  const [previewing, setPreviewing] = useState(false)

  function handleTrace(request) {
    setTraceResult({ ...mockTraceResponse, request })
  }

  function togglePreview() {
    if (traceResult) {
      setTraceResult(null)
      setPreviewing(false)
    } else {
      setPreviewing(true)
      setTraceResult({
        ...mockTraceResponse,
        request: {
          wallet_address: '0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045',
          chain: 'Ethereum',
          max_hops: 3,
          mode: 'standard',
        },
      })
    }
  }

  return (
    <div className="dashboard">

      {/* Hero */}
      <section className="dashboard-intro">
        <div>
          <p className="eyebrow">
            <span>Wallet Intelligence</span>
            <span className="eyebrow-sep">/</span>
            <span className="eyebrow-sub">Workspace</span>
          </p>
          <h1>Find the nearest <br /><em>service behind</em> a wallet.</h1>
          <p className="intro-copy">
            Follow a wallet's transaction neighborhood and surface the VASP cluster with the strongest explainable connection.
          </p>
        </div>

        <div className="status-pill">
          <span className="status-ping">
            <span className="status-ping-wave" />
            <span className="status-ping-dot" />
          </span>
          <span className="status-pill-text">Local analysis ready</span>
        </div>
      </section>

      {/* Workspace */}
      <section className="workspace-grid">
        <WalletInput onTrace={handleTrace} />

        <section className="result-panel" aria-live="polite">
          <div className="panel-heading">
            <div>
              <span className="panel-heading-eyebrow">Attribution Output</span>
              <h2>Trace result</h2>
            </div>

            {traceResult ? (
              <span className="success-pill">
                <span className="success-pill-dot" />
                Complete
              </span>
            ) : (
              <button className="preview-btn" type="button" onClick={togglePreview}>
                ⇆ Preview Result
              </button>
            )}
          </div>

          {!traceResult ? <EmptyState /> : <TraceResult result={traceResult} onReset={togglePreview} />}

          <div className="panel-footer">
            <span>Engine v2.4</span>
            <span className="panel-footer-right">
              🛡 Deterministic Graph Consensus
            </span>
          </div>
        </section>
      </section>
    </div>
  )
}

/* ── Empty State ────────────────────────────────────────── */
function EmptyState() {
  return (
    <div className="empty-state">
      <RadarGraphic />
      <h3>No trace results yet</h3>
      <p>Enter a wallet address and click Trace to inspect its nearest VASP.</p>
    </div>
  )
}

/* ── Trace Result ───────────────────────────────────────── */
function TraceResult({ result }) {
  const { request, attribution, trace, graph } = result

  return (
    <div className="result-content">

      {/* Attribution card */}
      <div className="attribution-card">
        <div className="attribution-left">
          <div className="attribution-icon">🏢</div>
          <div>
            <h4 className="attribution-name">
              {attribution.vasp_name}
              <span className="vasp-badge">Verified VASP</span>
            </h4>
            <p className="attribution-cluster">
              Cluster: {request.wallet_address.slice(0, 7)}...{request.wallet_address.slice(-5)} (Hot Wallet)
            </p>
          </div>
        </div>
        <div className="attribution-right">
          <span className="attribution-score-label">Confidence Score</span>
          <span className="attribution-score">{attribution.confidence}%</span>
        </div>
      </div>

      {/* Metrics */}
      <div className="metrics-grid">
        <div className="metric-card">
          <span className="metric-label">Path Distance</span>
          <span className="metric-value">{trace.hops} Hops</span>
        </div>
        <div className="metric-card">
          <span className="metric-label">Transactions</span>
          <span className="metric-value">{trace.transactions_analyzed} Txns</span>
        </div>
        <div className="metric-card">
          <span className="metric-label">Graph Nodes</span>
          <span className="metric-value">{graph.nodes} Nodes</span>
        </div>
      </div>

      {/* Hop Sequence */}
      <div className="hop-sequence">
        <span className="hop-sequence-label">Attribution Hop Sequence</span>

        <div className="hop-step">
          <div style={{ display: 'flex', alignItems: 'center', gap: '.5rem', minWidth: 0 }}>
            <span className="hop-badge">0</span>
            <span className="hop-addr">{request.wallet_address.slice(0, 20)}... (Origin)</span>
          </div>
          <span className="hop-meta">Direct</span>
        </div>

        <div className="hop-arrow">↓</div>

        <div className="hop-step">
          <div style={{ display: 'flex', alignItems: 'center', gap: '.5rem', minWidth: 0 }}>
            <span className="hop-badge">1</span>
            <span className="hop-addr">0x3f5CE5FBFe3E9af3971dD833D26bA9b5C936f0bE (Intermediary)</span>
          </div>
          <span className="hop-meta eth">8.2 ETH</span>
        </div>

        <div className="hop-arrow">↓</div>

        <div className="hop-step target">
          <div style={{ display: 'flex', alignItems: 'center', gap: '.5rem', minWidth: 0 }}>
            <span className="hop-badge">2</span>
            <span className="hop-addr" style={{ fontWeight: 600, color: '#fff' }}>{attribution.vasp_name}: Hot Wallet (Target VASP)</span>
          </div>
          <span className="hop-meta vasp">Identified</span>
        </div>
      </div>

    </div>
  )
}

export default Dashboard