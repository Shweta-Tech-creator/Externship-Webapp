import React, { useState } from 'react'
import { submitContact } from '../api/contact'

export default function ContactUs() {
  const [msg, setMsg] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    const formEl = e.currentTarget
    const form = new FormData(formEl)
    const name = form.get('name')?.toString() || ''
    const email = form.get('email')?.toString() || ''
    const subject = form.get('subject')?.toString() || ''
    const message = form.get('message')?.toString() || ''
    try {
      setLoading(true)
      setMsg('')
      const combinedMessage = subject ? `${subject}\n\n${message}` : message
      await submitContact({ name, email, message: combinedMessage })
      setMsg('Message sent!')
      formEl?.reset()
    } catch (err) {
      setMsg(err?.message || 'Failed to send')
    } finally {
      setLoading(false)
    }
  }
  return (
    <section id="contact" className="contactus-section">
      <div className="container">
        <h2>Contact Us</h2>
        <p className="contactus-subtext">We'd love to hear from you. Send us a message or reach us through the details alongside.</p>

        <div className="contactus-grid">
          {/* Left: Form */}
          <div className="contactus-form-card">
            <form className="contactus-form" onSubmit={handleSubmit}>
              <div className="form-row">
                <div className="form-field">
                  <label htmlFor="cu-name">Name</label>
                  <input id="cu-name" name="name" type="text" placeholder="Your name" required />
                </div>
                <div className="form-field">
                  <label htmlFor="cu-email">Email</label>
                  <input id="cu-email" name="email" type="email" placeholder="you@example.com" required />
                </div>
              </div>

              <div className="form-field">
                <label htmlFor="cu-subject">Subject</label>
                <input id="cu-subject" name="subject" type="text" placeholder="How can we help?" required />
              </div>

              <div className="form-field">
                <label htmlFor="cu-message">Message</label>
                <textarea id="cu-message" name="message" rows="5" placeholder="Write your message here..." required />
              </div>

              <div className="form-actions">
                <button type="submit" className="btn btn-primary" disabled={loading}>{loading ? 'Please wait…' : 'Send Message'}</button>
              </div>
              {msg && <div className="form-message">{msg}</div>}
            </form>
          </div>

          {/* Right: Info Card */}
    <aside className="contactus-info-card">
  <div className="info-item">
    <div className="info-label">Address</div>
    <div className="info-value">Thane West, Mumbai Metropolitan Region, Maharashtra, India</div>
  </div>

  <div className="info-item">
    <div className="info-label">Phone</div>
    <div className="info-value">+91 93218 87200</div>
  </div>

  <div className="info-item">
    <div className="info-label">Email</div>
    <div className="info-value">support@internshipindia.in</div>
  </div>

  <div className="info-item">
    <div className="info-label">Open Timings</div>
    <div className="info-value">Monday – Friday, 10:00 AM – 7:00 PM IST</div>
  </div>



            <div className="info-social">
              <a aria-label="Twitter" href="#" className="social-btn" title="Twitter">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M22 5.8c-.7.3-1.4.5-2.1.6.8-.5 1.4-1.2 1.7-2.1-.8.5-1.7.9-2.6 1.1A3.7 3.7 0 0 0 12 7.9c0 .3 0 .6.1.9-3-.1-5.7-1.6-7.5-3.9-.3.6-.5 1.2-.5 1.9 0 1.3.7 2.5 1.7 3.3-.6 0-1.2-.2-1.7-.5v.1c0 1.8 1.3 3.2 3 3.5-.3.1-.6.1-.9.1-.2 0-.4 0-.6-.1.4 1.4 1.8 2.5 3.4 2.5A7.5 7.5 0 0 1 2 19.5a10.6 10.6 0 0 0 5.7 1.7c6.8 0 10.6-5.6 10.6-10.6v-.5c.7-.5 1.3-1.1 1.7-1.8Z" fill="currentColor"/>
                </svg>
              </a>
              <a aria-label="LinkedIn" href="#" className="social-btn" title="LinkedIn">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M4.98 3.5C4.98 4.9 3.9 6 2.5 6S0 4.9 0 3.5 1.1 1 2.5 1s2.48 1.1 2.48 2.5ZM.5 8.1h4V23h-4V8.1Zm7.5 0h3.8v2h.1c.5-1 1.8-2.2 3.8-2.2 4 0 4.7 2.6 4.7 6V23h-4v-7.2c0-1.7 0-3.8-2.3-3.8s-2.6 1.8-2.6 3.7V23h-3.7V8.1Z" fill="currentColor"/>
                </svg>
              </a>
              <a aria-label="Instagram" href="#" className="social-btn" title="Instagram">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M7 2h10a5 5 0 0 1 5 5v10a5 5 0 0 1-5 5H7a5 5 0 0 1-5-5V7a5 5 0 0 1 5-5Zm10 2H7a3 3 0 0 0-3 3v10a3 3 0 0 0 3 3h10a3 3 0 0 0 3-3V7a3 3 0 0 0-3-3Zm-5 3.5a5.5 5.5 0 1 1 0 11 5.5 5.5 0 0 1 0-11Zm0 2a3.5 3.5 0 1 0 .001 7.001A3.5 3.5 0 0 0 12 9.5Zm5.75-2.75a.75.75 0 1 1 0 1.5.75.75 0 0 1 0-1.5Z" fill="currentColor"/>
                </svg>
              </a>
            </div>
          </aside>
        </div>
      </div>
    </section>
  )
}

