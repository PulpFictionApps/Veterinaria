/**
 * Sistema unificado de paletas de colores para Vetrium
 * Usa variables CSS definidas en globals.css para máxima consistencia
 */

export interface ColorPalette {
  id: string;
  name: string;
  description: string;
  primary: string;
  secondary: string;
  gradientPrimary: string;
  gradientSecondary: string;
  gradientMixed: string;
}

export const COLOR_PALETTES: ColorPalette[] = [
  {
    id: 'veterinary-professional',
    name: 'Veterinario Profesional',
    description: 'Azul médico con verde salud - profesional y confiable',
    primary: '#3b82f6',
    secondary: '#10b981',
    gradientPrimary: 'linear-gradient(135deg, #3b82f6, #1d4ed8)',
    gradientSecondary: 'linear-gradient(135deg, #10b981, #047857)',
    gradientMixed: 'linear-gradient(135deg, #3b82f6, #10b981)'
  },
  {
    id: 'ocean-fresh',
    name: 'Océano Fresco',
    description: 'Tonos azules y verdes que transmiten calma y frescura',
    primary: '#0ea5e9',
    secondary: '#06b6d4',
    gradientPrimary: 'linear-gradient(135deg, #0ea5e9, #0284c7)',
    gradientSecondary: 'linear-gradient(135deg, #06b6d4, #0891b2)',
    gradientMixed: 'linear-gradient(135deg, #0ea5e9, #06b6d4)'
  },
  {
    id: 'warm-care',
    name: 'Cuidado Cálido',
    description: 'Naranjas y rojos suaves que transmiten calidez y cuidado',
    primary: '#f97316',
    secondary: '#ef4444',
    gradientPrimary: 'linear-gradient(135deg, #f97316, #ea580c)',
    gradientSecondary: 'linear-gradient(135deg, #ef4444, #dc2626)',
    gradientMixed: 'linear-gradient(135deg, #f97316, #ef4444)'
  },
  {
    id: 'nature-zen',
    name: 'Naturaleza Zen',
    description: 'Verdes naturales que inspiran tranquilidad y bienestar',
    primary: '#22c55e',
    secondary: '#10b981',
    gradientPrimary: 'linear-gradient(135deg, #22c55e, #16a34a)',
    gradientSecondary: 'linear-gradient(135deg, #10b981, #059669)',
    gradientMixed: 'linear-gradient(135deg, #22c55e, #10b981)'
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
 * Aplica una paleta de colores al documento actualizando las variables CSS
 */
export function applyPalette(paletteId: string) {
  const palette = getPaletteById(paletteId);
  if (!palette || typeof document === 'undefined') return;

  const root = document.documentElement;
  
  // Actualizar variables CSS con los colores de la paleta seleccionada
  root.style.setProperty('--primary-500', palette.primary);
  root.style.setProperty('--secondary-500', palette.secondary);
  root.style.setProperty('--gradient-primary', palette.gradientPrimary);
  root.style.setProperty('--gradient-secondary', palette.gradientSecondary);
  root.style.setProperty('--gradient-mixed', palette.gradientMixed);
  
  // Actualizar sombras para que coincidan con los colores primarios
  const primaryColor = palette.primary;
  const primaryRgb = hexToRgb(primaryColor);
  if (primaryRgb) {
    root.style.setProperty('--shadow-primary', `0 4px 20px rgba(${primaryRgb.r}, ${primaryRgb.g}, ${primaryRgb.b}, 0.25)`);
  }
}

/**
 * Convierte un color hex a RGB
 */
function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16)
  } : null;
}