import { useState } from 'react'
import LandingPage from './pages/LandingPage'
import Dashboard from './pages/Dashboard'
import './App.css'

function App() {
  const [route, setRoute] = useState(window.location.pathname || '/')

  function goToDashboard() {
    window.history.pushState({}, '', '/dashboard')
    setRoute('/dashboard')
  }

  function handlePopState() {
    setRoute(window.location.pathname || '/')
  }

  window.addEventListener('popstate', handlePopState)

  if (route === '/dashboard') {
    return (
      <main className="app-shell">
        <header className="topbar print-exclude">
          <a className="brand" href="/" aria-label="CryptoTrace home">
            <span className="brand-mark">CT</span>
            <span>CryptoTrace</span>
          </a>
          <span className="environment-badge">DEMO MODE</span>
        </header>
        <Dashboard />
      </main>
    )
  }

  return <LandingPage onStartInvestigation={goToDashboard} />
}

export default App
