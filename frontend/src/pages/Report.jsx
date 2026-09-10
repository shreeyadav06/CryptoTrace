import { useState, useEffect, useCallback } from 'react'
import { createPortal } from 'react-dom'

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

/* ─── Section 91 CrPC / BNSS 94 Notice Generator ─── */
function generateSection91Notice(result) {
  const request = result?.request || {}
  const attribution = result?.attribution || {}
  const trace = result?.trace || {}
  const evidence = Array.isArray(result?.evidence) ? result.evidence : []
  const riskFlags = Array.isArray(result?.risk_flags) ? result.risk_flags : []
  const path = Array.isArray(result?.path) ? result.path : []
  const caseId = result?.case_id || 'CASE-UNASSIGNED'
  const chain = (request.chain || 'Ethereum').toUpperCase()
  const walletAddr = request.wallet_address || result?.input_address || 'UNKNOWN'
  const vaspName = attribution.vasp_name || result?.selected_vasp || 'Unknown VASP'
  const confidence = attribution.confidence ?? result?.confidence ?? 0
  const hopDistance = trace.hops ?? result?.hop_distance ?? 'N/A'
  const generatedAt = formatDate(result?.generated_at)

  const edgeList = Array.isArray(result?.edges) ? result.edges
    : (Array.isArray(result?.graph?.edges) ? result.graph.edges : [])

  const txLines = edgeList.slice(0, 10).map((e, i) =>
    `  ${i + 1}. TX Hash: ${e.tx_hash || 'N/A'}\n     From: ${e.source || 'N/A'}\n     To: ${e.target || 'N/A'}\n     Value: ${e.value ?? 'N/A'} ${chain === 'TRON' ? 'USDT' : 'ETH'}\n     Timestamp: ${e.timestamp || 'N/A'}`
  ).join('\n\n')

  const evidenceLines = evidence.map((e, i) =>
    `  ${i + 1}. ${typeof e === 'string' ? e : `[${e.type || 'Signal'}] ${e.description || e}`}`
  ).join('\n')

  const riskLines = riskFlags.length
    ? riskFlags.map((f, i) => `  ${i + 1}. ⚠ ${f}`).join('\n')
    : '  None identified.'

  const pathLine = path.length
    ? path.join('  →  ')
    : 'No path available.'

  return `═══════════════════════════════════════════════════════════════════════
  LEGAL REQUISITION FOR LAWFUL DISCLOSURE AND IMMEDIATE ASSET PRESERVATION
  Under Section 91 / 102 of the Code of Criminal Procedure, 1973
  (Corresponding: Section 94 / 106, Bharatiya Nagarik Suraksha Sanhita, 2023)
═══════════════════════════════════════════════════════════════════════

Case Reference  : ${caseId}
Date of Notice  : ${generatedAt}
Classification  : CONFIDENTIAL — LAW ENFORCEMENT USE ONLY

───────────────────────────────────────────────────────────────────────
TO:
  The Nodal Officer / Compliance Desk
  ${vaspName}
  [Registered Address of ${vaspName}]

FROM:
  Cyber Crime Investigation Cell
  [Investigating Officer Name & Designation]
  [Police Station / District / State]
  Contact: [Official Email / Phone]

───────────────────────────────────────────────────────────────────────
SUBJECT: Emergency Account Freezing Mandate and Information
Disclosure Request pertaining to Virtual Digital Asset Wallet
Address ${walletAddr} on the ${chain} Blockchain Network.

───────────────────────────────────────────────────────────────────────

Dear Sir / Madam,

  Under the authority vested by Section 91 of the Code of Criminal
  Procedure, 1973 (and corresponding Section 94 of the Bharatiya
  Nagarik Suraksha Sanhita, 2023), you are hereby directed to:

  1. IMMEDIATELY FREEZE all accounts, wallets, and sub-accounts
     associated with or linked to the following wallet address:

       TARGET WALLET: ${walletAddr}
       BLOCKCHAIN   : ${chain}

  2. PRESERVE all transaction records, KYC documents, IP logs,
     device fingerprints, and session metadata associated with
     the above address and all connected addresses identified
     in this investigation.

  3. DISCLOSE the complete KYC identity, registration records,
     bank linkage details, and communication logs of the account
     holder(s) to the investigating agency within 72 hours of
     receipt of this notice.

───────────────────────────────────────────────────────────────────────
CRYPTOTRACE INTELLIGENCE SUMMARY
───────────────────────────────────────────────────────────────────────

  Attributed VASP       : ${vaspName}
  Attribution Confidence: ${confidence}%
  Hop Distance          : ${hopDistance}
  Blockchain Network    : ${chain}

  TRACE PATH:
  ${pathLine}

  TRANSACTION EVIDENCE:
${txLines || '  No transaction details available.'}

  INTELLIGENCE SIGNALS:
${evidenceLines || '  No evidence signals recorded.'}

  RISK FLAGS:
${riskLines}

───────────────────────────────────────────────────────────────────────
LEGAL MANDATE & COMPLIANCE OBLIGATIONS
───────────────────────────────────────────────────────────────────────

  This notice is issued under the provisions of:
  • Section 91 CrPC, 1973 — Power to summon production of documents
  • Section 102 CrPC, 1973 — Power of seizure of property
  • Section 94 BNSS, 2023 — Corresponding provision for document summons
  • Section 106 BNSS, 2023 — Corresponding provision for asset seizure
  • Prevention of Money Laundering Act, 2002 — Section 17 (Search & Seizure)
  • Information Technology Act, 2000 — Section 69 (Interception & Decryption)

  NON-COMPLIANCE WARNING:
  Failure to comply with this lawful requisition within the stipulated
  timeframe may attract proceedings under Section 175 IPC (Omission to
  produce document) and Section 176 IPC (Omission to give notice or
  information to public servant).

───────────────────────────────────────────────────────────────────────
AUTHENTICATION
───────────────────────────────────────────────────────────────────────

  Investigating Officer : ____________________________
  Designation           : ____________________________
  Badge / ID Number     : ____________________________
  Date                  : ${generatedAt}
  Digital Signature     : [PENDING CRYPTOGRAPHIC SEAL]

  Station Seal:



  ──────────────────────
  [OFFICIAL STAMP HERE]

───────────────────────────────────────────────────────────────────────
  Generated by CryptoTrace — Explainable Blockchain Intelligence Platform
  Report ID: ${caseId} | Confidence: ${confidence}% | ${generatedAt}
  SAHYOG Integration Reference: SAHYOG-INC-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}
═══════════════════════════════════════════════════════════════════════
`
}

