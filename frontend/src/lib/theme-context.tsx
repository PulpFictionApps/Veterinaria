'use client';

import React, { createContext, useContext, useEffect, useState, ReactNode, useMemo, useCallback } from 'react';
import { useAuthContext } from './auth-context';
import { authFetch } from './api';
import { useUserSettings, invalidateCache } from '../hooks/useData';

export interface ThemeColors {
  primary: string;
  secondary: string;
  accent: string;
  primaryHover: string;
  primaryGradient: string;
  secondaryGradient: string;
  bgGradient: string;
  cardGradient: string;
  shadowPrimary: string;
  shadowSecondary: string;
}

interface ThemeContextType {
  colors: ThemeColors;
  updateColors: (primary: string, secondary: string, accent: string) => Promise<void>;
  resetToDefault: () => Promise<void>;
  isLoading: boolean;
}

// Colores por defecto (paleta médica profesional)
const defaultColors = {
  primary: '#2563EB',    // Azul médico profesional
  secondary: '#059669',  // Verde médico/salud
  accent: '#DC2626'      // Rojo médico para urgencias
};

// Función para generar todas las variaciones de color
const generateColorVariations = (primary: string, secondary: string, accent: string): ThemeColors => {
  // Función auxiliar para oscurecer un color (hover)
  const darkenColor = (color: string, amount = 0.1) => {
    const hex = color.replace('#', '');
    const num = parseInt(hex, 16);
    const amt = Math.round(2.55 * amount * 100);
    const R = (num >> 16) + amt;
    const G = (num >> 8 & 0x00FF) + amt;
    const B = (num & 0x0000FF) + amt;
    return '#' + (0x1000000 + (R < 255 ? R < 1 ? 0 : R : 255) * 0x10000 +
      (G < 255 ? G < 1 ? 0 : G : 255) * 0x100 +
      (B < 255 ? B < 1 ? 0 : B : 255))
      .toString(16).slice(1);
  };

  return {
    primary,
    secondary,
    accent,
    primaryHover: darkenColor(primary, -0.1),
    primaryGradient: `linear-gradient(135deg, ${primary}, ${accent})`,
    secondaryGradient: `linear-gradient(135deg, ${secondary}, ${primary})`,
    bgGradient: `linear-gradient(135deg, ${secondary}10, ${primary}05)`,
    cardGradient: `linear-gradient(135deg, rgba(255,255,255,0.9), rgba(255,255,255,0.95))`,
    shadowPrimary: `0 4px 20px ${primary}40`,
    shadowSecondary: `0 8px 30px ${secondary}30`
  };
};

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

interface ThemeProviderProps {
  children: ReactNode;
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  const { userId } = useAuthContext();
  const { settings, isLoading: settingsLoading, revalidate } = useUserSettings(userId);
  
  // Colores por defecto memoizados
  const defaultThemeColors = useMemo(
    () => generateColorVariations(defaultColors.primary, defaultColors.secondary, defaultColors.accent),
    []
  );
  
  const [colors, setColors] = useState<ThemeColors>(defaultThemeColors);
  const [isLoading, setIsLoading] = useState(false);

  // Actualizar colores cuando cambien las configuraciones
  useEffect(() => {
    if (settings?.primaryColor && settings.secondaryColor && settings.accentColor) {
      const newColors = generateColorVariations(
        settings.primaryColor, 
        settings.secondaryColor, 
        settings.accentColor
      );
      setColors(newColors);
    } else {
      setColors(defaultThemeColors);
    }
  }, [settings, defaultThemeColors]);

  // Función para actualizar CSS variables en tiempo real
  const updateCSSVariables = useCallback((themeColors: ThemeColors) => {
    if (typeof document !== 'undefined') {
      const root = document.documentElement;
      root.style.setProperty('--color-primary', themeColors.primary);
      root.style.setProperty('--color-secondary', themeColors.secondary);
      root.style.setProperty('--color-accent', themeColors.accent);
      root.style.setProperty('--color-primary-hover', themeColors.primaryHover);
      root.style.setProperty('--gradient-primary', themeColors.primaryGradient);
      root.style.setProperty('--gradient-secondary', themeColors.secondaryGradient);
      root.style.setProperty('--gradient-bg', themeColors.bgGradient);
      root.style.setProperty('--gradient-card', themeColors.cardGradient);
      root.style.setProperty('--shadow-primary', themeColors.shadowPrimary);
      root.style.setProperty('--shadow-secondary', themeColors.shadowSecondary);
    }
  }, []);

  // Aplicar CSS variables cuando los colores cambien
  useEffect(() => {
    updateCSSVariables(colors);
  }, [colors, updateCSSVariables]);

  const updateColors = useCallback(async (primary: string, secondary: string, accent: string) => {
    if (!userId) return;

    try {
      setIsLoading(true);
      
      const response = await authFetch(`/users/${userId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          primaryColor: primary,
          secondaryColor: secondary,
          accentColor: accent
        })
      });

      if (!response.ok) throw new Error('Error al actualizar colores');

      // Actualizar inmediatamente en el estado local para mejor UX
      const newColors = generateColorVariations(primary, secondary, accent);
      setColors(newColors);
      updateCSSVariables(newColors);
      
      // Revalidar configuraciones del usuario para actualización inmediata
      await revalidate();
      if (userId) invalidateCache.userSettings(userId);
      
    } catch (error) {
      console.error('Error updating colors:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [userId, revalidate, updateCSSVariables]);

  const resetToDefault = useCallback(async () => {
    try {
      await updateColors(defaultColors.primary, defaultColors.secondary, defaultColors.accent);
    } catch (error) {
      console.error('Error resetting to default colors:', error);
      throw error;
    }
  }, [updateColors]);

  // Memoizar el value del context para evitar re-renders
  const contextValue = useMemo(() => ({
    colors,
    updateColors,
    resetToDefault,
    isLoading: isLoading || settingsLoading
  }), [colors, updateColors, resetToDefault, isLoading, settingsLoading]);

  return (
    <ThemeContext.Provider value={contextValue}>
      {children}
    </ThemeContext.Provider>
  );
};