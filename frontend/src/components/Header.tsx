"use client";

import Link from 'next/link';
import { brand } from '../lib/constants';

export default function Header() {
  return (
    <header className="w-full bg-white/95 py-3 border-b border-pink-100 backdrop-blur-sm sticky top-0 z-40">
      <div className="max-w-6xl mx-auto px-4 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-3">
          <div className="w-8 h-8 bg-gradient-to-r from-pink-400 to-pink-500 rounded-lg flex items-center justify-center shadow-lg shadow-pink-200/50">
            <span className="text-white text-sm font-bold">{brand.shortName}</span>
          </div>
          <span className="hidden sm:inline font-semibold text-gray-800">{brand.name}</span>
        </Link>

        <div className="flex items-center gap-3">
          <Link href="/login" className="text-gray-600 hover:text-pink-600 transition-colors">
            Iniciar sesión
          </Link>
          <Link href="/register" className="bg-gradient-to-r from-pink-400 to-pink-500 text-white px-4 py-2 rounded-lg hover:from-pink-500 hover:to-pink-600 transition-all shadow-lg shadow-pink-200/50">
            Comenzar
          </Link>
        </div>
      </div>
    </header>
  );
}
