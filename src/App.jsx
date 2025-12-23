import React, { useState, useEffect, useCallback } from 'react'
import { Routes, Route, useNavigate, useLocation } from 'react-router-dom'
import LogoAnimation from './components/LogoAnimation'
import Navbar from './components/Navbar'
import Hero from './components/Hero'
import Sections from './components/Sections'
import Footer from './components/Footer'
import ModalAuth from './components/ModalAuth'
import ProfileSetupModal from './components/ProfileSetupModal'
import Dashboard from './components/Dashboard'
import ErrorBoundary from './components/ErrorBoundary'
import ContactUs from './components/ContactUs'
import AboutUsPage from './pages/AboutUsPage'
import AdminApp from './admin/AdminApp'
import { fetchMe } from './api/auth'

export default function App() {
  const [animationDone, setAnimationDone] = useState(false)
  const [showLogin, setShowLogin] = useState(false)
  const [showSignup, setShowSignup] = useState(false)
  const [showProfileSetup, setShowProfileSetup] = useState(false)
  const [profileEmail, setProfileEmail] = useState('')
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [currentUser, setCurrentUser] = useState(null)
  const [showDashboard, setShowDashboard] = useState(false)
  const [isDark, setIsDark] = useState(false)
  const [pendingAnchor, setPendingAnchor] = useState(null)

  const navigate = useNavigate()
  const location = useLocation()

  useEffect(() => {
    function handleOpenSignup() {
      setShowSignup(true)
    }
    window.addEventListener('openSignup', handleOpenSignup)
    return () => window.removeEventListener('openSignup', handleOpenSignup)
  }, [])

  useEffect(() => {
    console.log('App State Changed:', { showDashboard, isLoggedIn, path: location.pathname, animationDone });
  }, [showDashboard, isLoggedIn, location.pathname, animationDone]);

  useEffect(() => {
    const cls = 'dark'
    if (isDark) document.body.classList.add(cls)
    else document.body.classList.remove(cls)
  }, [isDark])

  const scrollToAnchor = useCallback((id) => {
    const el = document.getElementById(id)
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
  }, [])

  useEffect(() => {
    if (pendingAnchor && location.pathname === '/') {
      const handle = setTimeout(() => {
        scrollToAnchor(pendingAnchor)
        setPendingAnchor(null)
      }, 80)
      return () => clearTimeout(handle)
    }
  }, [pendingAnchor, location.pathname, scrollToAnchor])

  useEffect(() => {
    if (location.pathname !== '/' && !location.pathname.startsWith('/admin')) {
      setShowDashboard(false)
    } else if (location.pathname === '/' && isLoggedIn) {
      // If we're on the home page and user is logged in, ensure dashboard is shown
      setShowDashboard(true)
    }
  }, [location.pathname, isLoggedIn])

  // Load user data from localStorage on app start
  useEffect(() => {
    try {
      const storedUser = localStorage.getItem('currentUser')
      if (storedUser) {
        setCurrentUser(JSON.parse(storedUser))
      }
    } catch (error) {
      console.error('Error loading user data:', error)
    }
  }, [])

  // Capture OAuth token from URL and persist session across reloads
  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const token = params.get('token')
    if (token) {
      try { localStorage.setItem('token', token) } catch { }
      setIsLoggedIn(true)
      setShowDashboard(true)
        // Fetch user data with the new token
        ; (async () => {
          try {
            const me = await fetchMe()
            if (me?.user) {
              setCurrentUser(me.user)
              // Save user data to localStorage
              try {
                localStorage.setItem('currentUser', JSON.stringify(me.user))
              } catch (error) {
                console.error('Error saving user data:', error)
              }
            }
          } catch (error) {
            console.error('Error fetching user data:', error)
          }
        })()
      // Clean URL
      const cleanUrl = window.location.origin + window.location.pathname
      window.history.replaceState({}, '', cleanUrl)
      return
    }
    // If token already exists, validate it
    let cancelled = false
    const existing = (() => { try { return localStorage.getItem('token') } catch { return null } })()
    if (existing) {
      ; (async () => {
        try {
          const me = await fetchMe()
          if (!cancelled) {
            setIsLoggedIn(true)
            // Load user data from API response
            if (me?.user) {
              setCurrentUser(me.user)
              // Update localStorage with fresh user data
              try {
                localStorage.setItem('currentUser', JSON.stringify(me.user))
              } catch (error) {
                console.error('Error saving user data:', error)
              }
              // Show dashboard if we're on the home page
              if (location.pathname === '/') {
                setShowDashboard(true)
              }
            } else if (me?.error) {
              // Backend unavailable, clear invalid token
              console.warn('Backend unavailable, clearing token')
              try { localStorage.removeItem('token') } catch { }
            }
            // Keep current view; if user clicks Dashboard it will open
          }
        } catch (error) {
          if (!cancelled) {
            console.warn('Failed to validate token, clearing it:', error.message)
            // Clear invalid token
            try { localStorage.removeItem('token') } catch { }
            try { localStorage.removeItem('currentUser') } catch { }
            setIsLoggedIn(false)
            setShowDashboard(false)
          }
        }
      })()
    }
    return () => { cancelled = true }
  }, [])

  const handleToggleTheme = () => setIsDark((d) => !d)

  // Handle Dashboard navigation
  const handleGoDashboard = () => {
    if (!isLoggedIn) {
      setShowLogin(true)
    } else {
      setShowDashboard(true)
      if (location.pathname !== '/') navigate('/')
    }
  }

  const handleGoHome = () => {
    setShowDashboard(false)
    if (location.pathname !== '/') navigate('/')
  }

  const handleGoContact = () => {
    if (location.pathname === '/') {
      // On landing page, scroll to contact section
      scrollToAnchor('contact')
    } else if (location.pathname === '/about-us') {
      // On About Us page, scroll to contact section
      scrollToAnchor('contact')
    } else {
      // On any other page, navigate to landing page then scroll
      navigate('/')
      setTimeout(() => {
        scrollToAnchor('contact')
      }, 100)
    }
  }

  const handleGoAbout = () => {
    if (location.pathname !== '/about-us') {
      navigate('/about-us')
      // Ensure we scroll to top after navigation
      setTimeout(() => {
        window.scrollTo({ top: 0, behavior: 'smooth' })
      }, 100)
    } else {
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }

  const handleExploreMore = () => {
    if (location.pathname !== '/about-us') {
      navigate('/about-us')
      // Ensure we scroll to top after navigation
      setTimeout(() => {
        window.scrollTo({ top: 0, behavior: 'smooth' })
      }, 100)
    } else {
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }

  // After login success: go straight to dashboard
  const handleLoginSuccess = (user) => {
    console.log('App: handleLoginSuccess called', user); // Debug Log
    setIsLoggedIn(true)
    setCurrentUser(user)
    // Save user data to localStorage
    try {
      localStorage.setItem('currentUser', JSON.stringify(user))
    } catch (error) {
      console.error('Error saving user data:', error)
    }
    setShowLogin(false)
    setShowDashboard(true)
    // Only navigate if not already on home page
    if (location.pathname !== '/') {
      navigate('/')
    }
  }

  // After signup success: go straight to dashboard with profile completion message
  const handleSignupSuccess = (user) => {
    setCurrentUser(user)
    // Save user data to localStorage
    try {
      localStorage.setItem('currentUser', JSON.stringify(user))
    } catch (error) {
      console.error('Error saving user data:', error)
    }
    setIsLoggedIn(true)
    setShowSignup(false)
    setShowDashboard(true)
    setShowProfileSetup(false)
    // Only navigate if not already on home page
    if (location.pathname !== '/') {
      navigate('/')
    }
  }

  // Handle logout
  const handleLogout = () => {
    setIsLoggedIn(false)
    setCurrentUser(null)
    setShowDashboard(false)
    // Clear user data from localStorage
    try {
      localStorage.removeItem('token')
      localStorage.removeItem('currentUser')
    } catch (error) {
      console.error('Error clearing user data:', error)
    }
  }

  return (
    <div className="app-root">
      <Routes>
        <Route
          path="/"
          element={(
            <>
              {!animationDone && <LogoAnimation onDone={() => setAnimationDone(true)} />}

              {animationDone && !showDashboard && (
                <>
                  <div style={{ position: 'fixed', top: 0, left: 0, right: 0, height: 10, background: 'blue', zIndex: 99999 }}>
                    DEBUG: HOME PAGE (Dashboard=FALSE)
                  </div>
                  <Navbar
                    onLogin={() => setShowLogin(true)}
                    onSignup={() => setShowSignup(true)}
                    onGoHome={handleGoHome}
                    onGoDashboard={handleGoDashboard}
                    onGoAbout={handleGoAbout}
                    onGoContact={handleGoContact}
                    isLoggedIn={isLoggedIn}
                    isDashboard={false}
                    onLogout={handleLogout}
                    user={currentUser}
                  />
                  <Hero onLogin={() => setShowLogin(true)} onSignup={() => setShowSignup(true)} />
                  <Sections onExploreMore={handleExploreMore} />
                  <Footer />
                </>
              )}

              {showDashboard && (
                <>
                  <div style={{ position: 'fixed', top: 0, left: 0, right: 0, height: 10, background: 'red', zIndex: 99999 }}>
                    DEBUG: DASHBOARD IS ACTIVE
                  </div>
                  <Navbar
                    onLogin={() => setShowLogin(true)}
                    onSignup={() => setShowSignup(true)}
                    onGoHome={handleGoHome}
                    onGoDashboard={handleGoDashboard}
                    onGoAbout={handleGoAbout}
                    onGoContact={handleGoContact}
                    isLoggedIn={isLoggedIn}
                    isDashboard={true}
                    onLogout={handleLogout}
                    user={currentUser}
                  />
                  <div style={{ paddingTop: 64 }}>
                    <ErrorBoundary>
                      <Dashboard />
                    </ErrorBoundary>
                  </div>
                  <Footer />
                </>
              )}
            </>
          )}
        />

        <Route
          path="/about-us"
          element={(
            <>
              <Navbar
                onLogin={() => setShowLogin(true)}
                onSignup={() => setShowSignup(true)}
                onGoHome={handleGoHome}
                onGoDashboard={handleGoDashboard}
                onGoAbout={handleGoAbout}
                onGoContact={handleGoContact}
                isLoggedIn={isLoggedIn}
                isDashboard={false}
                onLogout={handleLogout}
                user={currentUser}
              />
              <AboutUsPage />
              <ContactUs />
              <Footer />
            </>
          )}
        />

        <Route path="/admin/*" element={<AdminApp />} />
      </Routes>

      {showLogin && (
        <ModalAuth
          variant="login"
          onClose={() => setShowLogin(false)}
          onSwitch={() => { setShowLogin(false); setShowSignup(true) }}
          onSuccess={handleLoginSuccess}
        />
      )}

      {showSignup && (
        <ModalAuth
          variant="signup"
          onClose={() => setShowSignup(false)}
          onSwitch={() => { setShowSignup(false); setShowLogin(true) }}
          onSuccess={handleSignupSuccess}
        />
      )}

      {showProfileSetup && (
        <ProfileSetupModal
          defaultEmail={profileEmail}
          onClose={() => setShowProfileSetup(false)}
          onSuccess={() => { setShowProfileSetup(false); setShowDashboard(true) }}
        />
      )}
    </div>
  )
}
