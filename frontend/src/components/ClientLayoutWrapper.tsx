'use client';

import { usePathname } from 'next/navigation';
import { useTheme } from '../lib/theme-context';
import { useEffect } from 'react';

// Wrapper que aplica colores dinámicos solo en el dashboard
export default function ClientLayoutWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isDashboard = pathname?.startsWith('/dashboard');
  const { colors } = useTheme();

  // Aplicar CSS custom properties solo para páginas del dashboard
  useEffect(() => {
    const root = document.documentElement;
    
    if (isDashboard) {
      // Aplicar colores dinámicos del usuario en el dashboard
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
    } else {
      // Restaurar colores por defecto en páginas públicas (login, registro, home)
      root.style.setProperty('--color-primary', '#EC4899');
      root.style.setProperty('--color-secondary', '#F9A8D4');
      root.style.setProperty('--color-accent', '#BE185D');
      root.style.setProperty('--color-primary-hover', '#DB2777');
      root.style.setProperty('--color-primary-gradient', 'linear-gradient(135deg, #EC4899, #DB2777)');
      root.style.setProperty('--color-secondary-gradient', 'linear-gradient(135deg, #F9A8D4, #EC4899)');
      root.style.setProperty('--color-bg-gradient', 'linear-gradient(135deg, #FDF2F8, #FCE7F3)');
      root.style.setProperty('--color-card-gradient', 'linear-gradient(135deg, #FFFFFF, #FDF2F8)');
      root.style.setProperty('--color-shadow-primary', '0 10px 25px rgba(236, 72, 153, 0.2)');
      root.style.setProperty('--color-shadow-secondary', '0 5px 15px rgba(249, 168, 212, 0.3)');
    }
  }, [colors, isDashboard]);

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