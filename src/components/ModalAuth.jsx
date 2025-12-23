import React, { useState } from 'react'
import { registerUser, loginUser } from '../api/auth'

export default function ModalAuth({ variant = 'login', onClose, onSwitch, onSuccess }) {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [msg, setMsg] = useState('')
  const [loading, setLoading] = useState(false)
  const [oauthLoading, setOauthLoading] = useState(false)

  const isSignup = variant === 'signup'

  async function handleSubmit(e) {
    e.preventDefault()
    try {
      setLoading(true)
      setMsg('')
      let data
      if (isSignup) {
        data = await registerUser({ name, email, password })
        setMsg('Signed up successfully!')
      } else {
        data = await loginUser({ email, password })
        setMsg('Logged in!')
      }
      const user = data?.user
      onSuccess && user && onSuccess(user)
      onClose && onClose()
    } catch (err) {
      setMsg(err?.message || 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  async function handleGoogleOAuth() {
    try {
      setOauthLoading(true)
      setMsg('Connecting to Google...')
      const base = import.meta.env.VITE_API_URL || 'http://localhost:5001';
      
      // Check if the backend is running
      try {
        const response = await fetch(`${base}/health`, { method: 'HEAD' });
        if (!response.ok) {
          throw new Error('Backend server is not responding');
        }
      } catch (healthErr) {
        setMsg('Backend server is not running. Please start the server first.')
        setOauthLoading(false)
        return;
      }
      
      window.location.href = `${base}/api/auth/oauth/google`;
    } catch (err) {
      setMsg('Failed to connect to Google OAuth. Please check backend configuration.')
      setOauthLoading(false)
    }
  }

  async function handleGitHubOAuth() {
    try {
      setOauthLoading(true)
      setMsg('Connecting to GitHub...')
      const base = import.meta.env.VITE_API_URL || 'http://localhost:5001';
      
      // Check if the backend is running
      try {
        const response = await fetch(`${base}/health`, { method: 'HEAD' });
        if (!response.ok) {
          throw new Error('Backend server is not responding');
        }
      } catch (healthErr) {
        setMsg('Backend server is not running. Please start the server first.')
        setOauthLoading(false)
        return;
      }
      
      window.location.href = `${base}/api/auth/oauth/github`;
    } catch (err) {
      setMsg('Failed to connect to GitHub OAuth. Please check backend configuration.')
      setOauthLoading(false)
    }
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <style>{`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}</style>
        <button className="modal-close" onClick={onClose}>×</button>
        <h3>{isSignup ? 'Create account' : 'Welcome back'}</h3>

        <form onSubmit={handleSubmit} className="auth-form">
          {isSignup && (
            <label className="field">
              <span>Name</span>
              <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Your name" required />
            </label>
          )}

          <label className="field">
            <span>Email</span>
            <input value={email} onChange={(e) => setEmail(e.target.value)} type="email" placeholder="you@example.com" required />
          </label>

          <label className="field">
            <span>Password</span>
            <input value={password} onChange={(e) => setPassword(e.target.value)} type="password" placeholder="••••••" required />
          </label>

          <button className="btn btn-primary" type="submit" disabled={loading}>{loading ? 'Please wait…' : (isSignup ? 'Sign up' : 'Login')}</button>
        </form>

        {msg && <div className="form-message">{msg}</div>}

        <div className="modal-switch">
          {isSignup ? (
            <span>Already have an account? <button className="linkish" onClick={onSwitch}>Login</button></span>
          ) : (
            <span>New here? <button className="linkish" onClick={onSwitch}>Create account</button></span>
          )}
        </div>

        <div className="oauth-divider" style={{ margin: '12px 0', textAlign: 'center', color: '#666', fontSize: 12 }}>
          <span>or continue with</span>
        </div>

        <div className="oauth-buttons" style={{ display: 'flex', gap: 8, justifyContent: 'center' }}>
          <button
            type="button"
            className="btn btn-ghost"
            style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '8px 12px', border: '1px solid #e5e7eb', borderRadius: 8 }}
            onClick={handleGoogleOAuth}
            disabled={oauthLoading}
          >
            {oauthLoading ? (
              <span style={{ width: 16, height: 16, border: '2px solid #ccc', borderTop: '2px solid #1976D2', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 48 48">
                <path fill="#FFC107" d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12 s5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C33.64,6.053,29.082,4,24,4C12.955,4,4,12.955,4,24 s8.955,20,20,20s20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z"/>
                <path fill="#FF3D00" d="M6.306,14.691l6.571,4.819C14.655,16.108,18.961,13,24,13c3.059,0,5.842,1.154,7.961,3.039 l5.657-5.657C33.64,6.053,29.082,4,24,4C16.318,4,9.656,8.337,6.306,14.691z"/>
                <path fill="#4CAF50" d="M24,44c5.166,0,9.86-1.977,13.409-5.197l-6.191-5.238C29.211,35.091,26.715,36,24,36 c-5.202,0-9.619-3.317-11.283-7.953l-6.522,5.025C9.505,39.556,16.227,44,24,44z"/>
                <path fill="#1976D2" d="M43.611,20.083H42V20H24v8h11.303c-0.792,2.237-2.231,4.166-4.094,5.566 c0.001-0.001,0.002-0.001,0.003-0.002l6.191,5.238C36.971,39.205,44,34,44,24C44,22.659,43.862,21.35,43.611,20.083z"/>
              </svg>
            )}
            <span style={{ fontSize: 13 }}>{oauthLoading ? 'Connecting...' : 'Google'}</span>
          </button>

          <button
            type="button"
            className="btn btn-ghost"
            style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '8px 12px', border: '1px solid #e5e7eb', borderRadius: 8 }}
            onClick={handleGitHubOAuth}
            disabled={oauthLoading}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 0.296c-6.63 0-12 5.37-12 12 0 5.302 3.438 9.8 8.205 11.387 0.6 0.113 0.82-0.26 0.82-0.577 0-0.285-0.01-1.04-0.015-2.04-3.338 0.726-4.042-1.61-4.042-1.61-0.546-1.387-1.333-1.757-1.333-1.757-1.09-0.745 0.083-0.73 0.083-0.73 1.205 0.085 1.84 1.237 1.84 1.237 1.07 1.835 2.807 1.305 3.492 0.998 0.108-0.775 0.418-1.305 0.76-1.605-2.665-0.305-5.466-1.332-5.466-5.93 0-1.31 0.468-2.38 1.235-3.22-0.124-0.303-0.535-1.523 0.117-3.176 0 0 1.008-0.322 3.3 1.23 0.957-0.266 1.983-0.399 3.003-0.404 1.02 0.005 2.047 0.138 3.006 0.404 2.29-1.552 3.297-1.23 3.297-1.23 0.653 1.653 0.242 2.873 0.118 3.176 0.77 0.84 1.233 1.91 1.233 3.22 0 4.61-2.804 5.624-5.476 5.922 0.43 0.372 0.823 1.102 0.823 2.222 0 1.606-0.015 2.898-0.015 3.293 0 0.319 0.218 0.694 0.825 0.576C20.565 22.092 24 17.593 24 12.296c0-6.63-5.37-12-12-12z"/>
            </svg>
            <span style={{ fontSize: 13 }}>GitHub</span>
          </button>
        </div>
      </div>
    </div>
  )
}

