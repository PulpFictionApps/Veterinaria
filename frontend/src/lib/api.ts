import { apiCache } from './cache';

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
  const cacheKey = `${opts.method || 'GET'}:${fullUrl}:${JSON.stringify(opts.body || '')}`;
  
  // Para GET requests, intentar usar cache primero
  if (!opts.method || opts.method === 'GET') {
    const cached = apiCache.get(cacheKey);
    if (cached) {
      console.log('🚀 Cache hit for:', path);
      // Retornar una respuesta falsa que simula fetch
      return new Response(JSON.stringify(cached), {
        status: 200,
        statusText: 'OK',
        headers: { 'Content-Type': 'application/json' }
      });
    }
  }
  
  try {
    const fetchOpts: RequestInit = { ...opts, headers, credentials: 'include' };
    const res = await fetch(fullUrl, fetchOpts);
    
    // Cachear respuestas exitosas de GET requests
    if (res.ok && (!opts.method || opts.method === 'GET')) {
      const responseClone = res.clone();
      try {
        const data = await responseClone.json();
        // Cache por 5 minutos para datos generales, 1 minuto para datos dinámicos
        const ttl = path.includes('/appointments') || path.includes('/availability') 
          ? 1 * 60 * 1000  // 1 minuto
          : 5 * 60 * 1000; // 5 minutos
        apiCache.set(cacheKey, data, ttl);
        console.log('💾 Cached response for:', path);
      } catch (e) {
        // Si no se puede parsear JSON, no cachear
      }
    }
    
    // Invalidar cache relacionado en operaciones de escritura
    if (opts.method && ['POST', 'PUT', 'PATCH', 'DELETE'].includes(opts.method)) {
      invalidateRelatedCache(path);
    }
    
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

// Función para invalidar cache relacionado
function invalidateRelatedCache(path: string) {
  if (path.includes('/users')) {
    // Invalidar cache de usuarios
    for (const key of Array.from(apiCache['cache'].keys())) {
      if (key.includes('/users')) {
        apiCache.delete(key);
      }
    }
  }
  
  if (path.includes('/appointments')) {
    // Invalidar cache de citas y disponibilidad
    for (const key of Array.from(apiCache['cache'].keys())) {
      if (key.includes('/appointments') || key.includes('/availability')) {
        apiCache.delete(key);
      }
    }
  }
  
  if (path.includes('/pets') || path.includes('/tutors')) {
    // Invalidar cache de mascotas y tutores
    for (const key of Array.from(apiCache['cache'].keys())) {
      if (key.includes('/pets') || key.includes('/tutors') || key.includes('/clients')) {
        apiCache.delete(key);
      }
    }
  }
}
