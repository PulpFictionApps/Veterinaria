"use client";

import NavbarWrapper from '../../components/NavbarWrapper';
import Sidebar from '../../components/Sidebar';
import BottomNav from '../../components/BottomNav';
import { useAuthContext } from '../../lib/auth-context';
import { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';

// Component that uses useSearchParams wrapped in Suspense
function SidebarStateTracker({ onSidebarStateChange }: { onSidebarStateChange: (isOpen: boolean) => void }) {
  const search = useSearchParams();
  
  useEffect(() => {
    const menuOpen = search?.get('menu') === 'open';
    onSidebarStateChange(menuOpen);
  }, [search, onSidebarStateChange]);
  
  return null;
}

export default function PrivateLayout({ children }: { children: React.ReactNode }) {
  const { token, logout } = useAuthContext();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const handleSidebarStateChange = (isOpen: boolean) => {
    setIsSidebarOpen(isOpen);
  };

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
      {/* Suspense wrapper for useSearchParams */}
      <Suspense fallback={null}>
        <SidebarStateTracker onSidebarStateChange={handleSidebarStateChange} />
      </Suspense>
      
      {/* Desktop Layout */}
  <div className="hidden lg:flex lg:h-full">
        <Sidebar />
        <div className="flex-1 flex flex-col min-h-0">
          <NavbarWrapper />
          <main className="flex-1 overflow-auto p-6 min-h-0 dashboard-content">
            <div className="dashboard-center">
              {children}
            </div>
          </main>
        </div>
      </div>

      {/* Mobile Layout */}
      <div className="lg:hidden flex flex-col min-h-screen">
        <NavbarWrapper />
        {/* add bottom padding so content isn't hidden behind BottomNav */}
        <main className="flex-1 overflow-auto p-4 pb-28">{children}</main>
        {/* Only show BottomNav when sidebar is closed */}
        {!isSidebarOpen && <BottomNav />}
      </div>
    </div>
  );
}
