import { useState } from 'react'
import WalletInput from '../components/WalletInput'
<<<<<<< Updated upstream
=======
import AttributionCard from '../components/AttributionCard'
import EvidencePanel from '../components/EvidencePanel'
import LoadingState from '../components/LoadingState'
>>>>>>> Stashed changes
import { mockTraceResponse } from '../data/mockData'
import TransactionGraph from '../graph/TransactionGraph'
import { traceWallet } from '../services/api'
import Report from './Report'

function normalizeGraphData(result) {
  const graph = result?.graph
  if (graph?.nodes && graph?.edges) return graph
  if (result?.nodes && result?.edges) return { nodes: result.nodes, edges: result.edges }
  if (graph?.overview?.nodes && graph?.overview?.edges) return graph.overview
  return { nodes: [], edges: [] }
}

function normalizeTraceResponse(response, request) {
  const nodes = Array.isArray(response?.nodes) ? response.nodes : []
  const edges = Array.isArray(response?.edges) ? response.edges : []
  const evidence = Array.isArray(response?.evidence)
    ? response.evidence.map((item, index) => (
      typeof item === 'string'
        ? { type: `Trace signal ${index + 1}`, description: item }
        : item
    ))
    : []

  return {
    success: true,
    attribution: {
      vasp_name: response?.selected_vasp || 'No Confident Attribution',
      vasp_type: response?.selected_vasp === 'No Confident Attribution'
        ? 'Insufficient evidence'
        : 'Detected VASP',
      confidence: Number(response?.confidence) || 0,
    },
    trace: {
      hops: Number(response?.hop_distance) || 0,
      transactions_analyzed: Number(response?.transactions_analyzed) || edges.length,
      path_found: Boolean(response?.path?.length || nodes.length),
    },
    evidence,
    graph: { nodes, edges },
    request,
    source: 'api',
    case_id: response?.case_id,
    risk_flags: response?.risk_flags || [],
    path: Array.isArray(response?.path) ? response.path : [],
    generated_at: response?.generated_at,
  }
}

function Dashboard() {
  const [traceResult, setTraceResult] = useState(null)
  const [traceError, setTraceError] = useState('')
  const [isTracing, setIsTracing] = useState(false)
  const [isReportOpen, setIsReportOpen] = useState(false)

  async function handleTrace(request) {
    setTraceError('')
    setIsTracing(true)

    try {
      const response = await traceWallet(request)
      setTraceResult(normalizeTraceResponse(response, request))
    } catch (error) {
      setTraceError(`Trace request failed: ${error.message}`)
      if (!traceResult) setTraceResult({ ...mockTraceResponse, request, source: 'mock-fallback' })
    } finally {
      setIsTracing(false)
    }
  }

<<<<<<< Updated upstream
=======
  function togglePreview() {
    setTraceError('')
    if (traceResult) {
      setTraceResult(null)
    } else {
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

  if (isReportOpen && traceResult) {
    return <Report result={traceResult} onBack={() => setIsReportOpen(false)} />
  }

>>>>>>> Stashed changes
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
        <WalletInput onTrace={handleTrace} isLoading={isTracing} />

        <section className="result-panel" aria-live="polite">
          <div className="panel-heading">
            <div>
              <p className="eyebrow">Attribution output</p>
              <h2>Trace result</h2>
            </div>
            {traceResult && <span className="success-pill">{traceResult.source === 'api' ? 'Complete' : 'Demo fallback'}</span>}
          </div>

          {traceError && (
            <div className="error-toast" role="alert">
              <span>{traceError}</span>
              <button type="button" aria-label="Dismiss error" onClick={() => setTraceError('')}>×</button>
            </div>
          )}

          {isTracing ? (
            <LoadingState message="Tracing wallet..." />
          ) : !traceResult ? (
            <div className="empty-state">
              <div className="empty-icon">+</div>
              <h3>No trace results yet</h3>
              <p>Enter a wallet address and click Trace to inspect its nearest VASP.</p>
            </div>
          ) : (
            <TraceResult result={traceResult} onOpenReport={() => setIsReportOpen(true)} />
          )}
        </section>
      </section>
    </div>
  )
}

<<<<<<< Updated upstream
function TraceResult({ result }) {
=======
/* -- Empty State ------------------------------------------ */
function EmptyState() {
  return (
    <div className="empty-state">
      <RadarGraphic />
      <h3>No trace results yet</h3>
      <p>Enter a wallet address and click Trace to inspect its nearest VASP.</p>
    </div>
  )
}

/* -- Trace Result ----------------------------------------- */
function TraceResult({ result, onOpenReport }) {
>>>>>>> Stashed changes
  const { request, attribution, trace, evidence } = result
  const graphData = normalizeGraphData(result)

  return (
    <div className="result-content">
<<<<<<< Updated upstream
      <div className="attribution-hero">
        <div>
          <span className="result-label">Nearest VASP</span>
          <h3>{attribution.vasp_name}</h3>
          <p>{attribution.vasp_type}</p>
=======
      <AttributionCard request={request} attribution={attribution} trace={trace} />

      <div className="result-actions print-exclude">
        <button className="report-link-button" type="button" onClick={onOpenReport}>View investigation report →</button>
      </div>
      
      <div className="metrics-grid" style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "1rem", marginBottom: "1.5rem" }}>
        <div className="metric-card" style={{ background: "rgba(15,23,42,0.5)", padding: "1rem", borderRadius: "8px", border: "1px solid rgba(30,41,59,0.8)" }}>
          <span className="metric-label" style={{ display: "block", color: "#94a3b8", fontSize: "0.65rem", textTransform: "uppercase", marginBottom: "0.5rem" }}>Path Distance</span>
          <span className="metric-value" style={{ fontSize: "1.1rem", fontWeight: "600", color: "#fff" }}>{trace.hops} Hops</span>
>>>>>>> Stashed changes
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
        <div><strong>{graphData.nodes.length}</strong><span>graph nodes</span></div>
      </div>

      <div className="evidence-section">
        <div className="section-title"><h3>Evidence</h3><span>{evidence.length} signals</span></div>
        <ul className="evidence-list">
          {evidence.map((item) => (
            <li key={item.type}>
              <span className="evidence-marker" />
              <div><strong>{item.type}</strong><p>{item.description}</p></div>
            </li>
          ))}
        </ul>
      </div>

      <div className="graph-section">
        <div className="section-title"><h3>Transaction graph</h3><span>{graphData.edges.length} directed edges</span></div>
        <TransactionGraph data={graphData} />
      </div>

      <details className="json-viewer" open>
        <summary>{result.source === 'api' ? 'View API JSON response' : 'View mock JSON response'} <span aria-hidden="true">+</span></summary>
        <pre>{JSON.stringify(result, null, 2)}</pre>
      </details>
    </div>
  )
}

export default Dashboard