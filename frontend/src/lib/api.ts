export const API_BASE = process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:4000';

// Debug function to log API calls
function logApiCall(url: string, opts: RequestInit) {
  if (process.env.NODE_ENV === 'development') {
    console.log('🌐 API Call:', {
      url,
      method: opts.method || 'GET',
      headers: opts.headers,
      body: opts.body
    });
  }
}

export async function authFetch(path: string, opts: RequestInit = {}) {
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
  const headers = new Headers(opts.headers || {});
  if (token) headers.set('Authorization', `Bearer ${token}`);
  
  const fullUrl = `${API_BASE}${path}`;
  logApiCall(fullUrl, { ...opts, headers });
  
  try {
    const res = await fetch(fullUrl, { ...opts, headers });
    
    if (process.env.NODE_ENV === 'development') {
      console.log('📡 API Response:', {
        url: fullUrl,
        status: res.status,
        statusText: res.statusText,
        ok: res.ok
      });
    }
    
    return res;
  } catch (error: any) {
    console.error('❌ API Error:', {
      url: fullUrl,
      error: error.message,
      type: error.name
    });
    throw error;
  }
}
