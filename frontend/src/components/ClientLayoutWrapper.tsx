'use client';

import { usePathname } from 'next/navigation';

// Wrapper simple que aplica estilos básicos según la ruta
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