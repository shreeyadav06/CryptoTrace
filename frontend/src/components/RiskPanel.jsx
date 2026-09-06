/**
 * RiskPanel.jsx — F2 Day 3 (Step 6.5)
 *
 * Intelligence-grade sanctions warning panel rendered when high-risk
 * or OFAC-designated entities are detected along the transaction path.
 *
 * Displays:
 *  - Sanctioned address with the exact hop where it was encountered
 *  - Designation source and entity identification
 *  - Transaction details (hash, value, timestamp) of the flagged transfer
 *  - SAR filing advisory
 *
 * Only mounts when risk_flags array contains one or more entries.
 *
 * Spec: docs/visual_identity.md § 5.3
 */

export default function RiskPanel({ riskFlags = [], caseId, nodes = [], edges = [], attribution }) {
  if (!riskFlags || riskFlags.length === 0) return null;

  // Extract flagged nodes — any node where risk === "HIGH" and it's not the target wallet itself
  const flaggedNodes = nodes.filter(
    (n) => n.risk === 'HIGH' && n.type !== 'target'
  );

  // If no flagged nodes found in graph data, still show flags with available info
  const hasFlaggedNodes = flaggedNodes.length > 0;

  // Find the edge (transaction) that connects to the flagged node
  const getFlaggedEdge = (flaggedNodeId) => {
    return edges.find(
      (e) => e.target === flaggedNodeId || e.source === flaggedNodeId
    );
  };

  // Parse VASP name for designation details
  const designation = attribution?.vasp_name || '';
  const isOFAC = designation.includes('OFAC') || riskFlags.some((f) => typeof f === 'string' && f.includes('OFAC'));

  // Format address for display: 0x098b...2f96
  const formatAddr = (addr) => {
    if (!addr || addr.length < 12) return addr || 'Unknown';
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
  };

  // Format ETH value
  const formatValue = (val) => {
    if (val === undefined || val === null) return null;
    return typeof val === 'number' ? `${val} ETH` : `${val} ETH`;
  };

  // Format timestamp
  const formatTime = (ts) => {
    if (!ts) return null;
    try {
      const d = new Date(ts);
      return d.toLocaleString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        timeZoneName: 'short',
      });
    } catch {
      return ts;
    }
  };

  return (
    <div className="risk-panel" role="alert" aria-live="assertive" id="risk-panel-alert">

      {/* ── Header row ─────────────────────────────── */}
      <div className="risk-panel-header">
        <div className="risk-panel-header-left">
          {/* Pulsating alert icon */}
          <div className="risk-panel-icon-wrap">
            <span className="risk-panel-icon-pulse" />
            <svg className="risk-panel-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
              <path
                d="M12 9v4m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"
                stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
              />
            </svg>
          </div>

          <div>
            <h3 className="risk-panel-title">
              <span className="risk-panel-badge">HIGH RISK</span>
              Sanctioned Entity Detected
            </h3>
            <p className="risk-panel-subtitle">
              {isOFAC ? 'OFAC SDN List — U.S. Treasury Designation' : 'International Sanctions Watchlist Match'}
            </p>
          </div>
        </div>

        {caseId && (
          <span className="risk-panel-case-id">{caseId}</span>
        )}
      </div>

      {/* ── Flagged address details ────────────────── */}
      {hasFlaggedNodes ? (
        <div className="risk-panel-details">
          {flaggedNodes.map((node, i) => {
            const edge = getFlaggedEdge(node.id);
            return (
              <div key={i} className="risk-flagged-entity">

                {/* Entity identification row */}
                <div className="risk-entity-row">
                  <div className="risk-entity-label">Flagged Address</div>
                  <div className="risk-entity-value">
                    <span className="risk-addr-full">{node.id}</span>
                  </div>
                </div>

                {/* Designation */}
                {designation && (
                  <div className="risk-entity-row">
                    <div className="risk-entity-label">Designation</div>
                    <div className="risk-entity-value risk-entity-designation">
                      {designation}
                    </div>
                  </div>
                )}

                {/* Hop location */}
                <div className="risk-entity-row">
                  <div className="risk-entity-label">Detected At</div>
                  <div className="risk-entity-value">
                    <span className="risk-hop-badge">Hop {node.hop}</span>
                    <span className="risk-entity-type">
                      {node.type === 'vasp' ? 'Identified VASP' : 'Intermediary Wallet'}
                    </span>
                  </div>
                </div>

                {/* Transaction details if available */}
                {edge && (
                  <div className="risk-entity-row">
                    <div className="risk-entity-label">Transaction</div>
                    <div className="risk-entity-value risk-tx-details">
                      {formatValue(edge.value) && (
                        <span className="risk-tx-value">{formatValue(edge.value)}</span>
                      )}
                      {edge.tx_hash && (
                        <span className="risk-tx-hash" title={edge.tx_hash}>
                          Tx: {formatAddr(edge.tx_hash)}
                        </span>
                      )}
                      {formatTime(edge.timestamp) && (
                        <span className="risk-tx-time">{formatTime(edge.timestamp)}</span>
                      )}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      ) : (
        /* Fallback: show raw risk flags when no node-level data is available */
        <div className="risk-panel-details">
          <div className="risk-panel-flags">
            {riskFlags.map((flag, i) => (
              <div key={i} className="risk-panel-flag-item">
                <span className="risk-panel-flag-dot" />
                <span>{typeof flag === 'string' ? flag : flag.description || flag.label || JSON.stringify(flag)}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── SAR advisory ───────────────────────────── */}
      <div className="risk-panel-advisory">
        <svg className="risk-panel-advisory-icon" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
          <path d="M8 1v6m0 2v.01M14 8A6 6 0 112 8a6 6 0 0112 0z" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        <p className="risk-panel-advisory-text">
          <strong>Action Required:</strong> Immediate filing of a Suspicious Activity Report (SAR) is recommended.
          Transaction path contains addresses matching active international sanctions designations.
          Do not process further transactions involving flagged entities without compliance review.
        </p>
      </div>
    </div>
  );
}
