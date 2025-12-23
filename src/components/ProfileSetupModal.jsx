import React, { useState } from 'react'
import { upsertMyProfile } from '../api/profile'

export default function ProfileSetupModal({ defaultName = '', defaultEmail = '', onSuccess, onClose }) {
  const [fullName, setFullName] = useState(defaultName || '')
  const [email, setEmail] = useState(defaultEmail || '')
  const [linkedInUrl, setLinkedInUrl] = useState('')
  const [courseBranchGradYear, setCourseBranchGradYear] = useState('')
  const [skillsInput, setSkillsInput] = useState('') // comma-separated
  const [mobile, setMobile] = useState('')
  const [resumeFile, setResumeFile] = useState(null)
  const [msg, setMsg] = useState('')
  const [loading, setLoading] = useState(false)

  function isValidLinkedIn(url) {
    if (!url) return false
    const re = /^https?:\/\/(www\.)?linkedin\.com\/in\/[A-Za-z0-9\-_%]+\/?$/i
    return re.test(url.trim())
  }

  function handleResumeChange(file) {
    setMsg('')
    if (!file) { setResumeFile(null); return }
    const lower = (file.name || '').toLowerCase()
    const isPdf = file.type === 'application/pdf' || lower.endsWith('.pdf')
    const isDocx = file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' || lower.endsWith('.docx')
    const under10mb = file.size <= 10 * 1024 * 1024
    if (!(isPdf || isDocx)) {
      setMsg('Resume must be a PDF or DOCX file')
      setResumeFile(null)
      return
    }
    if (!under10mb) {
      setMsg('Resume must be <= 10MB')
      setResumeFile(null)
      return
    }
    setResumeFile(file)
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setMsg('')

    if (!isValidLinkedIn(linkedInUrl)) {
      setMsg('Please enter a valid LinkedIn profile URL, e.g. https://www.linkedin.com/in/username')
      return
    }
    if (!resumeFile) {
      setMsg('Please upload your resume (PDF or DOCX, max 10MB)')
      return
    }

    try {
      setLoading(true)
      const skills = skillsInput
        .split(',')
        .map(s => s.trim())
        .filter(Boolean)

      await upsertMyProfile({
        fullName,
        email,
        linkedInUrl: linkedInUrl.trim(),
        courseBranchGradYear: courseBranchGradYear.trim(),
        skills,
        mobile: mobile.trim(),
        resumeFile
      })
      setMsg('Profile saved successfully! Redirecting...')
      setTimeout(() => {
        onSuccess && onSuccess()
      }, 600)
    } catch (err) {
      setMsg(err?.message || 'Failed to save profile')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="modal-overlay" onClick={() => onClose && onClose()}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <h3>Complete your profile</h3>
        {onClose && (
          <button
            type="button"
            className="modal-close"
            onClick={() => onClose()}
            aria-label="Close"
            style={{ position: 'absolute', top: 8, right: 8 }}
          >
            ×
          </button>
        )}

        <form onSubmit={handleSubmit} className="contact-form" style={{ marginTop: 8 }}>
          <div className="form-field">
            <label>Name</label>
            <input value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="Your full name" required />
          </div>

          <div className="form-field">
            <label>Email</label>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" required />
          </div>

          <div className="form-field">
            <label>LinkedIn URL</label>
            <input value={linkedInUrl} onChange={(e) => setLinkedInUrl(e.target.value)} placeholder="https://www.linkedin.com/in/username" required />
          </div>

          <div className="form-field">
            <label>Course / Branch / Graduation year</label>
            <input value={courseBranchGradYear} onChange={(e) => setCourseBranchGradYear(e.target.value)} placeholder="e.g. B.Tech CSE, 2025" required />
          </div>

          <div className="form-field">
            <label>Skills</label>
            <input value={skillsInput} onChange={(e) => setSkillsInput(e.target.value)} placeholder="Add multiple skills, separated by commas" required />
          </div>

          <div className="form-field">
            <label>Mobile Number</label>
            <input
              type="tel"
              value={mobile}
              onChange={(e) => setMobile(e.target.value)}
              placeholder="e.g. 9876543210"
              required
            />
          </div>

          <div className="form-field">
            <label>Upload Resume (PDF or DOCX, max 10MB)</label>
            <input
              type="file"
              accept=".pdf,application/pdf,.docx,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
              onChange={(e) => handleResumeChange(e.target.files?.[0] || null)}
            />
          </div>

          <div className="form-actions">
            <button className="btn btn-primary" type="submit" disabled={loading}>{loading ? 'Saving…' : 'Save & Continue'}</button>
          </div>
        </form>

        {msg && <div className="form-message" style={{ marginTop: 8 }}>{msg}</div>}
      </div>
    </div>
  )
}
