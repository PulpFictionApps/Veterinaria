"use client";

import Link from 'next/link';

export default function Header() {
  return (
    // minimal topbar with subtle brand border
    <header className="w-full bg-transparent py-2 border-b border-brand-100">
      <div className="max-w-6xl mx-auto px-4 flex items-center justify-between">
        <div />
        <nav className="flex gap-3" />
      </div>
    </header>
  );
}
