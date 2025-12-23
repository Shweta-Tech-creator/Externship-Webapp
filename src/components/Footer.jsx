import React from 'react'

export default function Footer() {
  const year = 2025
  return (
    <footer className="footer">
      <div className="footer-shell">
        <div className="footer-grid">
          <div className="footer-brand">
            <h3 className="footer-tagline">Build Skills. Build Confidence. Build Your Career.</h3>
            <div className="footer-contact">
              <div>support@internportal.com</div>
              <div>+91 98765 43210</div>
            </div>
          </div>

          <div className="footer-links">
            <div className="footer-col">
              <div className="footer-col-title">Company</div>
              <a href="#about">About Us</a>
              <a href="#internships">Our Internships</a>
              <a href="#contact">Contact</a>
              <a href="#pricing">Pricing Plans</a>
            </div>
            <div className="footer-col">
              <div className="footer-col-title">Resources</div>
              <a href="#faq">FAQ</a>
              <a href="#help">Help Center</a>
              <a href="#assignment">Assignment Support</a>
              <a href="#docs">Documentation</a>
            </div>
            <div className="footer-col">
              <div className="footer-col-title">Follow Us</div>
              <div className="footer-social">
                <a aria-label="Facebook" href="#" className="social-icon" title="Facebook">{/* Facebook */}
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M22 12a10 10 0 1 0-11.5 9.9v-7h-2v-2.9h2V9.5c0-2 1.2-3.2 3-3.2.9 0 1.8.1 1.8.1v2h-1c-1 0-1.3.6-1.3 1.2v1.5h2.3l-.4 2.8h-1.9v7A10 10 0 0 0 22 12"/></svg>
                </a>
                <a aria-label="Instagram" href="#" className="social-icon" title="Instagram">{/* Instagram */}
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M7 2h10a5 5 0 0 1 5 5v10a5 5 0 0 1-5 5H7a5 5 0 0 1-5-5V7a5 5 0 0 1 5-5zm0 2a3 3 0 0 0-3 3v10a3 3 0 0 0 3 3h10a3 3 0 0 0 3-3V7a3 3 0 0 0-3-3H7zm5 3.5A5.5 5.5 0 1 1 6.5 13 5.5 5.5 0 0 1 12 7.5zm0 2A3.5 3.5 0 1 0 15.5 13 3.5 3.5 0 0 0 12 9.5zm5.75-3.25a1.25 1.25 0 1 1-1.25 1.25 1.25 1.25 0 0 1 1.25-1.25z"/></svg>
                </a>
                <a aria-label="LinkedIn" href="#" className="social-icon" title="LinkedIn">{/* LinkedIn */}
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M4.98 3.5C4.98 4.88 3.86 6 2.5 6S0 4.88 0 3.5 1.12 1 2.5 1 4.98 2.12 4.98 3.5zM.5 8.5h4V23h-4V8.5zM8.5 8.5h3.8v1.98h.05c.53-1 1.83-2.06 3.76-2.06 4.02 0 4.76 2.64 4.76 6.06V23h-4v-6.4c0-1.53-.03-3.5-2.13-3.5-2.13 0-2.46 1.66-2.46 3.38V23h-4V8.5z"/></svg>
                </a>
                <a aria-label="YouTube" href="#" className="social-icon" title="YouTube">{/* YouTube */}
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M23.5 6.2a3 3 0 0 0-2.1-2.1C19.6 3.5 12 3.5 12 3.5s-7.6 0-9.4.6A3 3 0 0 0 .5 6.2 31.1 31.1 0 0 0 0 12a31.1 31.1 0 0 0 .6 5.8 3 3 0 0 0 2.1 2.1c1.8.6 9.3.6 9.3.6s7.6 0 9.4-.6a3 3 0 0 0 2.1-2.1A31.1 31.1 0 0 0 24 12a31.1 31.1 0 0 0-.5-5.8zM9.8 15.5V8.5l6.2 3.5-6.2 3.5z"/></svg>
                </a>
              </div>
            </div>
          </div>

          <div className="footer-newsletter">
            <label htmlFor="newsletter" className="newsletter-label">Stay updated</label>
            <div className="newsletter-row">
              <input id="newsletter" type="email" placeholder="Enter your email" className="newsletter-input" />
              <button className="newsletter-btn" type="button">Subscribe</button>
            </div>
          </div>
        </div>

        <div className="footer-bottom">
          <div>© {year} InternPortal. All Rights Reserved.</div>
          <div className="footer-legal">
            <a href="#privacy">Privacy Policy</a>
            <span className="sep">|</span>
            <a href="#terms">Terms & Conditions</a>
          </div>
        </div>
      </div>
    </footer>
  )
}
