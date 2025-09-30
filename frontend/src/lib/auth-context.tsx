"use client";

import React, { createContext, useContext, useEffect, useState, useCallback, useMemo } from 'react';
import { useRouter } from 'next/navigation';

type AuthContextType = {
  token: string | null;
  userId: number | null;
  login: (token: string) => void;
  logout: () => void;
};

const AuthContext = createContext<AuthContextType>({
  token: null,
  userId: null,
  login: () => {},
  logout: () => {},
});

function decodeUserId(token: string | null): number | null {
  if (!token) return null;
  try {
    const parts = token.split('.');
    if (parts.length < 2) return null;
    const payload = JSON.parse(atob(parts[1].replace(/-/g, '+').replace(/_/g, '/')));
    const id = payload.id ?? payload.userId ?? payload.sub ?? null;
    return typeof id === 'number' ? id : Number(id) || null;
  } catch (err) {
    return null;
  }
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [token, setToken] = useState<string | null>(null);
  const [userId, setUserId] = useState<number | null>(null);
  const router = useRouter();

  useEffect(() => {
    // Initialize from localStorage and sync cookie
    const t = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    if (t) {
      // Sync cookie from localStorage on page load - this ensures middleware can read it
      document.cookie = `token=${t}; path=/; max-age=${60 * 60 * 24 * 7}`; // 7 days
      setToken(t);
      setUserId(decodeUserId(t));
    } else {
      setToken(null);
      setUserId(null);
    }
  }, []);

  const login = useCallback((newToken: string) => {
    localStorage.setItem('token', newToken);
    // also set a cookie so Next.js middleware (server) can read authentication state
    document.cookie = `token=${newToken}; path=/; max-age=${60 * 60 * 24 * 7}`; // 7 days
    setToken(newToken);
    setUserId(decodeUserId(newToken));
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('token');
    // remove cookie
    document.cookie = 'token=; path=/; max-age=0';
    setToken(null);
    setUserId(null);
    router.push('/login');
  }, [router]);

  const value = useMemo(() => ({
    token,
    userId,
    login,
    logout
  }), [token, userId, login, logout]);

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuthContext() {
  return useContext(AuthContext);
}
