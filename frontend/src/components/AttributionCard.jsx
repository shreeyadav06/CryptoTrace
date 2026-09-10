export default function AttributionCard({ request, attribution, trace }) {
  const getConfidenceClass = (score) => {
    if (score >= 80) return 'high';
    if (score >= 50) return 'medium';
    return 'low';
  };

  return (
    <div className="attribution-card">
      <div className="attribution-left">
        <div className="attribution-icon">🏢</div>
        <div>
          <h4 className="attribution-name">
            {attribution.vasp_name}
            {attribution.vasp_name !== 'No Confident Attribution' && (
              <span className="vasp-badge">Verified VASP</span>
            )}
            <span className="vasp-badge" style={{ marginLeft: '0.5rem', background: 'rgba(34, 211, 238, 0.1)', color: 'var(--accent-cyan)', borderColor: 'rgba(34, 211, 238, 0.2)' }}>
              {trace.hops} Hops
            </span>
          </h4>
          <p className="attribution-cluster">
            Cluster: {request.wallet_address.slice(0, 7)}...{request.wallet_address.slice(-5)} (Hot Wallet)
          </p>
        </div>
      </div>
      <div className="attribution-right" style={{ minWidth: '180px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
          <span className="attribution-score-label" style={{ marginBottom: 0 }}>Confidence Score</span>
          <span className="attribution-score" style={{ fontSize: '1.1rem' }}>{attribution.confidence}%</span>
        </div>
        <div className="ct-confidence-meter">
          <div className="ct-confidence-bar-track">
            <div 
              className={`ct-confidence-bar-fill ${getConfidenceClass(attribution.confidence)}`}
              style={{ width: `${attribution.confidence}%` }}
            />
          </div>
        </div>
      </div>
    </div>
  )
}
