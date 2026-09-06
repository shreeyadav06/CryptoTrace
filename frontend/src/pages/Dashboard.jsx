import { useState, useEffect } from 'react'
import { createPortal } from 'react-dom'
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
  if (Array.isArray(result?.nodes) && Array.isArray(result?.edges)) {
    return { nodes: result.nodes, edges: result.edges }
  }
  if (Array.isArray(result?.graph?.nodes) && Array.isArray(result?.graph?.edges)) {
    return { nodes: result.graph.nodes, edges: result.graph.edges }
  }
  if (Array.isArray(result?.graph?.overview?.nodes) && Array.isArray(result?.graph?.overview?.edges)) {
    return { nodes: result.graph.overview.nodes, edges: result.graph.overview.edges }
  }
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
    nodes,
    edges,
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
    <svg className="radar-svg" viewBox="0 0 128 128" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <circle cx="64" cy="64" r="60" stroke="#1e293b" strokeWidth="1" strokeDasharray="3 3" />
      <circle cx="64" cy="64" r="44" stroke="#334155" strokeWidth="1" />
      <circle cx="64" cy="64" r="28" stroke="#334155" strokeWidth="1" strokeDasharray="2 2" />
      <circle cx="64" cy="64" r="12" stroke="#475569" strokeWidth="1" />
      <line x1="64" y1="4" x2="64" y2="124" stroke="#1e293b" strokeWidth="1" />
      <line x1="4" y1="64" x2="124" y2="64" stroke="#1e293b" strokeWidth="1" />
      <path d="M64 64 L106 22 A60 60 0 0 0 64 4 Z" fill="url(#radarSweep)" opacity="0.4" />
      <defs>
        <radialGradient id="radarSweep" cx="64" cy="64" r="60" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#818cf8" stopOpacity="0" />
          <stop offset="100%" stopColor="#4f46e5" stopOpacity="0.35" />
        </radialGradient>
      </defs>
      <circle cx="92" cy="38" r="4" fill="#38bdf8" />
      <circle cx="92" cy="38" r="7" stroke="#38bdf8" strokeWidth="1" opacity="0.5" />
      <circle cx="40" cy="80" r="3" fill="#a5b4fc" opacity="0.7" />
      <circle cx="78" cy="90" r="2.5" fill="#a5b4fc" opacity="0.5" />
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
  const [traceNotice, setTraceNotice] = useState('')
  const [isTracing, setIsTracing] = useState(false)
  const [isReportOpen, setIsReportOpen] = useState(false)

  async function handleTrace(request) {
    setTraceNotice('')
    setIsTracing(true)

    try {
      const response = await traceWallet(request)
      setTraceResult(normalizeTraceResponse(response, request))
    } catch (error) {
      // Local backend offline fallback for seamless demonstration
      setTraceNotice('Local engine offline — demonstrated using verified case dataset')
      setTraceResult({ ...mockTraceResponse, request, source: 'demo-fallback' })
    } finally {
      setIsTracing(false)
    }
  }

  function togglePreview() {
    setTraceNotice('')
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

            <div className="panel-heading-actions">
              {traceResult ? (
                <>
                  <button
                    className="report-nav-btn print-exclude"
                    type="button"
                    onClick={() => setIsReportOpen(true)}
                  >
                    📄 View Report
                  </button>
                  <span className="success-pill">
                    <span className="success-pill-dot" />
                    {traceResult.source === 'api' ? 'Live Consensus' : 'Verified Case'}
                  </span>
                </>
              ) : (
                <button className="preview-btn" type="button" onClick={togglePreview}>
                  ⇆ Preview Result
                </button>
              )}
            </div>
          </div>

          {traceNotice && (
            <div className="info-notice-bar" role="status">
              <span>ℹ️ {traceNotice}</span>
              <button type="button" aria-label="Dismiss notice" onClick={() => setTraceNotice('')}>×</button>
            </div>
          )}

          {isTracing ? (
            <LoadingState message="Tracing wallet transactions..." />
          ) : !traceResult ? (
            <EmptyState />
          ) : (
            <>
              <TraceResult result={traceResult} />
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
function TraceResult({ result }) {
  const { request, attribution, trace, evidence, risk_flags, case_id } = result
  const [activeTab, setActiveTab] = useState('overview')
  const [copied, setCopied] = useState(false)
  const [isPayloadModalOpen, setIsPayloadModalOpen] = useState(false)

  // Normalize graphData safely for TransactionGraph
  const graphData = normalizeGraphData(result)
  const nodeList = graphData.nodes
  const edgeList = graphData.edges

  // Sort nodes by hop for the hop sequence display
  const sortedNodes = [...nodeList].sort((a, b) => (a.hop ?? 0) - (b.hop ?? 0))

  // Find the edge connecting two nodes to show ETH value
  const findEdgeValue = (fromId, toId) => {
    const edge = edgeList.find(
      (e) => {
        const s = typeof e.source === 'object' ? e.source.id : e.source
        const t = typeof e.target === 'object' ? e.target.id : e.target
        return (s === fromId && t === toId) || (s === toId && t === fromId)
      }
    )
    return edge?.value != null ? `${edge.value} ETH` : null
  }

  const nodeCount = nodeList.length || 0

  const copyPayload = () => {
    navigator.clipboard?.writeText(JSON.stringify(result, null, 2))
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  // Handle ESC key to close modal & lock body scroll
  useEffect(() => {
    if (!isPayloadModalOpen) return undefined
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') setIsPayloadModalOpen(false)
    }
    window.addEventListener('keydown', handleKeyDown)
    document.body.style.overflow = 'hidden'
    return () => {
      window.removeEventListener('keydown', handleKeyDown)
      document.body.style.overflow = ''
    }
  }, [isPayloadModalOpen])

  return (
    <div className="result-content">

      {/* Cyber Tab Switcher */}
      <div className="view-tabs print-exclude" role="tablist">
        <button
          className={`view-tab ${activeTab === 'overview' ? 'active' : ''}`}
          role="tab"
          type="button"
          aria-selected={activeTab === 'overview'}
          onClick={() => setActiveTab('overview')}
        >
          <span>⚡ Intelligence Overview</span>
        </button>
        <button
          className={`view-tab ${activeTab === 'graph' ? 'active' : ''}`}
          role="tab"
          type="button"
          aria-selected={activeTab === 'graph'}
          onClick={() => setActiveTab('graph')}
        >
          <span>🕸 Network Graph ({nodeCount})</span>
        </button>
        <button
          className={`view-tab ${activeTab === 'raw' ? 'active' : ''}`}
          role="tab"
          type="button"
          aria-selected={activeTab === 'raw'}
          onClick={() => setActiveTab('raw')}
        >
          <span>🔍 Raw Payload</span>
        </button>
      </div>

      {/* Tab 1: Intelligence Overview */}
      {activeTab === 'overview' && (
        <div className="tab-pane overview-pane">
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

          {/* Hop Sequence */}
          <div className="hop-sequence">
            <span className="hop-sequence-label">Attribution Hop Sequence</span>

            {sortedNodes.length > 0 ? (
              sortedNodes.map((node, i) => {
                const isTarget = node.type === 'target' || node.hop === 0
                const isVasp = node.type === 'vasp'
                const isRisky = node.risk === 'HIGH'
                const prevNode = i > 0 ? sortedNodes[i - 1] : null
                const edgeValue = prevNode ? findEdgeValue(prevNode.id, node.id) : null

                let displayLabel = node.id
                if (isTarget) {
                  displayLabel = `${node.id.slice(0, 20)}... (Origin)`
                } else if (isVasp) {
                  displayLabel = `${node.label || attribution.vasp_name} (Destination)`
                } else {
                  displayLabel = `${node.id.slice(0, 20)}... (Intermediary)`
                }

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
              <div className="hop-step">
                <div style={{ display: 'flex', alignItems: 'center', gap: '.5rem', minWidth: 0 }}>
                  <span className="hop-badge">0</span>
                  <span className="hop-addr">{request.wallet_address.slice(0, 20)}... (Origin)</span>
                </div>
                <span className="hop-meta">Direct</span>
              </div>
            )}
          </div>

          {/* Evidence Panel */}
          <EvidencePanel evidence={evidence} />

          {/* Explore Graph Tab link */}
          <div className="overview-footer-cta">
            <button
              className="explore-graph-cta-btn"
              type="button"
              onClick={() => setActiveTab('graph')}
            >
              <span>Explore Interactive Network Graph ({edgeList.length} connections)</span>
              <span className="cta-arrow">→</span>
            </button>
          </div>
        </div>
      )}

      {/* Tab 2: Network Graph */}
      {activeTab === 'graph' && (
        <div className="tab-pane graph-pane">
          <TransactionGraph data={graphData} />
        </div>
      )}

      {/* Tab 3: Raw Payload Inspector */}
      {activeTab === 'raw' && (
        <div className="tab-pane raw-pane">
          <div className="terminal-header">
            <div className="terminal-title-group">
              <span className="terminal-badge">CONSENSUS</span>
              <span className="terminal-title">trace-payload.json</span>
            </div>
            <div className="terminal-actions">
              <button
                className="expand-modal-btn"
                type="button"
                onClick={() => setIsPayloadModalOpen(true)}
                title="Open full-screen modal without horizontal scroll"
              >
                ⛶ Enlarge View
              </button>
              <button className="copy-json-btn" type="button" onClick={copyPayload}>
                {copied ? '✓ Copied' : 'Copy JSON'}
              </button>
            </div>
          </div>
          <pre className="terminal-body">{JSON.stringify(result, null, 2)}</pre>
        </div>
      )}

      {/* Full-screen Portal Modal for Raw Payload (rendered directly to body) */}
      {isPayloadModalOpen && typeof document !== 'undefined' && createPortal(
        <div
          className="payload-modal-overlay print-exclude"
          onClick={() => setIsPayloadModalOpen(false)}
        >
          <div
            className="payload-modal-container"
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-label="Raw Payload Viewer"
          >
            <div className="payload-modal-header">
              <div className="modal-title-wrap">
                <span className="modal-kicker">Consensus JSON Output</span>
                <h3>Forensic Trace Payload {result.case_id ? `(${result.case_id})` : ''}</h3>
              </div>
              <div className="modal-actions-wrap">
                <button className="copy-json-btn" type="button" onClick={copyPayload}>
                  {copied ? '✓ Copied to Clipboard' : 'Copy JSON'}
                </button>
                <button
                  className="modal-close-btn"
                  type="button"
                  onClick={() => setIsPayloadModalOpen(false)}
                  aria-label="Close modal"
                >
                  ✕ Close
                </button>
              </div>
            </div>
            <div className="payload-modal-body">
              <p className="modal-hint">Full cryptographic consensus response · Formatted with auto line-wrap (no horizontal scroll needed):</p>
              <pre className="modal-code-viewer">{JSON.stringify(result, null, 2)}</pre>
            </div>
          </div>
        </div>,
        document.body
      )}

    </div>
  )
}

export default Dashboard