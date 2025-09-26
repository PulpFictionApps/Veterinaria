'use client';

import { useTheme } from '../lib/theme-context';

interface ThemeWrapperProps {
  children: React.ReactNode;
  isDashboard?: boolean;
}

export default function ThemeWrapper({ children, isDashboard = false }: ThemeWrapperProps) {
  const { colors } = useTheme();

  if (!isDashboard) {
    // Para rutas públicas, usar el tema por defecto (sin contexto dinámico)
    return (
      <div className="bg-gradient-to-br from-slate-50 to-slate-100 min-h-screen">
        {children}
      </div>
    );
  }

  // Para dashboard, usar colores dinámicos del contexto
  return (
    <div 
      className="min-h-screen transition-all duration-300"
      style={{
        background: colors.bgGradient
      }}
    >
      {children}
    </div>
  );
}