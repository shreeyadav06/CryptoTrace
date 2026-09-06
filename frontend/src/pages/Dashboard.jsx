import { useState } from 'react'
import WalletInput from '../components/WalletInput'
import AttributionCard from '../components/AttributionCard'
import EvidencePanel from '../components/EvidencePanel'
import { mockTraceResponse } from '../data/mockData'
import TransactionGraph from '../graph/TransactionGraph'
import { traceWallet } from '../services/api'

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
  }
}

/* -- Radar SVG (empty state graphic) --------------------- */
function RadarGraphic() {
  return (
    <svg className="empty-radar" viewBox="0 0 128 128" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="64" cy="64" r="58" stroke="#4f46e5" strokeOpacity="0.2" strokeWidth="1" strokeDasharray="3 3" />
      <circle cx="64" cy="64" r="42" stroke="#4f46e5" strokeOpacity="0.35" strokeWidth="1" />
      <circle cx="64" cy="64" r="26" stroke="#818cf8" strokeOpacity="0.4" strokeWidth="1" strokeDasharray="2 2" />
      <line x1="64" y1="10" x2="64" y2="118" stroke="#4f46e5" strokeOpacity="0.15" strokeWidth="1" strokeDasharray="2 4" />
      <line x1="10" y1="64" x2="118" y2="64" stroke="#4f46e5" strokeOpacity="0.15" strokeWidth="1" strokeDasharray="2 4" />
      <path d="M64 64L96 38" stroke="#818cf8" strokeOpacity="0.4" strokeWidth="1" strokeDasharray="2 3" />
      <path d="M64 64L34 88" stroke="#22d3ee" strokeOpacity="0.3" strokeWidth="1" strokeDasharray="2 3" />
      <path d="M64 64L98 84" stroke="#4f46e5" strokeOpacity="0.25" strokeWidth="1" strokeDasharray="2 3" />
      <circle cx="96" cy="38" r="3.5" fill="#1e293b" stroke="#818cf8" strokeOpacity="0.8" strokeWidth="1.5" />
      <circle cx="34" cy="88" r="3" fill="#1e293b" stroke="#22d3ee" strokeOpacity="0.6" strokeWidth="1.5" />
      <circle cx="98" cy="84" r="2.5" fill="#1e293b" stroke="#64748b" strokeOpacity="0.6" strokeWidth="1" />
      <circle cx="64" cy="64" r="16" fill="#1e1b4b" fillOpacity="0.6" stroke="#4f46e5" strokeOpacity="0.5" strokeWidth="1.5" />
      <circle cx="64" cy="64" r="7" fill="#4f46e5" fillOpacity="0.3" />
      <circle cx="64" cy="64" r="3" fill="#818cf8" />
    </svg>
  )
}

/* -- Dashboard ------------------------------------------- */
function Dashboard() {
  const [traceResult, setTraceResult] = useState(null)
  const [traceError, setTraceError] = useState('')
  const [isTracing, setIsTracing] = useState(false)

  async function handleTrace(request) {
    setTraceError('')
    setIsTracing(true)

    try {
      const response = await traceWallet(request)
      setTraceResult(normalizeTraceResponse(response, request))
    } catch (error) {
      setTraceError(`Live trace unavailable: ${error.message} Showing demo data instead.`)
      setTraceResult({ ...mockTraceResponse, request, source: 'mock-fallback' })
    } finally {
      setIsTracing(false)
    }
  }

  function togglePreview() {
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

  return (
    <div className="dashboard">
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
                {traceResult.source === 'api' ? 'Complete' : 'Demo fallback'}
              </span>
            ) : (
              <button className="preview-btn" type="button" onClick={togglePreview}>
                ? Preview Result
              </button>
            )}
          </div>

          {traceError && <p className="trace-error" role="status">{traceError}</p>}

          {isTracing ? (
            <div className="empty-state"><h3>Tracing wallet...</h3><p>Waiting for the backend transaction graph.</p></div>
          ) : !traceResult ? (
            <EmptyState />
          ) : (
            <TraceResult result={traceResult} />
          )}

          <div className="panel-footer" style={{ padding: "1rem 2rem", borderTop: "1px solid rgba(30,41,59,0.5)", display: "flex", justifyContent: "space-between", color: "#94a3b8", fontSize: "0.72rem" }}>
            <span>Engine v2.4</span>
            <span className="panel-footer-right">?? Deterministic Graph Consensus</span>
          </div>
        </section>
      </section>
    </div>
  )
}

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
function TraceResult({ result }) {
  const { request, attribution, trace, evidence } = result
  const graphData = normalizeGraphData(result)

  return (
    <div className="result-content">
      <AttributionCard request={request} attribution={attribution} trace={trace} />
      
      <div className="metrics-grid" style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "1rem", marginBottom: "1.5rem" }}>
        <div className="metric-card" style={{ background: "rgba(15,23,42,0.5)", padding: "1rem", borderRadius: "8px", border: "1px solid rgba(30,41,59,0.8)" }}>
          <span className="metric-label" style={{ display: "block", color: "#94a3b8", fontSize: "0.65rem", textTransform: "uppercase", marginBottom: "0.5rem" }}>Path Distance</span>
          <span className="metric-value" style={{ fontSize: "1.1rem", fontWeight: "600", color: "#fff" }}>{trace.hops} Hops</span>
        </div>
        <div className="metric-card" style={{ background: "rgba(15,23,42,0.5)", padding: "1rem", borderRadius: "8px", border: "1px solid rgba(30,41,59,0.8)" }}>
          <span className="metric-label" style={{ display: "block", color: "#94a3b8", fontSize: "0.65rem", textTransform: "uppercase", marginBottom: "0.5rem" }}>Transactions</span>
          <span className="metric-value" style={{ fontSize: "1.1rem", fontWeight: "600", color: "#fff" }}>{trace.transactions_analyzed} Txns</span>
        </div>
        <div className="metric-card" style={{ background: "rgba(15,23,42,0.5)", padding: "1rem", borderRadius: "8px", border: "1px solid rgba(30,41,59,0.8)" }}>
          <span className="metric-label" style={{ display: "block", color: "#94a3b8", fontSize: "0.65rem", textTransform: "uppercase", marginBottom: "0.5rem" }}>Graph Nodes</span>
          <span className="metric-value" style={{ fontSize: "1.1rem", fontWeight: "600", color: "#fff" }}>{graphData.nodes.length} Nodes</span>
        </div>
      </div>

      <EvidencePanel evidence={evidence} />

      <div className="graph-section" style={{ marginTop: "2rem", borderTop: "1px solid rgba(30,41,59,0.5)", paddingTop: "1.5rem" }}>
        <div className="section-title"><h3>Transaction graph</h3><span style={{color: "#818cf8"}}>{graphData.edges.length} directed edges</span></div>
        <TransactionGraph data={graphData} />
      </div>
    </div>
  )
}

export default Dashboard
