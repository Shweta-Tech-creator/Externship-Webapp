import { api } from './client';

export async function submitContact({ name, email, message }) {
  return api('/api/contact', {
    method: 'POST',
    body: JSON.stringify({ name, email, message })
  });
}

export async function listContacts() {
  return api('/api/contact');
}
