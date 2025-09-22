"use client";

import Link from 'next/link';

export default function Header() {
  return (
    <header className="w-full bg-white/0 py-3 border-b border-gray-100">
      <div className="max-w-6xl mx-auto px-4 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-3">
          <div className="w-8 h-8 bg-brand-500 rounded-lg flex items-center justify-center">
            <span className="text-white text-sm font-bold">V</span>
          </div>
          <span className="hidden sm:inline font-semibold text-gray-900">Veterinaria</span>
        </Link>

        <div className="flex items-center gap-3">
          {/* placeholder for future actions (profile, language, help) */}
        </div>
      </div>
    </header>
  );
}
