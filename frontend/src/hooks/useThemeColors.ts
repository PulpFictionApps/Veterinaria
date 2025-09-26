'use client';

import { useTheme } from '../lib/theme-context';

export const useThemeColors = () => {
  const { colors } = useTheme();
  
  return {
    // Colores directos
    ...colors,
    
    // Clases CSS dinámicas (para uso con style props)
    styles: {
      primaryButton: {
        background: colors.primaryGradient,
        color: 'white',
        boxShadow: colors.shadowPrimary,
        transition: 'all 0.2s ease',
        '&:hover': {
          background: colors.primaryHover
        }
      },
      secondaryButton: {
        background: colors.secondaryGradient,
        color: 'white',
        boxShadow: colors.shadowSecondary,
      },
      card: {
        background: colors.cardGradient,
        boxShadow: colors.shadowPrimary,
      },
      navigation: {
        background: colors.primaryGradient,
      }
    },
    
    // Utility functions for inline styles
    getPrimaryButtonStyle: (hover = false) => ({
      background: hover ? colors.primaryHover : colors.primaryGradient,
      color: 'white',
      boxShadow: colors.shadowPrimary,
      transition: 'all 0.2s ease'
    }),
    
    getCardStyle: () => ({
      background: colors.cardGradient,
      boxShadow: colors.shadowPrimary,
    }),
    
    getNavigationIconStyle: () => ({
      background: colors.primaryGradient,
      boxShadow: colors.shadowPrimary,
    })
  };
};