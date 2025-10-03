"use client";

import { createContext, useContext, useEffect, ReactNode, useCallback, useState } from 'react';
import { 
  COLOR_PALETTES, 
  ColorPalette, 
  getPaletteById, 
  getDefaultPalette,
  applyPalette
} from './color-palettes';

interface ThemeContextType {
  currentPalette: ColorPalette;
  setPalette: (paletteId: string) => void;
  isLoading: boolean;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [currentPalette, setCurrentPalette] = useState<ColorPalette>(getDefaultPalette());
  const [isLoading, setIsLoading] = useState(true);

  // Cargar la paleta guardada del localStorage al montar
  useEffect(() => {
    const savedPaletteId = localStorage.getItem('selectedPalette');
    if (savedPaletteId) {
      const palette = getPaletteById(savedPaletteId);
      if (palette) {
        setCurrentPalette(palette);
        applyPalette(savedPaletteId);
      }
    } else {
      // Aplicar paleta por defecto
      applyPalette(getDefaultPalette().id);
    }
    setIsLoading(false);
  }, []);

  // Función para cambiar la paleta
  const setPalette = useCallback((paletteId: string) => {
    const palette = getPaletteById(paletteId);
    if (!palette) return;

    setCurrentPalette(palette);
    applyPalette(paletteId);
    
    // Guardar en localStorage
    localStorage.setItem('selectedPalette', paletteId);
  }, []);

  return (
    <ThemeContext.Provider value={{
      currentPalette,
      setPalette,
      isLoading
    }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}