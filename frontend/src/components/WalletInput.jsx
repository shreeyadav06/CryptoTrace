import { useState } from 'react'

const chains = ['Ethereum', 'Bitcoin', 'BNB Smart Chain', 'Polygon', 'Tron']

<<<<<<< Updated upstream
function WalletInput({ onTrace }) {
  const [walletAddress, setWalletAddress] = useState('')
=======
function WalletInput({ onTrace, isLoading = false }) {
  const [walletAddress, setWalletAddress] = useState('0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045')
>>>>>>> Stashed changes
  const [chain, setChain] = useState('Ethereum')
  const [maxHops, setMaxHops] = useState(3)
  const [mode, setMode] = useState('standard')
  const [error, setError] = useState('')

  function handleSubmit(event) {
    event.preventDefault()

    const address = walletAddress.trim()
    if (!address) {
      setError('Enter a wallet address to start the trace.')
      return
    }

    const request = {
      wallet_address: address,
      chain,
      max_hops: Number(maxHops),
      mode,
    }

    setError('')
    console.log('[CryptoTrace] Trace request:', request)
    onTrace(request)
  }

  return (
    <form className="trace-form" onSubmit={handleSubmit}>
      <div className="form-heading">
        <div>
          <p className="eyebrow">Investigation input</p>
          <h2>Trace a wallet</h2>
        </div>
        <span className="form-step">01 / 01</span>
      </div>

      <label className="field field-wide">
        <span>Wallet address</span>
        <input
          type="text"
          value={walletAddress}
          onChange={(event) => setWalletAddress(event.target.value)}
          placeholder="Enter wallet address..."
          aria-invalid={Boolean(error)}
          aria-describedby={error ? 'wallet-error' : undefined}
        />
      </label>

      <div className="form-grid">
        <label className="field">
          <span>Blockchain</span>
          <select value={chain} onChange={(event) => setChain(event.target.value)}>
            {chains.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </label>

        <label className="field">
          <span className="range-label">
            <span>Max hops</span>
            <strong>{maxHops}</strong>
          </span>
          <input
            className="range-input"
            type="range"
            min="1"
            max="10"
            value={maxHops}
            onChange={(event) => setMaxHops(event.target.value)}
          />
        </label>
      </div>

      <fieldset className="mode-field">
        <legend>Trace mode</legend>
        <div className="mode-toggle" role="radiogroup" aria-label="Trace mode">
          <label className={mode === 'standard' ? 'mode-option active' : 'mode-option'}>
            <input
              type="radio"
              name="trace-mode"
              value="standard"
              checked={mode === 'standard'}
              onChange={(event) => setMode(event.target.value)}
            />
            Standard
          </label>
          <label className={mode === 'deep' ? 'mode-option active' : 'mode-option'}>
            <input
              type="radio"
              name="trace-mode"
              value="deep"
              checked={mode === 'deep'}
              onChange={(event) => setMode(event.target.value)}
            />
            Deep Trace
          </label>
        </div>
      </fieldset>

      {error && <p className="form-error" id="wallet-error">{error}</p>}

<<<<<<< Updated upstream
      <button className="trace-button" type="submit">
        <span>Trace wallet</span>
        <span aria-hidden="true">-&gt;</span>
=======
      {/* Submit */}
      <button className="trace-button" type="submit" disabled={isLoading}>
        <span>{isLoading ? 'Tracing...' : 'Trace wallet'}</span>
        <span className="trace-button-icon">→</span>
>>>>>>> Stashed changes
      </button>
    </form>
  )
}

export default WalletInput