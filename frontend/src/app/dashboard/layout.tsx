"use client";

import Navbar from '../../components/Navbar';
import Sidebar from '../../components/Sidebar';
import BottomNav from '../../components/BottomNav';
import { useAuthContext } from '../../lib/auth-context';
import { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { brand } from '../../lib/theme';

// Component that uses useSearchParams wrapped in Suspense
function SidebarStateTracker({ onSidebarStateChange }: { onSidebarStateChange: (isOpen: boolean) => void }) {
  const search = useSearchParams();
  
  useEffect(() => {
    const menuOpen = search?.get('menu') === 'open';
    onSidebarStateChange(menuOpen);
  }, [search, onSidebarStateChange]);
  
  return null;
}

// Navbar wrapper with Suspense - only for mobile
function NavbarWithSuspense() {
  return (
    <div className="lg:hidden">
      <Suspense fallback={
        <nav className="bg-white/95 text-gray-700 p-3 sticky top-0 z-40 flex justify-between items-center border-b border-pink-100 backdrop-blur-sm">
          <div className="flex items-center gap-3">
            <button
              aria-label="Abrir menú"
              className="p-2 rounded-md hover:bg-pink-50 transition-colors"
              disabled
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-gradient-to-r from-pink-400 to-pink-500 rounded-lg flex items-center justify-center shadow-lg shadow-pink-200/50">
                <span className="text-white text-sm font-bold">{brand.shortName}</span>
              </div>
              <span className="hidden sm:inline font-semibold text-gray-800">{brand.name}</span>
            </div>
          </div>
        </nav>
      }>
        <Navbar />
      </Suspense>
    </div>
  );
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
    <div className="min-h-screen bg-pink-50">
      {/* Suspense wrapper for useSearchParams */}
      <Suspense fallback={null}>
        <SidebarStateTracker onSidebarStateChange={handleSidebarStateChange} />
      </Suspense>
      
      {/* Mobile Navbar - only shows on mobile */}
      <NavbarWithSuspense />
      
      {/* Desktop Layout */}
      <div className="hidden lg:flex lg:h-full">
        <Sidebar />
        <div className="flex-1 flex flex-col min-h-0">
          {/* No navbar needed on desktop - sidebar has branding */}
          <main className="flex-1 overflow-auto p-6 min-h-0 dashboard-content">
            <div className="dashboard-center">
              {children}
            </div>
          </main>
        </div>
      </div>

      {/* Mobile Layout */}
      <div className="lg:hidden flex flex-col min-h-screen">
        {/* NavbarWithSuspense is already rendered above */}
        {/* add bottom padding so content isn't hidden behind BottomNav */}
        <main className="flex-1 overflow-auto p-4 pb-28">{children}</main>
        {/* Only show BottomNav when sidebar is closed */}
        {!isSidebarOpen && <BottomNav />}
      </div>
    </div>
  );
}
