export const API_BASE = process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:4000';

export async function authFetch(path: string, opts: RequestInit = {}) {
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
  const headers = new Headers(opts.headers || {});
  if (token) headers.set('Authorization', `Bearer ${token}`);
  
  const fullUrl = `${API_BASE}${path}`;
  
  try {
    const res = await fetch(fullUrl, { ...opts, headers });
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
