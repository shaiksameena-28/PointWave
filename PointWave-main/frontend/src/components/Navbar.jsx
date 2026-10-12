import { useState } from 'react'

function readProfilePhoto() {
  try { return JSON.parse(localStorage.getItem('pointwave-profile') || '{}').profilePhoto || '' } catch { return '' }
}

function Navbar({ user, theme, onToggleTheme, onLogin, onSignup, onNavigate, onLogout }) {
  const [profileMenuOpen, setProfileMenuOpen] = useState(false)
  const profilePhoto = readProfilePhoto()
  const go = (path) => (event) => {
    event.preventDefault()
    onNavigate(path)
  }

  return (
    <header className="navbar">
      <div className="navbar-container">
        <a href="/" className="logo" aria-label="PointWave home" onClick={go('/')}>
          Point<span>Wave</span>
        </a>
        <nav className="nav-links" aria-label="Main navigation">
          <a href="/" onClick={go('/')}>Home</a>
          <a href="/find-talent" onClick={go('/find-talent')}>Find talent</a>
          <a href="/find-work" onClick={go('/find-work')}>Find work</a>
          <a href="/services" onClick={go('/services')}>Services</a>
          <a href="/how-it-works" onClick={go('/how-it-works')}>How it works</a>
        </nav>
        <div className="nav-actions">
          <button className="theme-toggle" type="button" onClick={onToggleTheme} aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`} title={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}>
            <span className={theme === 'light' ? 'active' : ''}>☀</span>
            <span className={theme === 'dark' ? 'active' : ''}>☾</span>
          </button>
          {user ? (
            <div
              style={{ position: 'relative' }}
              onMouseEnter={() => setProfileMenuOpen(true)}
              onMouseLeave={() => setProfileMenuOpen(false)}
            >
              <button className="profile-chip" type="button" onClick={() => { setProfileMenuOpen(false); onNavigate("/dashboard?tab=profile") }} title="Open your profile">
                <span className="profile-avatar">{profilePhoto ? <img src={profilePhoto} alt="Profile" /> : (user.name || 'P').trim().charAt(0).toUpperCase()}</span>
                <span className="profile-chip-name">{(user.name || 'Profile').split(' ')[0]}</span>
              </button>
              {profileMenuOpen && (
                <div
                  role="menu"
                  style={{
                    position: 'absolute',
                    top: '100%',
                    right: 0,
                    minWidth: 170,
                    padding: '8px 6px 6px',
                    border: '1px solid var(--border)',
                    borderRadius: 14,
                    background: 'var(--white)',
                    boxShadow: '0 14px 30px rgba(0,0,0,.16)',
                    zIndex: 50,
                  }}
                >
                  <button
                    type="button"
                    onClick={() => { setProfileMenuOpen(false); onLogout?.() }}
                    style={{ width: '100%', border: 0, borderRadius: 10, background: 'transparent', padding: '10px 12px', textAlign: 'left', color: '#D95757', fontWeight: 750, cursor: 'pointer' }}
                  >
                    Log out
                  </button>
                </div>
              )}
            </div>
          ) : (
            <>
              <button className="login-button" type="button" onClick={onLogin}>Log in</button>
              <button className="primary-button" type="button" onClick={onSignup}>Sign up</button>
            </>
          )}
        </div>
      </div>
    </header>
  )
}

export default Navbar
