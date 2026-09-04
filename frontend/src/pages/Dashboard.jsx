import { useState } from 'react'
import WalletInput from '../components/WalletInput'
import { mockTraceResponse } from '../data/mockData'

function Dashboard() {
  const [traceResult, setTraceResult] = useState(null)

  function handleTrace(request) {
    const response = {
      ...mockTraceResponse,
      request,
    }

    setTraceResult(response)
    console.log('[CryptoTrace] Mock trace response:', response)
  }

  return (
    <div className="dashboard">
      <section className="dashboard-intro">
        <div>
          <p className="eyebrow">Wallet intelligence / workspace</p>
          <h1>Find the nearest<br /><em>service behind</em> a wallet.</h1>
          <p className="intro-copy">
            Follow a wallet&apos;s transaction neighborhood and surface the VASP cluster
            with the strongest explainable connection.
          </p>
        </div>
        <div className="status-line">
          <span className="status-dot" />
          <span>Local analysis ready</span>
        </div>
      </section>

      <section className="workspace-grid">
        <WalletInput onTrace={handleTrace} />

        <section className="result-panel" aria-live="polite">
          <div className="panel-heading">
            <div>
              <p className="eyebrow">Attribution output</p>
              <h2>Trace result</h2>
            </div>
            {traceResult && <span className="success-pill">Complete</span>}
          </div>

          {!traceResult ? (
            <div className="empty-state">
              <div className="empty-icon">+</div>
              <h3>No trace results yet</h3>
              <p>Enter a wallet address and click Trace to inspect its nearest VASP.</p>
            </div>
          ) : (
            <TraceResult result={traceResult} />
          )}
        </section>
      </section>
    </div>
  )
}

function TraceResult({ result }) {
  const { request, attribution, trace, evidence, graph } = result

  return (
    <div className="result-content">
      <div className="attribution-hero">
        <div>
          <span className="result-label">Nearest VASP</span>
          <h3>{attribution.vasp_name}</h3>
          <p>{attribution.vasp_type}</p>
        </div>
        <div className="confidence-score">
          <strong>{attribution.confidence}%</strong>
          <span>confidence</span>
        </div>
      </div>

      <dl className="request-summary">
        <div><dt>Wallet</dt><dd title={request.wallet_address}>{request.wallet_address}</dd></div>
        <div><dt>Chain</dt><dd>{request.chain}</dd></div>
        <div><dt>Max hops</dt><dd>{request.max_hops}</dd></div>
        <div><dt>Mode</dt><dd>{request.mode === 'deep' ? 'Deep Trace' : 'Standard'}</dd></div>
      </dl>

      <div className="metrics-row">
        <div><strong>{trace.hops}</strong><span>hops found</span></div>
        <div><strong>{trace.transactions_analyzed}</strong><span>transactions analyzed</span></div>
        <div><strong>{graph.nodes}</strong><span>graph nodes</span></div>
      </div>

      <div className="evidence-section">
        <div className="section-title"><h3>Evidence</h3><span>3 signals</span></div>
        <ul className="evidence-list">
          {evidence.map((item) => (
            <li key={item.type}>
              <span className="evidence-marker" />
              <div><strong>{item.type}</strong><p>{item.description}</p></div>
            </li>
          ))}
        </ul>
      </div>

      <details className="json-viewer" open>
        <summary>View mock JSON response <span aria-hidden="true">+</span></summary>
        <pre>{JSON.stringify(result, null, 2)}</pre>
      </details>
    </div>
  )
}

export default Dashboard