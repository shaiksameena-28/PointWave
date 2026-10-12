import { useEffect, useState } from 'react'
import './App.css'
import Navbar from './components/Navbar'
import Hero from './components/Hero'
import HowItWorks from './components/HowItWorks'
import FeaturedTalent from './components/FeaturedTalent'
import EmergingTalent from './components/EmergingTalent'
import PopularServices from './components/PopularServices'
import TrustSection from './components/TrustSection'
import FinalCTA from './components/FinalCTA'
import Footer from './components/Footer'
import MarketplacePage from './pages/MarketplacePage'
import AuthModal from './components/AuthModal'
import DashboardPage from './pages/DashboardPage'
import OnboardingPage from './pages/OnboardingPage'
import PostProjectPage from './pages/PostProjectPage'
import TalentMatchingPage from './pages/TalentMatchingPage'
import TalentProfilePage from './pages/TalentProfilePage'
import ProjectPage from './pages/ProjectPage'
import ProposalPage from './pages/ProposalPage'
import WorkspacePage from './pages/WorkspacePage'
import PaymentsPage from './pages/PaymentsPage'

function App() {
  const [path, setPath] = useState(() => `${window.location.pathname || '/'}${window.location.search || ''}`)

  useEffect(() => {
    const handlePopState = () => setPath(`${window.location.pathname || '/'}${window.location.search || ''}`)
    window.addEventListener('popstate', handlePopState)
    return () => window.removeEventListener('popstate', handlePopState)
  }, [])

  const navigate = (nextPath) => {
    // Treat query-string changes as real navigation too. This is important for
    // project-specific applicant/profile views such as /matches?project=... .
    const currentUrl = `${window.location.pathname}${window.location.search}`
    if (nextPath === currentUrl) return
    window.history.pushState({}, '', nextPath)
    setPath(`${window.location.pathname || '/'}${window.location.search || ''}`)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const [authMode, setAuthMode] = useState(null)
  const [user, setUser] = useState(() => {
    try { return JSON.parse(localStorage.getItem('pointwave-user') || 'null') } catch { return null }
  })
  const [theme, setTheme] = useState(() => {
    try {
      const saved = localStorage.getItem('pointwave-theme')
      if (saved === 'dark' || saved === 'light') return saved
    } catch {}
    return window.matchMedia?.('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
  })

  useEffect(() => {
    document.documentElement.dataset.theme = theme
    document.body.dataset.theme = theme
    try { localStorage.setItem('pointwave-theme', theme) } catch {}
  }, [theme])

  useEffect(() => {
    const root = document.querySelector('.app')
    if (!root) return undefined

    let frame = null
    const updateSpotlight = (event) => {
      if (frame) cancelAnimationFrame(frame)
      frame = requestAnimationFrame(() => {
        // Global cursor light: this follows the pointer across the entire
        // interface, including areas that are not individual cards.
        root.style.setProperty('--cursor-x', `${event.clientX}px`)
        root.style.setProperty('--cursor-y', `${event.clientY}px`)

        // Keep the stronger local spotlight for components that explicitly
        // opt into it.
        const target = event.target.closest?.('[data-spotlight]')
        root.querySelectorAll('[data-spotlight]').forEach((element) => {
          if (element !== target) {
            element.style.removeProperty('--spot-x')
            element.style.removeProperty('--spot-y')
          }
        })
        if (!target) return
        const rect = target.getBoundingClientRect()
        target.style.setProperty('--spot-x', `${event.clientX - rect.left}px`)
        target.style.setProperty('--spot-y', `${event.clientY - rect.top}px`)
      })
    }

    const clearSpotlight = () => {
      root.style.setProperty('--cursor-x', '-300px')
      root.style.setProperty('--cursor-y', '-300px')
    }

    root.addEventListener('pointermove', updateSpotlight)
    root.addEventListener('pointerleave', clearSpotlight)
    return () => {
      if (frame) cancelAnimationFrame(frame)
      root.removeEventListener('pointermove', updateSpotlight)
      root.removeEventListener('pointerleave', clearSpotlight)
    }
  }, [])

  const routePath = path.split('?')[0]
  const isHome = routePath === '/'
  const isDashboard = routePath === '/dashboard'
  const isOnboarding = routePath === '/onboarding'
  const isPostProject = routePath === '/post-project'
  const isMatches = routePath === '/matches'
  const isTalentProfile = routePath === '/talent-profile'
  const isProject = routePath === '/project'
  const isProposal = routePath === '/proposal'
  const isWorkspace = routePath === '/workspace'
  const isPayments = routePath === '/payments'

  return (
    <div className="app" data-theme={theme}>
      <Navbar
        user={user}
        theme={theme}
        onToggleTheme={() => setTheme((current) => current === 'light' ? 'dark' : 'light')}
        onLogin={() => setAuthMode('login')}
        onSignup={() => setAuthMode('signup')}
        onNavigate={navigate}
        onLogout={() => { localStorage.removeItem('pointwave-user'); setUser(null); navigate('/') }}
      />
      {isPostProject ? (
        <PostProjectPage user={user} onNavigate={navigate} />
      ) : isMatches ? (
        <TalentMatchingPage user={user} onNavigate={navigate} />
      ) : isTalentProfile ? (
        <TalentProfilePage user={user} onNavigate={navigate} />
      ) : isProject ? (
        <ProjectPage user={user} onNavigate={navigate} />
      ) : isProposal ? (
        <ProposalPage user={user} onNavigate={navigate} />
      ) : isWorkspace ? (
        <WorkspacePage user={user} onNavigate={navigate} />
      ) : isPayments ? (
        <PaymentsPage user={user} onNavigate={navigate} />
      ) : isOnboarding ? (
        <OnboardingPage
          user={user}
          onNavigate={navigate}
          onComplete={(profile) => {
            const current = JSON.parse(localStorage.getItem('pointwave-user') || '{}')
            const updated = { ...current, profileCompleted: true }
            localStorage.setItem('pointwave-user', JSON.stringify(updated))
            try {
              const accounts = JSON.parse(localStorage.getItem('pointwave-accounts') || '{}')
              if (updated.email && accounts[updated.email]) accounts[updated.email] = { ...accounts[updated.email], profileCompleted: true }
              localStorage.setItem('pointwave-accounts', JSON.stringify(accounts))
            } catch {}
            setUser(updated)
            navigate('/dashboard')
          }}
        />
      ) : isDashboard ? (
        <DashboardPage
          key={path}
          user={user}
          onNavigate={navigate}
          onLogout={() => { localStorage.removeItem('pointwave-user'); setUser(null); navigate('/') }}
        />
      ) : isHome ? (
        <main>
          <Hero onNavigate={navigate} />
          <HowItWorks />
          <FeaturedTalent />
          <EmergingTalent />
          <PopularServices />
          <TrustSection />
          <FinalCTA onLogin={() => setAuthMode('signup')} />
        </main>
      ) : (
        <MarketplacePage path={path} user={user} onNavigate={navigate} onSignup={() => setAuthMode('signup')} />
      )}
      {!isDashboard && !isOnboarding && !isPostProject && !isMatches && !isTalentProfile && !isProject && !isProposal && !isWorkspace && !isPayments && <Footer />}

      {authMode && (
        <AuthModal
          mode={authMode}
          onClose={() => setAuthMode(null)}
          onModeChange={setAuthMode}
          onAuthenticated={(account) => {
            localStorage.setItem('pointwave-user', JSON.stringify(account))
            setUser(account)
            setAuthMode(null)
            navigate(account.profileCompleted ? '/dashboard' : '/onboarding')
          }}
        />
      )}
    </div>
  )
}

export default App
