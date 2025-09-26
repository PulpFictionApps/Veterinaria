// Detectar automáticamente el entorno y usar la URL correcta
const getApiBase = () => {
  // En Vercel (producción)
  if (typeof window !== 'undefined' && window.location.hostname.includes('vercel.app')) {
    return process.env.NEXT_PUBLIC_API_BASE_PROD || 'https://veterinaria-gamma-virid.vercel.app';
  }
  // En desarrollo local
  return process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:4000';
};

export const API_BASE = getApiBase();

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
      error: error.message || 'Network error',
      type: error.name || 'Unknown error',
      status: error.status || 'No status'
    });
    throw error;
  }
}
