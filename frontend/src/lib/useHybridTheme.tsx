'use client';

import { useTheme } from './theme-context';
import { theme as staticTheme, createDynamicTheme, brand } from './theme';

/**
 * Hook híbrido que combina el tema estático con el dinámico
 * Proporciona acceso a colores personalizados del usuario y tema por defecto
 */
export const useHybridTheme = () => {
  const { colors: dynamicColors, updateColors, resetToDefault, isLoading } = useTheme();
  
  // Crear tema dinámico basado en los colores actuales del usuario
  const dynamicTheme = createDynamicTheme(
    dynamicColors.primary,
    dynamicColors.secondary, 
    dynamicColors.accent
  );

  return {
    // Colores dinámicos del usuario
    dynamic: {
      colors: dynamicColors,
      theme: dynamicTheme,
      updateColors,
      resetToDefault,
      isLoading
    },
    // Tema estático (fallback y compatibilidad)
    static: staticTheme,
    // Información de marca
    brand,
    // Función helper para obtener color CSS
    getCSSColor: (colorKey: keyof typeof dynamicColors) => {
      return `var(--color-${colorKey.replace(/([A-Z])/g, '-$1').toLowerCase()})`;
    },
    // Función helper para obtener gradiente CSS
    getCSSGradient: (type: 'primary' | 'secondary') => {
      return `var(--gradient-${type})`;
    },
    // Función helper para obtener sombra CSS
    getCSSShadow: (type: 'primary' | 'secondary') => {
      return `var(--shadow-${type})`;
    }
  };
};