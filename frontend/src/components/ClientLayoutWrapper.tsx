'use client';

import { usePathname } from 'next/navigation';
import ThemeWrapper from './ThemeWrapper';

export default function ClientLayoutWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isDashboard = pathname?.startsWith('/dashboard');

  return (
    <ThemeWrapper isDashboard={isDashboard}>
      {children}
    </ThemeWrapper>
  );
}