const ENV_URL = import.meta.env.VITE_API_URL || '';
// In development, we usually want to use the local proxy (''), 
// unless VITE_API_URL is explicitly set and we DON'T want to use the proxy.
// If VITE_API_URL is pointing to a remote server, we use it directly IF we aren't using the vite proxy.
// BUT, if we want the local dev experience to be smooth, we prefer the proxy.
const BASE_URL = (import.meta.env.DEV && ENV_URL && !ENV_URL.includes('localhost') && !ENV_URL.includes('127.0.0.1'))
  ? '' // Use proxy in dev if pointing to a remote API
  : (ENV_URL ? ENV_URL.replace(/\/$/, '').replace(/\/api$/, '') : '');

console.log('API Client Initialized v2 (Fixed Double API)'); // Debug to ensure new code is running

function getToken() {
  try {
    return localStorage.getItem('token');
  } catch (_) {
    return null;
  }
}

export async function api(path, options = {}) {
  const headers = new Headers(options.headers || {});
  const token = getToken();
  if (token) headers.set('Authorization', `Bearer ${token}`);

  const isFormData = options.body && typeof FormData !== 'undefined' && options.body instanceof FormData;
  if (!isFormData && !headers.has('Content-Type')) headers.set('Content-Type', 'application/json');

  // Fix: Robust URL construction
  // Ensure path starts with /api if it doesn't already
  let normalizedPath = path;
  if (!normalizedPath.startsWith('/api/') && normalizedPath !== '/api') {
    normalizedPath = normalizedPath.startsWith('/') ? `/api${normalizedPath}` : `/api/${normalizedPath}`;
  }

  // Handle accidental double /api/api
  normalizedPath = normalizedPath.replace(/^\/api\/api\//, '/api/');

  const requestUrl = `${BASE_URL}${normalizedPath}`;

  // Only log in development to avoid console noise in production
  if (import.meta.env.DEV) {
    console.log(`[API Request] ${options.method || 'GET'} ${requestUrl}`);
  }

  let res;
  try {
    // console.log('Fetching:', requestUrl);
    res = await fetch(requestUrl, { ...options, headers });
  } catch (err) {
    console.error('API network error:', { requestUrl, options, err });
    if (path === '/health' || path === '/auth/me') {
      return { error: 'Network error', message: 'Backend unavailable' };
    }
    throw new Error('Network error contacting API. Check that the backend is running and CORS/origin match.');
  }

  const text = await res.text();
  let data;
  try {
    data = text ? JSON.parse(text) : {};
  } catch (e) {
    // If we assume a 200 OK should always be JSON, this is an error.
    // If it's an HTML error page, this will catch it.
    console.error('API JSON Parse Error. Response was:', text.substring(0, 500));
    data = { message: 'Invalid server response (not JSON)', original: text.substring(0, 200) };
  }

  if (!res.ok) {
    const msg = (data && data.message) || `Request failed (${res.status})`;
    console.error(`API Error (${res.status}):`, msg);
    // Log the full text if it was likely HTML
    if (text && text.trim().startsWith('<')) {
      console.error('Server returned HTML instead of JSON:', text.substring(0, 500));
    }

    if (path === '/health' || path === '/auth/me') {
      return { error: msg, message: data.message || msg };
    }
    throw new Error(msg);
  }
  return data;
}
