"use client";

import { usePathname } from 'next/navigation';

// Simple footer component since Footer was removed during cleanup
function SimpleFooter() {
  return (
    <footer className="bg-gray-50 border-t border-gray-200 py-8">
      <div className="max-w-6xl mx-auto px-6 text-center text-gray-600 text-sm">
        <p>© 2025 Sistema Veterinario. Gestiona tus citas de forma simple.</p>
      </div>
    </footer>
  );
}

export default function ConditionalFooter() {
  const pathname = usePathname();
  
  // Don't show footer on dashboard pages
  if (pathname?.startsWith('/dashboard')) {
    return null;
  }
  
  // Show footer on all other pages (public pages)
  return <SimpleFooter />;
}