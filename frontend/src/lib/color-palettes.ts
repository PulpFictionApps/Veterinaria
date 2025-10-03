/**
 * Sistema simple de paletas de colores para Vetrium
 * Cada paleta aplica estilos CSS directamente sin JavaScript complejo
 */

export interface ColorPalette {
  id: string;
  name: string;
  description: string;
  cssClass: string; // Clase CSS que se aplicará al body
}

export const COLOR_PALETTES: ColorPalette[] = [
  {
    id: 'medical-classic',
    name: 'Médico Clásico',
    description: 'Rosa médico profesional con toques de salud',
    cssClass: 'theme-medical-classic'
  },
  {
    id: 'ocean-fresh',
    name: 'Océano Fresco',
    description: 'Azules y verdes que transmiten calma y frescura',
    cssClass: 'theme-ocean-fresh'
  },
  {
    id: 'sunset-warm',
    name: 'Atardecer Cálido',
    description: 'Naranjas y rojos que aportan energía y calidez',
    cssClass: 'theme-sunset-warm'
  },
  {
    id: 'nature-zen',
    name: 'Naturaleza Zen',
    description: 'Verdes naturales que inspiran tranquilidad',
    cssClass: 'theme-nature-zen'
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
 * Aplica una paleta de colores al documento
 */
export function applyPalette(paletteId: string) {
  const palette = getPaletteById(paletteId);
  if (!palette || typeof document === 'undefined') return;

  // Remover todas las clases de tema anteriores
  document.body.className = document.body.className
    .replace(/theme-[\w-]+/g, '');
  
  // Agregar la nueva clase de tema
  document.body.classList.add(palette.cssClass);
}