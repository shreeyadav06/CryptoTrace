import Dashboard from './pages/Dashboard'
import './App.css'

function App() {
  return (
    <main className="app-shell">
      <header className="topbar">
        <a className="brand" href="/" aria-label="CryptoTrace home">
          <span className="brand-mark">CT</span>
          <span>CryptoTrace</span>
        </a>
        <span className="environment-badge">
          <span className="environment-badge-dot" />
          Demo Mode
        </span>
      </header>
      <Dashboard />
    </main>
  )
}

export default App