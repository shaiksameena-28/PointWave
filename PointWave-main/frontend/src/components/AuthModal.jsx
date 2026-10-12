import { useState } from 'react'

const API_URL = 'http://localhost:5000/api'

function AuthModal({ mode, onClose, onModeChange, onAuthenticated }) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [role, setRole] = useState('freelancer')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const isSignup = mode === 'signup'

  const submit = async (event) => {
    event.preventDefault()
    setError('')

    const normalizedEmail = email.trim().toLowerCase()

    if (isSignup && !name.trim()) {
      return setError('Please enter your name.')
    }

    if (!normalizedEmail || !normalizedEmail.includes('@')) {
      return setError('Please enter a valid email address.')
    }

    if (password.length < 8) {
      return setError('Password must be at least 8 characters.')
    }

    if (isSignup && password !== confirmPassword) {
      return setError('Passwords do not match.')
    }

    try {
      setLoading(true)

      const endpoint = isSignup
        ? `${API_URL}/users`
        : `${API_URL}/users/login`

      const body = isSignup
        ? {
            name: name.trim(),
            email: normalizedEmail,
            password,
            role,
          }
        : {
            email: normalizedEmail,
            password,
          }

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || 'Something went wrong.')
      }

      const account = {
        name: data.user.name,
        email: data.user.email,
        role: data.user.role,
        profileCompleted: Boolean(data.user.profileCompleted),
      }

      if (data.token) {
        localStorage.setItem('pointwave-token', data.token)
      }

      localStorage.setItem('pointwave-user', JSON.stringify(account))

      onAuthenticated?.(account, isSignup)
    } catch (error) {
      setError(error.message || 'Unable to connect to PointWave.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div
      className="auth-overlay"
      role="presentation"
      onMouseDown={(event) =>
        event.target === event.currentTarget && onClose()
      }
    >
      <div
        className="auth-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="auth-title"
      >
        <button
          className="auth-close"
          type="button"
          aria-label="Close"
          onClick={onClose}
        >
          ×
        </button>

        <span className="section-label">PointWave</span>

        <h2 id="auth-title">
          {isSignup ? 'Create your account.' : 'Welcome back.'}
        </h2>

        <p>
          {isSignup
            ? 'Start with the side of the marketplace you need.'
            : 'Log in to continue to PointWave.'}
        </p>

        <form onSubmit={submit}>
          {isSignup && (
            <label>
              Name
              <input
                value={name}
                onChange={(event) => setName(event.target.value)}
                autoComplete="name"
                placeholder="Your name"
              />
            </label>
          )}

          <label>
            Email
            <input
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              autoComplete="email"
              placeholder="you@example.com"
            />
          </label>

          <label>
            Password
            <span className="password-field">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                autoComplete={
                  isSignup ? 'new-password' : 'current-password'
                }
                placeholder="At least 8 characters"
              />

              <button
                type="button"
                className="password-toggle"
                onClick={() => setShowPassword((value) => !value)}
              >
                {showPassword ? 'Hide' : 'Show'}
              </button>
            </span>
          </label>

          {isSignup && (
            <>
              <label>
                Confirm password
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(event) =>
                    setConfirmPassword(event.target.value)
                  }
                  autoComplete="new-password"
                  placeholder="Repeat your password"
                />
              </label>

              <fieldset className="role-fieldset">
                <legend>What are you here for?</legend>

                <div className="role-options">
                  <button
                    type="button"
                    className={
                      role === 'freelancer'
                        ? 'role-option active'
                        : 'role-option'
                    }
                    onClick={() => setRole('freelancer')}
                  >
                    <strong>Find work</strong>
                    <span>I’m a freelancer</span>
                  </button>

                  <button
                    type="button"
                    className={
                      role === 'client'
                        ? 'role-option active'
                        : 'role-option'
                    }
                    onClick={() => setRole('client')}
                  >
                    <strong>Hire talent</strong>
                    <span>I have work to give</span>
                  </button>
                </div>
              </fieldset>
            </>
          )}

          {error && (
            <p className="auth-error" role="alert">
              {error}
            </p>
          )}

          <button
            className="primary-button auth-submit"
            type="submit"
            disabled={loading}
          >
            {loading
              ? isSignup
                ? 'Creating account...'
                : 'Logging in...'
              : isSignup
                ? 'Create account'
                : 'Log in'}
          </button>
        </form>

        {!isSignup && (
          <button
            type="button"
            className="forgot-button"
            onClick={() =>
              setError(
                'Password reset will be connected when the authentication backend is added.'
              )
            }
          >
            Forgot password?
          </button>
        )}

        <button
          className="google-button"
          type="button"
          onClick={() =>
            setError(
              'Google sign-in will be connected with the authentication backend.'
            )
          }
        >
          Continue with Google
        </button>

        <p className="auth-switch">
          {isSignup
            ? 'Already have an account?'
            : 'New to PointWave?'}{' '}
          <button
            type="button"
            onClick={() =>
              onModeChange(isSignup ? 'login' : 'signup')
            }
          >
            {isSignup ? 'Log in' : 'Sign up'}
          </button>
        </p>
      </div>
    </div>
  )
}

export default AuthModal