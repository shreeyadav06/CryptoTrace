import { useState } from 'react'

const CHAINS = ['Ethereum', 'Tron (TRC-20)', 'Bitcoin', 'Polygon', 'Arbitrum']

const PRESET_CASES = [
  {
    id: 'CASE-001',
    label: 'CASE-001 (Binance ETH)',
    address: '0x85053b6941c4a71b820f4bbd4bafa3d34f943e3a',
    chain: 'Ethereum',
  },
  {
    id: 'CASE-002',
    label: 'CASE-002 (OFAC Lazarus)',
    address: '0xc3bfbab68c680a962fb9c3193b6fd2736b7db275',
    chain: 'Ethereum',
  },
  {
    id: 'CASE-003',
    label: 'CASE-003 (Unassigned)',
    address: '0xf27eced4cde3b613ddbe5ea119969efe60151b20',
    chain: 'Ethereum',
  },
  {
    id: 'CASE-TRON-001',
    label: 'CASE-TRON-001 (Tron TRC-20 Laundering)',
    address: 'TYG6n3s2K9mXkRt8UvWz3yBc1DeFa45678',
    chain: 'Tron (TRC-20)',
  },
]

function WalletInput({ onTrace, isLoading = false }) {
  const [walletAddress, setWalletAddress] = useState('0x85053b6941c4a71b820f4bbd4bafa3d34f943e3a')
  const [chain, setChain] = useState('Ethereum')
  const [maxHops, setMaxHops] = useState(3)
  const [mode, setMode] = useState('standard')
  const [error, setError] = useState('')
  const [selectedCase, setSelectedCase] = useState('CASE-001')

  function handleSelectCase(e) {
    const caseId = e.target.value
    setSelectedCase(caseId)
    const found = PRESET_CASES.find((c) => c.id === caseId)
    if (found) {
      setWalletAddress(found.address)
      setChain(found.chain)
      setError('')
    }
  }

  function handleSubmit(e) {
    e.preventDefault()
    const addr = walletAddress.trim()

    if (!addr) {
      setError('Please enter a wallet address to begin the trace.')
      return
    }

    setError('')
    onTrace({ 
      wallet_address: addr, 
      chain: chain.includes('Tron') ? 'tron' : chain.toLowerCase(), 
      max_hops: Number(maxHops), 
      mode 
    })
  }

  return (
    <form className="trace-form" onSubmit={handleSubmit} noValidate>

      {/* Header */}
      <div className="form-heading">
        <div>
          <span className="form-heading-eyebrow">Investigation Input</span>
          <h2>Trace a wallet</h2>
        </div>
        <span className="form-step">01 / 01</span>
      </div>

      {/* Ground Truth Presets */}
      <div className="field-group" style={{ marginBottom: '1rem' }}>
        <div className="field-label-row">
          <label className="field-label" htmlFor="preset-case-select">Pre-Loaded Forensic Case</label>
          <span style={{ fontSize: '0.72rem', color: '#818cf8', fontWeight: 600 }}>Ground Truth</span>
        </div>
        <select
          className="field-select"
          id="preset-case-select"
          value={selectedCase}
          onChange={handleSelectCase}
        >
          {PRESET_CASES.map((c) => (
            <option key={c.id} value={c.id}>{c.label}</option>
          ))}
        </select>
      </div>

      {/* Wallet Address */}
      <div className="field-group">
        <div className="field-label-row">
          <label className="field-label" htmlFor="wallet-address">Wallet address</label>
        </div>
        <input
          className="field-input"
          id="wallet-address"
          type="text"
          value={walletAddress}
          onChange={(e) => { 
            setWalletAddress(e.target.value) 
            setSelectedCase('')
            setError('') 
          }}
          placeholder="Enter 0x... (EVM) or T... (Tron) wallet address"
          spellCheck={false}
          autoComplete="off"
        />
      </div>

      {/* Blockchain + Hops */}
      <div className="form-row" style={{ marginBottom: '1.5rem' }}>
        <div>
          <label className="field-label" htmlFor="blockchain-select" style={{ display: 'block', marginBottom: '.5rem' }}>Blockchain</label>
          <select className="field-select" id="blockchain-select" value={chain} onChange={(e) => setChain(e.target.value)}>
            {CHAINS.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
        <div>
          <div className="hops-header">
            <label className="field-label" htmlFor="max-hops">Max hops</label>
            <span className="hops-value">{maxHops}</span>
          </div>
          <div style={{ paddingTop: '.5rem' }}>
            <input
              className="range-input"
              id="max-hops"
              type="range"
              min="1"
              max="10"
              value={maxHops}
              onChange={(e) => setMaxHops(e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* Mode Toggle */}
      <div className="mode-field">
        <span className="mode-label">Trace mode</span>
        <div className="mode-toggle" role="radiogroup" aria-label="Trace mode">
          <label className={`mode-option${mode === 'standard' ? ' active' : ''}`}>
            <input type="radio" name="trace-mode" value="standard" checked={mode === 'standard'} onChange={(e) => setMode(e.target.value)} />
            Standard
          </label>
          <label className={`mode-option${mode === 'deep' ? ' active' : ''}`}>
            <input type="radio" name="trace-mode" value="deep" checked={mode === 'deep'} onChange={(e) => setMode(e.target.value)} />
            Deep Trace
          </label>
        </div>
      </div>

      {/* Error */}
      {error && <p className="form-error" role="alert">{error}</p>}

      {/* Submit */}
      <button className="trace-button" type="submit" disabled={isLoading}>
        <span>{isLoading ? 'Tracing...' : 'Trace wallet'}</span>
        <span className="trace-button-icon">→</span>
      </button>

    </form>
  )
}

export default WalletInput