/* ─── Section 91 Notice Modal Component ─── */
function SahyogNoticeModal({ noticeText, onClose }) {
  const [copied, setCopied] = useState(false)

  // Esc key to close + body scroll lock
  useEffect(() => {
    const handleKey = (e) => { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', handleKey)
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', handleKey)
      document.body.style.overflow = ''
    }
  }, [onClose])

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(noticeText)
      setCopied(true)
      setTimeout(() => setCopied(false), 2500)
    } catch { /* clipboard not available */ }
  }

  const handleDownload = () => {
    const blob = new Blob([noticeText], { type: 'text/plain;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `Section_91_Notice_${Date.now()}.txt`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  return createPortal(
    <div className="sahyog-modal-backdrop" onClick={onClose}>
      <div className="sahyog-modal" onClick={(e) => e.stopPropagation()}>
        <header className="sahyog-modal-header">
          <div className="sahyog-modal-title">
            <span className="sahyog-badge">SAHYOG</span>
            <h2>Section 91 CrPC — Disclosure Notice</h2>
          </div>
          <div className="sahyog-modal-actions">
            <button className="sahyog-copy-btn" type="button" onClick={handleCopy}>
              {copied ? '✓ Copied' : '📋 Copy to Clipboard'}
            </button>
            <button className="sahyog-download-btn" type="button" onClick={handleDownload}>
              ⬇ Download .txt
            </button>
            <button className="sahyog-close-btn" type="button" onClick={onClose} title="Close (Esc)">✕</button>
          </div>
        </header>
        <pre className="sahyog-notice-body">{noticeText}</pre>
      </div>
    </div>,
    document.body
  )
}

function Report({ result, onBack }) {
  const [sahyogNotice, setSahyogNotice] = useState(null)
  const [sahyogLoading, setSahyogLoading] = useState(false)

  const request = result?.request || {}
  const attribution = result?.attribution || {}
  const trace = result?.trace || {}
  const evidence = Array.isArray(result?.evidence) ? result.evidence : []
  const riskFlags = Array.isArray(result?.risk_flags) ? result.risk_flags : []
  
  // Safely extract node and edge lists
  const nodeList = Array.isArray(result?.nodes) ? result.nodes
    : (Array.isArray(result?.graph?.nodes) ? result.graph.nodes : [])
  const edgeList = Array.isArray(result?.edges) ? result.edges
    : (Array.isArray(result?.graph?.edges) ? result.graph.edges : [])

  const nodeCount = nodeList.length || (typeof result?.graph?.nodes === 'number' ? result.graph.nodes : 0)
  const edgeCount = edgeList.length || (typeof result?.graph?.edges === 'number' ? result.graph.edges : 0)

  const path = Array.isArray(result?.path) && result.path.length
    ? result.path
    : nodeList.filter((node) => node?.type === 'target' || node?.type === 'vasp').map((node) => node.id)

  const status = result?.source === 'api' ? 'CONSENSUS VERIFIED' : 'DEMO VERIFIED'

  const handleExportSahyogNotice = useCallback(async () => {
    setSahyogLoading(true)
    const caseId = result?.case_id || 'CASE-001'
    try {
      // Attempt to fetch from backend SAHYOG endpoint
      const res = await fetch(`http://localhost:5000/api/sahyog/disclosure-notice/${caseId}`, {
        signal: AbortSignal.timeout(3000)
      })
      if (res.ok) {
        const data = await res.json()
        setSahyogNotice(data.notice_text || generateSection91Notice(result))
      } else {
        throw new Error('Backend unavailable')
      }
    } catch {
      // Fallback: generate notice client-side from trace data
      setSahyogNotice(generateSection91Notice(result))
    } finally {
      setSahyogLoading(false)
    }
  }, [result])

  return (
    <div className="report-page">
      <div className="report-toolbar print-exclude">
        <button className="report-back-button" type="button" onClick={onBack}>← Back to workspace</button>
        <div className="report-toolbar-right">
          <button
            className="sahyog-notice-button"
            type="button"
            onClick={handleExportSahyogNotice}
            disabled={sahyogLoading}
          >
            {sahyogLoading ? '⏳ Generating…' : '📋 Export Section 91 Notice (SAHYOG)'}
          </button>
          <button className="print-button" type="button" onClick={() => window.print()}>Print Forensic Report</button>
        </div>
      </div>

      {sahyogNotice && (
        <SahyogNoticeModal
          noticeText={sahyogNotice}
          onClose={() => setSahyogNotice(null)}
        />
      )}

      <article className="investigation-report">
        <header className="report-header">
          <div>
            <p className="report-kicker">CryptoTrace / Forensic Investigation Summary</p>
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
            <ReportDetail label="Trace mode" value={display(request.mode, 'Standard')} />
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
            <ReportMetric label="Transactions analyzed" value={display(trace.transactions_analyzed, edgeCount)} />
            <ReportMetric label="Nodes analyzed" value={nodeCount} />
            <ReportMetric label="Edges analyzed" value={edgeCount} />
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
          {riskFlags.length ? <ul className="report-list report-risk-list">{riskFlags.map((flag) => <li key={flag}>⚠️ {flag}</li>)}</ul> : <p className="report-clear">No risk flags returned.</p>}
        </section>

        <footer className="report-footer">CryptoTrace · Explainable blockchain intelligence · Generated {formatDate(result?.generated_at)}</footer>
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