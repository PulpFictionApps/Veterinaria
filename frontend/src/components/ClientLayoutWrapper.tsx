'use client';

import { usePathname } from 'next/navigation';
import { useTheme } from '../lib/theme-context';
import { useEffect } from 'react';

// Wrapper que aplica colores dinámicos del tema
export default function ClientLayoutWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isDashboard = pathname?.startsWith('/dashboard');
  const { colors } = useTheme();

  // Aplicar CSS custom properties para los colores dinámicos
  useEffect(() => {
    const root = document.documentElement;
    
    // Aplicar colores como CSS custom properties
    root.style.setProperty('--color-primary', colors.primary);
    root.style.setProperty('--color-secondary', colors.secondary);
    root.style.setProperty('--color-accent', colors.accent);
    root.style.setProperty('--color-primary-hover', colors.primaryHover);
    root.style.setProperty('--color-primary-gradient', colors.primaryGradient);
    root.style.setProperty('--color-secondary-gradient', colors.secondaryGradient);
    root.style.setProperty('--color-bg-gradient', colors.bgGradient);
    root.style.setProperty('--color-card-gradient', colors.cardGradient);
    root.style.setProperty('--color-shadow-primary', colors.shadowPrimary);
    root.style.setProperty('--color-shadow-secondary', colors.shadowSecondary);
  }, [colors]);

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