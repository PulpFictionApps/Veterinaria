"use client";

import { usePathname } from 'next/navigation';
import Link from 'next/link';

// Simple header component since Header was removed during cleanup
function SimpleHeader() {
  return (
    <header className="bg-white border-b border-gray-200">
      <div className="max-w-6xl mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3">
            <div className="w-8 h-8 bg-gradient-to-br from-pink-400 to-pink-600 rounded-lg flex items-center justify-center">
              <span className="text-white text-sm font-bold">VC</span>
            </div>
            <span className="text-xl font-bold text-gray-800">Vetrium</span>
          </Link>
          <div className="flex items-center gap-4">
            <Link href="/login" className="text-gray-600 hover:text-pink-600 transition-colors">
              Iniciar sesión
            </Link>
            <Link href="/register" className="bg-gradient-to-r from-pink-400 to-pink-500 text-white px-4 py-2 rounded-lg hover:from-pink-500 hover:to-pink-600 transition-all">
              Comenzar gratis
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
}

export default function ConditionalHeader() {
  const pathname = usePathname();
  
  // Don't show header on dashboard pages
  if (pathname?.startsWith('/dashboard')) {
    return null;
  }
  
  // Show header on all other pages (public pages)
  return <SimpleHeader />;
}