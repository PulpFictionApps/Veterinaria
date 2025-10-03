'use client';

// Hook simplificado - Los colores ahora se manejan con CSS
export const useThemeColors = () => {
  // Valores por defecto usando variables CSS
  const defaultStyles = {
    background: 'var(--gradient-primary)',
    color: 'white',
    boxShadow: 'var(--shadow-primary)',
    transition: 'all 0.2s ease'
  };

  return {
    // Utility functions for inline styles (mantenidas para compatibilidad)
    getPrimaryButtonStyle: (hover = false) => ({
      background: hover ? 'var(--color-primary-hover)' : 'var(--gradient-primary)',
      color: 'white',
      boxShadow: 'var(--shadow-primary)',
      transition: 'all 0.2s ease'
    }),
    
    getCardStyle: () => ({
      background: 'white',
      boxShadow: 'var(--shadow-primary)',
    }),
    
    getNavigationIconStyle: () => ({
      background: 'var(--gradient-primary)',
      boxShadow: 'var(--shadow-primary)',
    }),
    
    // Alias para compatibilidad
    primaryGradient: 'var(--gradient-primary)',
    secondaryGradient: 'var(--gradient-secondary)',
    primary: 'var(--color-primary)',
    secondary: 'var(--color-secondary)',
    accent: 'var(--color-accent)',
    
    // Estilos predefinidos
    styles: {
      primaryButton: defaultStyles,
      secondaryButton: {
        ...defaultStyles,
        background: 'var(--gradient-secondary)',
      },
      card: {
        background: 'white',
        boxShadow: 'var(--shadow-primary)',
      },
      navigation: {
        background: 'var(--gradient-primary)',
      }
    }
  };
};