import { api } from './client';

export async function getMyProfile() {
  return api('/api/profile/me');
}

export async function deleteResume() {
  return api('/api/profile/resume', {
    method: 'DELETE'
  });
}

// Updated to support required fields from profile completion flow
export async function upsertMyProfile({
  fullName,
  email,
  linkedInUrl,
  courseBranchGradYear,
  skills, // array or comma-separated string
  mobile,
  resumeFile
}) {
  const form = new FormData();
  if (fullName) form.append('fullName', fullName);
  if (email) form.append('email', email);
  if (linkedInUrl) form.append('linkedInUrl', linkedInUrl);
  if (courseBranchGradYear) form.append('courseBranchGradYear', courseBranchGradYear);
  if (skills && Array.isArray(skills)) form.append('skills', skills.join(','));
  else if (skills) form.append('skills', skills);
  if (mobile) form.append('mobile', mobile);
  if (resumeFile) form.append('resume', resumeFile);

  return api('/api/profile/me', {
    method: 'POST',
    body: form
  });
}

export async function uploadAvatar(file) {
  const form = new FormData();
  form.append('avatar', file);
  return api('/api/profile/avatar', {
    method: 'POST',
    body: form
  });
}
