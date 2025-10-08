// Simple cache para API calls
interface CacheEntry<T> {
  data: T;
  timestamp: number;
  ttl: number; // time to live in milliseconds
}

class ApiCache {
  private cache = new Map<string, CacheEntry<unknown>>();
  
  // TTL por defecto: 5 minutos
  private defaultTTL = 5 * 60 * 1000;

  set<T>(key: string, data: T, ttl?: number): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl: ttl || this.defaultTTL
    });
  }

  get<T>(key: string): T | null {
    const entry = this.cache.get(key) as CacheEntry<T> | undefined;
    
    if (!entry) return null;
    
    // Verificar si ha expirado
    if (Date.now() - entry.timestamp > entry.ttl) {
      this.cache.delete(key);
      return null;
    }
    
    return entry.data as T;
  }

  delete(key: string): void {
    this.cache.delete(key);
  }

  clear(): void {
    this.cache.clear();
  }

  // Limpiar entradas expiradas
  cleanup(): void {
    const now = Date.now();
    for (const [key, entry] of this.cache.entries()) {
      if (now - entry.timestamp > entry.ttl) {
        this.cache.delete(key);
      }
    }
  }

  // Expose keys for safe external inspection without leaking internal map
  keys(): string[] {
    return Array.from(this.cache.keys());
  }

  // Delete entries matching predicate
  deleteIf(predicate: (key: string) => boolean): void {
    for (const key of this.keys()) {
      if (predicate(key)) this.cache.delete(key);
    }
  }
}

// Instancia singleton del cache
export const apiCache = new ApiCache();

// Limpiar cache cada 10 minutos
if (typeof window !== 'undefined') {
  setInterval(() => {
    apiCache.cleanup();
  }, 10 * 60 * 1000);
}