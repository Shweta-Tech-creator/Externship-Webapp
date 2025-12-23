import axios from 'axios'

// Fix: Robust URL construction
const ENV_URL = import.meta.env.VITE_API_URL || 'https://externship-api.onrender.com';
const BASE_URL = (import.meta.env.DEV && ENV_URL.includes('onrender.com'))
  ? ''
  : ENV_URL.replace(/\/$/, '').replace(/\/api$/, '');

const api = axios.create({
  baseURL: `${BASE_URL}/api`,
  withCredentials: true
})

console.log('Admin API Configured Base URL:', api.defaults.baseURL);

// Add auth token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('adminToken')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

export default api
