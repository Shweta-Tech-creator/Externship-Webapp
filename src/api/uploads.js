import { api } from './client'

// Projects
export async function listProjects() {
  return api('/api/uploads/projects')
}

export async function createProject(data) {
  return api('/api/uploads/projects', {
    method: 'POST',
    body: JSON.stringify(data),
    headers: { 'Content-Type': 'application/json' },
  })
}

export async function deleteProject(id) {
  return api(`/api/uploads/projects/${id}`, { method: 'DELETE' })
}

// Certificates
export async function listCertificates() {
  return api('/api/uploads/certificates')
}

export async function uploadCertificate(file) {
  const fd = new FormData()
  fd.append('file', file)
  return api('/api/uploads/certificates', { method: 'POST', body: fd })
}

export async function deleteCertificate(id) {
  return api(`/api/uploads/certificates/${id}`, { method: 'DELETE' })
}

// Project Files
export async function listProjectFiles() {
  return api('/api/uploads/project-files')
}

export async function uploadProjectFile(file) {
  const fd = new FormData()
  fd.append('file', file)
  return api('/api/uploads/project-files', { method: 'POST', body: fd })
}

export async function deleteProjectFile(id) {
  return api(`/api/uploads/project-files/${id}`, { method: 'DELETE' })
}
