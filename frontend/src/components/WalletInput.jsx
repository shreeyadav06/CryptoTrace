import { useState } from 'react'

const CHAINS = ['Ethereum', 'Bitcoin', 'Polygon', 'Arbitrum']

const SAMPLE_ADDRESS = '0x742d35Cc6634C0532925a3b844Bc454e4438f44e'

function WalletInput({ onTrace, isLoading = false }) {
  const [walletAddress, setWalletAddress] = useState('0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045')
  const [chain, setChain] = useState('Ethereum')
  const [maxHops, setMaxHops] = useState(3)
  const [mode, setMode] = useState('standard')
  const [error, setError] = useState('')

  function fillSample() {
    setWalletAddress(SAMPLE_ADDRESS)
    setError('')
  }

  function handleSubmit(e) {
    e.preventDefault()
    const addr = walletAddress.trim()

    if (!addr) {
      setError('Please enter a wallet address to begin the trace.')
      return
    }

    setError('')
    onTrace({ wallet_address: addr, chain, max_hops: Number(maxHops), mode })
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

      {/* Wallet Address */}
      <div className="field-group">
        <div className="field-label-row">
          <label className="field-label" htmlFor="wallet-address">Wallet address</label>
          <button className="sample-link" type="button" onClick={fillSample}>Sample</button>
        </div>
        <input
          className="field-input"
          id="wallet-address"
          type="text"
          value={walletAddress}
          onChange={(e) => { setWalletAddress(e.target.value); setError('') }}
          placeholder="Enter wallet address..."
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