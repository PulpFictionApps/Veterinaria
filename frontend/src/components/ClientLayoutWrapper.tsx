'use client';

import { usePathname } from 'next/navigation';

// Simple wrapper without ThemeWrapper since it was removed during cleanup
export default function ClientLayoutWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isDashboard = pathname?.startsWith('/dashboard');

  // Apply basic styling based on route
  const className = isDashboard 
    ? 'min-h-screen bg-gray-50' 
    : 'min-h-screen bg-white';

  return (
    <div className={className}>
      {children}
    </div>
  );
}