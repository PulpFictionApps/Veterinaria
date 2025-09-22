"use client";

import Navbar from '../../components/Navbar';
import Sidebar from '../../components/Sidebar';
import BottomNav from '../../components/BottomNav';
import { useAuthContext } from '../../lib/auth-context';
import { useEffect } from 'react';

export default function PrivateLayout({ children }: { children: React.ReactNode }) {
  const { token, logout } = useAuthContext();

  // If there's no token, redirect to login on the client
  useEffect(() => {
    if (token === null) {
      // small timeout to avoid next/navigation issues in strict mode
      const t = setTimeout(() => {
        logout();
      }, 50);
      return () => clearTimeout(t);
    }
  }, [token, logout]);

  if (!token) return null;

  return (
    <html lang="es">
      <body className="h-screen flex flex-col bg-gray-100 overflow-hidden">
        <div className="flex flex-1 overflow-hidden">
          <Sidebar />
          <div className="flex-1 flex flex-col min-h-0">
            <Navbar />
            <main className="flex-1 overflow-auto p-4 md:p-6">{children}</main>
          </div>
        </div>
        <BottomNav />
      </body>
    </html>
  );
}
