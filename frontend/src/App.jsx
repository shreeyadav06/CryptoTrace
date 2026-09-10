import { useState, useEffect } from 'react'
import LandingPage from './pages/LandingPage'
import Dashboard from './pages/Dashboard'
import './App.css'

function App() {
  const [route, setRoute] = useState(window.location.pathname || '/')

  function goToDashboard() {
    window.history.pushState({}, '', '/dashboard')
    setRoute('/dashboard')
  }

  function goToLanding() {
    window.history.pushState({}, '', '/')
    setRoute('/')
  }

  useEffect(() => {
    function handlePopState() {
      setRoute(window.location.pathname || '/')
    }
    window.addEventListener('popstate', handlePopState)
    return () => window.removeEventListener('popstate', handlePopState)
  }, [])

  if (route === '/dashboard') {
    return (
      <main className="app-shell">
        <header className="topbar print-exclude">
          <a 
            className="brand" 
            href="/" 
            aria-label="CryptoTrace home"
            onClick={(e) => {
              e.preventDefault()
              goToLanding()
            }}
          >
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

  return <LandingPage onStartInvestigation={goToDashboard} />
}

export default App
