/**
 * Paletas de colores predeterminadas para Vetrium
 * Cada paleta define colores primary, secondary y accent que se aplicarán globalmente
 */

export interface ColorPalette {
  id: string;
  name: string;
  description: string;
  colors: {
    primary: string;
    secondary: string;
    accent: string;
  };
  preview: {
    gradient: string;
    shadow: string;
  };
}

export const COLOR_PALETTES: ColorPalette[] = [
  {
    id: 'medical-classic',
    name: 'Médico Clásico',
    description: 'Rosa médico profesional con toques de salud',
    colors: {
      primary: '#ec4899',   // Pink-500 - Color médico clásico
      secondary: '#10b981', // Emerald-500 - Verde salud
      accent: '#3b82f6'     // Blue-500 - Azul confianza
    },
    preview: {
      gradient: 'linear-gradient(135deg, #ec4899, #10b981)',
      shadow: '0 4px 20px rgba(236, 72, 153, 0.3)'
    }
  },
  {
    id: 'ocean-fresh',
    name: 'Océano Fresco',
    description: 'Azules y verdes que transmiten calma y frescura',
    colors: {
      primary: '#0ea5e9',   // Sky-500 - Azul cielo
      secondary: '#06b6d4', // Cyan-500 - Cian refrescante
      accent: '#14b8a6'     // Teal-500 - Verde agua
    },
    preview: {
      gradient: 'linear-gradient(135deg, #0ea5e9, #14b8a6)',
      shadow: '0 4px 20px rgba(14, 165, 233, 0.3)'
    }
  },
  {
    id: 'sunset-warm',
    name: 'Atardecer Cálido',
    description: 'Naranjas y rojos que aportan energía y calidez',
    colors: {
      primary: '#f97316',   // Orange-500 - Naranja vibrante
      secondary: '#ef4444', // Red-500 - Rojo energético
      accent: '#eab308'     // Yellow-500 - Amarillo brillante
    },
    preview: {
      gradient: 'linear-gradient(135deg, #f97316, #ef4444)',
      shadow: '0 4px 20px rgba(249, 115, 22, 0.3)'
    }
  },
  {
    id: 'nature-zen',
    name: 'Naturaleza Zen',
    description: 'Verdes naturales que inspiran tranquilidad',
    colors: {
      primary: '#22c55e',   // Green-500 - Verde natural
      secondary: '#16a34a', // Green-600 - Verde más profundo
      accent: '#84cc16'     // Lime-500 - Verde lima
    },
    preview: {
      gradient: 'linear-gradient(135deg, #22c55e, #84cc16)',
      shadow: '0 4px 20px rgba(34, 197, 94, 0.3)'
    }
  }
];

/**
 * Obtiene una paleta por su ID
 */
export function getPaletteById(id: string): ColorPalette | undefined {
  return COLOR_PALETTES.find(palette => palette.id === id);
}

/**
 * Obtiene la paleta por defecto
 */
export function getDefaultPalette(): ColorPalette {
  return COLOR_PALETTES[0]; // medical-classic
}

/**
 * Genera variaciones de color para una paleta específica
 */
export function generatePaletteVariations(palette: ColorPalette) {
  const { primary, secondary, accent } = palette.colors;
  
  return {
    primary,
    secondary, 
    accent,
    primaryHover: adjustColorBrightness(primary, -20),
    primaryGradient: `linear-gradient(135deg, ${primary}, ${accent})`,
    secondaryGradient: `linear-gradient(135deg, ${secondary}, ${primary})`,
    bgGradient: `linear-gradient(135deg, ${primary}08, ${secondary}08)`,
    cardGradient: `linear-gradient(135deg, ${primary}10, ${secondary}10)`,
    shadowPrimary: `0 4px 20px ${primary}40`,
    shadowSecondary: `0 4px 20px ${secondary}40`
  };
}

/**
 * Ajusta el brillo de un color hexadecimal
 */
function adjustColorBrightness(hex: string, percent: number): string {
  // Remover el # si existe
  hex = hex.replace('#', '');
  
  // Convertir a RGB
  const num = parseInt(hex, 16);
  const r = (num >> 16) + percent;
  const g = (num >> 8 & 0x00FF) + percent;
  const b = (num & 0x0000FF) + percent;
  
  // Asegurar que los valores estén en el rango 0-255
  const newR = Math.min(255, Math.max(0, r));
  const newG = Math.min(255, Math.max(0, g));
  const newB = Math.min(255, Math.max(0, b));
  
  // Convertir de vuelta a hex
  return `#${(newR << 16 | newG << 8 | newB).toString(16).padStart(6, '0')}`;
}