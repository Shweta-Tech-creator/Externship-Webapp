import { api } from './client';

export async function registerUser({ name, email, password }) {
  const data = await api('/api/auth/register', {
    method: 'POST',
    body: JSON.stringify({ name, email, password })
  });
  if (data?.token) localStorage.setItem('token', data.token);
  const user = data?.user || (data?._id ? { _id: data._id, name: data.name, email: data.email } : undefined);
  return { ...data, user };
}

export async function loginUser({ email, password }) {
  const data = await api('/api/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password })
  });
  if (data?.token) localStorage.setItem('token', data.token);
  const user = data?.user || (data?._id ? { _id: data._id, name: data.name, email: data.email } : undefined);
  return { ...data, user };
}

export async function fetchMe() {
  const data = await api('/api/auth/me');
  const user = data?.user || (data?._id ? { _id: data._id, name: data.name, email: data.email, profilePic: data.profilePic } : undefined);
  return { ...data, user };
}

export function logout() {
  localStorage.removeItem('token');
}

export async function updatePassword({ currentPassword, newPassword }) {
  return api('/api/auth/change-password', {
    method: 'POST',
    body: JSON.stringify({ currentPassword, newPassword })
  });
}

