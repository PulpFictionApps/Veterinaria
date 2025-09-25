"use client";

import { usePathname } from 'next/navigation';
import Footer from './Footer';

export default function ConditionalFooter() {
  const pathname = usePathname();
  
  // Don't show footer on dashboard pages
  if (pathname?.startsWith('/dashboard')) {
    return null;
  }
  
  // Show footer on all other pages (public pages)
  return <Footer />;
}