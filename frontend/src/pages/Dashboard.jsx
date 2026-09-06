import { useState } from 'react'
import WalletInput from '../components/WalletInput'
import AttributionCard from '../components/AttributionCard'
import EvidencePanel from '../components/EvidencePanel'
import RiskPanel from '../components/RiskPanel'
import LoadingState from '../components/LoadingState'
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

  function togglePreview() {
    setTraceError('')
    if (traceResult) {
      setTraceResult(null)
      setPreviewing(false)
    } else {
      setPreviewing(true)
      setTraceResult({
        ...mockTraceResponse,
        request: {
          wallet_address: '0xc3bfbab68c680a962fb9c3193b6fd2736b7db275',
          chain: 'Ethereum',
          max_hops: 3,
          mode: 'demo',
        },
      })
    }
  }

  if (isReportOpen && traceResult) {
    return <Report result={traceResult} onBack={() => setIsReportOpen(false)} />
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
        <WalletInput onTrace={handleTrace} isLoading={isTracing} />

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
                ⇆ Preview Result
              </button>
            )}
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
            <EmptyState />
          ) : (
            <>
              <TraceResult result={traceResult} onOpenReport={() => setIsReportOpen(true)} />
              <div className="panel-footer">
                <span>Engine v2.4</span>
                <span className="panel-footer-right">
                  🛡 Deterministic Graph Consensus
                </span>
              </div>
            </>
          )}
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
function TraceResult({ result, onOpenReport }) {
  const { request, attribution, trace, graph, evidence, risk_flags, case_id } = result
  
  // Normalize graphData for F1's TransactionGraph
  const graphData = normalizeGraphData(result)

  // Resolve node/edge arrays — API puts them at top level, mock may nest inside graph
  const nodeList = Array.isArray(result.nodes) ? result.nodes
    : (Array.isArray(graph?.nodes) ? graph.nodes : [])
  const edgeList = Array.isArray(result.edges) ? result.edges
    : (Array.isArray(graph?.edges) ? graph.edges : [])

  // Sort nodes by hop for the hop sequence display
  const sortedNodes = [...nodeList].sort((a, b) => (a.hop ?? 0) - (b.hop ?? 0))

  // Find the edge connecting two nodes to show ETH value
  const findEdgeValue = (fromId, toId) => {
    const edge = edgeList.find(
      (e) => (e.source === fromId && e.target === toId) || (e.source === toId && e.target === fromId)
    )
    return edge?.value != null ? `${edge.value} ETH` : null
  }

  // Node count for metrics
  const nodeCount = nodeList.length || (typeof graph?.nodes === 'number' ? graph.nodes : 0)

  return (
    <div className="result-content">

      {/* Risk alert — renders only when sanctioned entities detected */}
      <RiskPanel
        riskFlags={risk_flags}
        caseId={case_id}
        nodes={nodeList}
        edges={edgeList}
        attribution={attribution}
      />

      {/* Attribution card */}
      <AttributionCard request={request} attribution={attribution} trace={trace} />

      {/* Action buttons */}
      <div className="result-actions print-exclude">
        <button className="report-link-button" type="button" onClick={onOpenReport}>View investigation report →</button>
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
          <span className="metric-value">{nodeCount} Nodes</span>
        </div>
      </div>

      {/* Hop Sequence — dynamically rendered from graph node data */}
      <div className="hop-sequence">
        <span className="hop-sequence-label">Attribution Hop Sequence</span>

        {sortedNodes.length > 0 ? (
          sortedNodes.map((node, i) => {
            const isTarget = node.type === 'target' || node.hop === 0
            const isVasp = node.type === 'vasp'
            const isRisky = node.risk === 'HIGH'
            const prevNode = i > 0 ? sortedNodes[i - 1] : null
            const edgeValue = prevNode ? findEdgeValue(prevNode.id, node.id) : null

            // Determine display label
            let displayLabel = node.id
            if (isTarget) {
              displayLabel = `${node.id.slice(0, 20)}... (Origin)`
            } else if (isVasp) {
              displayLabel = `${node.label || attribution.vasp_name} (Destination)`
            } else {
              displayLabel = `${node.id.slice(0, 20)}... (Intermediary)`
            }

            // Determine step class
            let stepClass = 'hop-step'
            if (isVasp) stepClass += ' target'
            if (isRisky) stepClass += ' flagged'

            return (
              <div key={node.id}>
                {i > 0 && <div className="hop-arrow">↓</div>}
                <div className={stepClass}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '.5rem', minWidth: 0 }}>
                    <span className="hop-badge">{node.hop ?? i}</span>
                    <span className="hop-addr" style={isVasp ? { fontWeight: 600, color: '#fff' } : undefined}>
                      {displayLabel}
                    </span>
                  </div>
                  <span className={`hop-meta${isVasp ? ' vasp' : ''}${edgeValue ? ' eth' : ''}`}>
                    {isTarget ? 'Direct' : isVasp ? 'Identified' : edgeValue || `Hop ${node.hop}`}
                  </span>
                </div>
              </div>
            )
          })
        ) : (
          /* Fallback if no node data */
          <div className="hop-step">
            <div style={{ display: 'flex', alignItems: 'center', gap: '.5rem', minWidth: 0 }}>
              <span className="hop-badge">0</span>
              <span className="hop-addr">{request.wallet_address.slice(0, 20)}... (Origin)</span>
            </div>
            <span className="hop-meta">Direct</span>
          </div>
        )}
      </div>

      {/* Transaction Graph */}
      <div className="graph-section" style={{ marginTop: '2rem' }}>
        <div className="section-title" style={{ marginBottom: '1rem' }}>
          <h3 style={{ color: '#f8fafc', fontSize: '1rem', fontWeight: 600 }}>Transaction Graph</h3>
          <span style={{ color: '#94a3b8', fontSize: '0.8rem' }}>{graphData.edges.length} directed edges</span>
        </div>
        <TransactionGraph data={graphData} />
      </div>

      {/* Evidence Panel */}
      <EvidencePanel evidence={evidence} />
      
      {/* JSON Viewer */}
      <details className="json-viewer" open style={{ marginTop: '2rem' }}>
        <summary>{result.source === 'api' ? 'View API JSON response' : 'View mock JSON response'} <span aria-hidden="true">+</span></summary>
        <pre>{JSON.stringify(result, null, 2)}</pre>
      </details>
    </div>
  )
}

export default Dashboard