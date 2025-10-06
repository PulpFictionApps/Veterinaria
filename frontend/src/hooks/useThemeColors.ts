'use client';

/**
 * Hook unificado para manejar colores del tema
 * Utiliza variables CSS para máxima consistencia y flexibilidad
 */
export const useThemeColors = () => {
  // Estilos base usando el sistema unificado de variables CSS
  const baseStyles = {
    transition: 'all 0.2s ease',
  };

  return {
    // Funciones para obtener estilos inline (compatibilidad con componentes existentes)
    getPrimaryButtonStyle: (hover = false) => ({
      background: 'var(--gradient-primary)',
      color: 'white',
      border: 'none',
      boxShadow: hover ? '0 8px 25px rgba(59, 130, 246, 0.3)' : 'var(--shadow-primary)',
      transform: hover ? 'translateY(-1px)' : 'translateY(0)',
      ...baseStyles
    }),
    
    getSecondaryButtonStyle: (hover = false) => ({
      background: 'var(--gradient-secondary)',
      color: 'white',
      border: 'none',
      boxShadow: hover ? '0 8px 25px rgba(16, 185, 129, 0.3)' : 'var(--shadow-secondary)',
      transform: hover ? 'translateY(-1px)' : 'translateY(0)',
      ...baseStyles
    }),
    
    getCardStyle: (hover = false) => ({
      background: 'white',
      borderRadius: '1rem',
      border: '1px solid #e5e7eb',
      boxShadow: hover ? 'var(--shadow-lg)' : 'var(--shadow-md)',
      transform: hover ? 'translateY(-2px)' : 'translateY(0)',
      ...baseStyles
    }),
    
    getNavigationStyle: () => ({
      background: 'var(--gradient-primary)',
      color: 'white',
      boxShadow: 'var(--shadow-md)',
    }),
    
    getNavigationIconStyle: () => ({
      background: 'var(--gradient-primary)',
      color: 'white',
      boxShadow: 'var(--shadow-primary)',
      borderRadius: '0.5rem',
      padding: '0.5rem',
    }),
    
    // Variables CSS accesibles (para uso en inline styles)
    primary: 'var(--primary-500)',
    secondary: 'var(--secondary-500)',
    primaryGradient: 'var(--gradient-primary)',
    secondaryGradient: 'var(--gradient-secondary)',
    mixedGradient: 'var(--gradient-mixed)',
    
    // Colores de estado
    success: 'var(--success)',
    warning: 'var(--warning)',
    error: 'var(--error)',
    info: 'var(--info)',
    
    // Sombras
    shadowPrimary: 'var(--shadow-primary)',
    shadowSecondary: 'var(--shadow-secondary)',
    shadowMd: 'var(--shadow-md)',
    shadowLg: 'var(--shadow-lg)',
    
    // Estilos predefinidos para componentes comunes
    styles: {
      primaryButton: {
        ...baseStyles,
        background: 'var(--gradient-primary)',
        color: 'white',
        border: 'none',
        boxShadow: 'var(--shadow-primary)',
      },
      secondaryButton: {
        ...baseStyles,
        background: 'var(--gradient-secondary)',
        color: 'white',
        border: 'none',
        boxShadow: 'var(--shadow-secondary)',
      },
      card: {
        ...baseStyles,
        background: 'white',
        borderRadius: '1rem',
        border: '1px solid #e5e7eb',
        boxShadow: 'var(--shadow-md)',
      },
      navigation: {
        background: 'var(--gradient-primary)',
        color: 'white',
        boxShadow: 'var(--shadow-md)',
      }
    }
  };
};