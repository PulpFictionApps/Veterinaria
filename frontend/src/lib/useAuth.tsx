"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export function useAuth() {
  const [token, setToken] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    setToken(localStorage.getItem('token'));
  }, []);

  function login(newToken: string) {
    localStorage.setItem('token', newToken);
    setToken(newToken);
  }

  function logout(redirect = '/login') {
    localStorage.removeItem('token');
    setToken(null);
    if (redirect) router.push(redirect);
  }

  function getUserId() {
    try {
      const t = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
      if (!t) return null;
      const parts = t.split('.');
      if (parts.length < 2) return null;
      const payload = JSON.parse(atob(parts[1].replace(/-/g, '+').replace(/_/g, '/')));
      return payload.id ?? payload.userId ?? payload.sub ?? null;
    } catch (err) {
      return null;
    }
  }

  return { token, login, logout, getUserId };
}
