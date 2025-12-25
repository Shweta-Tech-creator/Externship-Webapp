import React, { useState, useEffect, useRef } from 'react'

export default function Navbar({ onLogin, onSignup, onGoHome, onGoDashboard, onGoAbout, onGoContact, isLoggedIn, isDashboard, onLogout, user }) {
  const [menuOpen, setMenuOpen] = useState(false)
  const menuRef = useRef(null)
  const buttonRef = useRef(null)

  useEffect(() => {
    function handleClickOutside(e) {
      if (!menuOpen) return
      if (menuRef.current?.contains(e.target) || buttonRef.current?.contains(e.target)) return
      setMenuOpen(false)
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [menuOpen])

  const userName = user?.name || 'User'
  const userEmail = user?.email || 'No email'

  return (
    <header className="navbar">
      <div className="nav-left">
        <div className="nav-logo">EXTERNSHIP</div>
      </div>

      <nav className="nav-links">
        <a href="#home" onClick={(e) => { e.preventDefault(); onGoHome(); }}>Home</a>
        <a href="#features" onClick={(e) => { e.preventDefault(); onGoDashboard(); }}>Features</a>
        <a href="#about" onClick={(e) => { e.preventDefault(); onGoAbout && onGoAbout(); }}>About</a>
        <a href="#contact" onClick={(e) => { e.preventDefault(); onGoContact && onGoContact(); }}>Contact Us</a>
      </nav>

      <div className="nav-actions">
        {isLoggedIn ? (
          <div style={{ position: 'relative', display: 'flex', alignItems: 'center', gap: '12px' }}>
           

            {/* Profile Menu */}
            <button
              ref={buttonRef}
              onClick={() => setMenuOpen((v) => !v)}
              aria-label="User menu"
              style={{
                border: '1px solid #e5e7eb',
                background: '#fff',
                cursor: 'pointer',
                width: 44,
                height: 44,
                borderRadius: '50%',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 2px 8px rgba(0,0,0,0.08)'
              }}
            >
              <span role="img" aria-label="user" style={{ fontSize: 22, lineHeight: 1 }}>👤</span>
            </button>
            {menuOpen && (
              <div
                ref={menuRef}
                style={{
                  position: 'absolute',
                  right: 0,
                  top: '100%',
                  marginTop: 8,
                  background: '#fff',
                  border: '1px solid #e5e7eb',
                  borderRadius: 10,
                  padding: '12px 14px',
                  boxShadow: '0 8px 24px rgba(0,0,0,0.08)',
                  minWidth: 240,
                  zIndex: 1003,
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 6
                }}
              >
                <div style={{ fontSize: 15, fontWeight: 600, color: '#0f172a' }}>{userName}</div>
                <div style={{ fontSize: 13, color: '#475569', marginBottom: 4 }}>{userEmail}</div>
                <div style={{ height: 1, background: '#eef2f7', margin: '6px 0' }} />
                <button
                  onClick={onLogout}
                  style={{
                    width: '100%',
                    textAlign: 'left',
                    background: 'transparent',
                    border: 'none',
                    color: '#b91c1c',
                    cursor: 'pointer',
                    padding: '8px 6px',
                    borderRadius: 6
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.background = '#fef2f2' }}
                  onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent' }}
                >
                  Log Out
                </button>
              </div>
            )}
          </div>
        ) : (
          <>
            <button className="btn btn-ghost" onClick={onLogin}>Login</button>
            <button className="btn btn-primary" onClick={onSignup}>Sign Up</button>
          </>
        )}
      </div>

    </header>
  )
}

