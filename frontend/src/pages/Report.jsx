function formatDate(value) {
  const date = value ? new Date(value) : new Date()
  return Number.isNaN(date.getTime()) ? 'Unavailable' : date.toLocaleString()
}

function display(value, fallback = 'Unavailable') {
  return value === undefined || value === null || value === '' ? fallback : value
}

function addressLabel(address) {
  if (!address) return 'Unavailable'
  if (address.length <= 18) return address
  return `${address.slice(0, 10)}...${address.slice(-8)}`
}

function Report({ result, onBack }) {
  const request = result?.request || {}
  const attribution = result?.attribution || {}
  const trace = result?.trace || {}
  const graph = result?.graph || { nodes: [], edges: [] }
  const evidence = result?.evidence || []
  const riskFlags = result?.risk_flags || []
  const path = result?.path?.length ? result.path : graph.nodes.filter((node) => node?.type === 'target' || node?.type === 'vasp').map((node) => node.id)
  const status = result?.source === 'mock-fallback' ? 'DEMO FALLBACK' : 'COMPLETED'

  return (
    <div className="report-page">
      <div className="report-toolbar print-exclude">
        <button className="report-back-button" type="button" onClick={onBack}>← Back to workspace</button>
        <button className="print-button" type="button" onClick={() => window.print()}>Print Report</button>
      </div>

      <article className="investigation-report">
        <header className="report-header">
          <div>
            <p className="report-kicker">CryptoTrace / Investigation Summary</p>
            <h1>Wallet Trace Report</h1>
            <p className="report-id">Report generated {formatDate(result?.generated_at)}{result?.case_id ? ` · ${result.case_id}` : ''}</p>
          </div>
          <span className="report-status">{status}</span>
        </header>

        <section className="report-section report-overview">
          <h2>Investigation overview</h2>
          <div className="report-detail-grid">
            <ReportDetail label="Wallet address" value={addressLabel(request.wallet_address)} fullValue={request.wallet_address} />
            <ReportDetail label="Blockchain" value={display(request.chain, 'Ethereum')} />
            <ReportDetail label="Max hops" value={display(request.max_hops)} />
            <ReportDetail label="Hops analyzed" value={display(trace.hops, '0')} />
            <ReportDetail label="Trace status" value={status} />
            <ReportDetail label="Trace mode" value={display(request.mode)} />
          </div>
        </section>

        <section className="report-section report-attribution">
          <div className="report-section-heading"><h2>Attribution</h2><span>{display(attribution.confidence, 0)}% confidence</span></div>
          <div className="report-attribution-grid">
            <ReportDetail label="Detected / nearest VASP" value={display(attribution.vasp_name)} />
            <ReportDetail label="VASP type" value={display(attribution.vasp_type)} />
            <ReportDetail label="Confidence" value={`${display(attribution.confidence, 0)}%`} />
            <ReportDetail label="Path found" value={trace.path_found ? 'Yes' : 'No'} />
          </div>
          <div className="report-path">
            <h3>Trace path</h3>
            <p>{path.length ? path.map((item) => addressLabel(item)).join('  →  ') : 'No path available.'}</p>
          </div>
        </section>

        <section className="report-section">
          <h2>Trace metrics</h2>
          <div className="report-metrics">
            <ReportMetric label="Transactions analyzed" value={display(trace.transactions_analyzed, graph.edges.length)} />
            <ReportMetric label="Nodes analyzed" value={graph.nodes.length} />
            <ReportMetric label="Edges analyzed" value={graph.edges.length} />
          </div>
        </section>

        <section className="report-section">
          <h2>Evidence</h2>
          {evidence.length ? (
            <ul className="report-list">{evidence.map((item, index) => <li key={`${item.type || 'evidence'}-${index}`}><strong>{item.type || 'Trace signal'}:</strong> {item.description || item}</li>)}</ul>
          ) : <p className="report-muted">No evidence was returned for this trace.</p>}
        </section>

        <section className="report-section">
          <h2>Risk information</h2>
          {riskFlags.length ? <ul className="report-list report-risk-list">{riskFlags.map((flag) => <li key={flag}>{flag}</li>)}</ul> : <p className="report-clear">No risk flags returned.</p>}
        </section>

        <footer className="report-footer">CryptoTrace · Explainable wallet intelligence · Generated {formatDate(result?.generated_at)}</footer>
      </article>
    </div>
  )
}

function ReportDetail({ label, value, fullValue }) {
  return <div className="report-detail"><span>{label}</span><strong title={fullValue}>{value}</strong></div>
}

function ReportMetric({ label, value }) {
  return <div className="report-metric"><strong>{value}</strong><span>{label}</span></div>
}

export default Report