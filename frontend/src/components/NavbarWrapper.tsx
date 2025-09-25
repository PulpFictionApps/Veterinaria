"use client";

import { Suspense } from 'react';
import Navbar from './Navbar';

// Wrapper component that wraps Navbar in Suspense to handle useSearchParams
export default function NavbarWrapper() {
  return (
    <Suspense fallback={
      <nav className="bg-white/0 text-gray-700 p-3 sticky top-0 z-40 flex justify-between items-center border-b border-gray-100">
        <div className="flex items-center gap-3">
          <button
            aria-label="Abrir menú"
            className="lg:hidden p-2 rounded-md hover:bg-gray-100"
            disabled
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-brand-500 rounded-lg flex items-center justify-center">
              <span className="text-white text-sm font-bold">V</span>
            </div>
            <span className="hidden sm:inline font-semibold">Veterinaria</span>
          </div>
        </div>
      </nav>
    }>
      <Navbar />
    </Suspense>
  );
}