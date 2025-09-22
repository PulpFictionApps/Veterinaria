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
    <div className="min-h-screen bg-gray-50">
      {/* Desktop Layout */}
  <div className="hidden lg:flex lg:h-full">
        <Sidebar />
        <div className="flex-1 flex flex-col min-h-0">
          <Navbar />
          <main className="flex-1 overflow-auto p-6 min-h-0">{children}</main>
        </div>
      </div>

      {/* Mobile Layout */}
      <div className="lg:hidden flex flex-col min-h-screen">
        <Navbar />
        {/* add bottom padding so content isn't hidden behind BottomNav */}
        <main className="flex-1 overflow-auto p-4 pb-28">{children}</main>
        <BottomNav />
      </div>
    </div>
  );
}
