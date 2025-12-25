import React from 'react';

const HERO_IMG = new URL('../assets/logo.jpg', import.meta.url).href;

export default function Hero({ onLogin, onSignup, isLoggedIn, onGetStarted }) {
  return (
    <section className="hero">
      {/* Background image */}
      <img
        className="hero-image"
        src={HERO_IMG}
        alt="Hero background"
        onError={(e) => { e.target.style.opacity = '0.2'; e.target.style.filter = 'blur(1px)'; }}
      />

      {/* Hero content */}
      <div className="hero-content">
        <div className="hero-left">
          <h1>Kickstart Your Internship Journey</h1>
          <p className="lead">
            Immerse yourself in real-world internship projects designed to enhance your skills and build your professional portfolio. Receive guidance from experienced mentors, collaborate with like-minded peers, and work on challenges that mirror industry standards. Gain practical experience, develop problem-solving abilities, and step confidently into your future career with the knowledge and skills you need to succeed.
          </p>
          <div className="hero-cta">
            {!isLoggedIn ? (
              <>
                <button className="btn btn-primary" onClick={onSignup}>
                  Sign Up
                </button>
                <button className="btn btn-ghost" onClick={onLogin}>
                  Login
                </button>
              </>
            ) : (
              <button className="btn btn-primary" onClick={onGetStarted}>
                Get Started
              </button>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
