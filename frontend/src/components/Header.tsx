"use client";

import Link from 'next/link';

export default function Header() {
  return (
    <header className="w-full bg-gradient-to-r from-greenbrand-400 to-greenbrand-200 shadow-sm py-4">
      <div className="max-w-6xl mx-auto px-4 flex items-center justify-between">
        <Link href="/" className="text-white font-bold text-lg">VetScheduler</Link>
        <nav className="flex gap-3">
        </nav>
      </div>
    </header>
  );
}
