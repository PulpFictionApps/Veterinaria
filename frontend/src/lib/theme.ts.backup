// Theme configuration for veterinary app with dynamic color support
export const defaultTheme = {
  colors: {
    primary: {
      50: '#fdf2f8',   // lightest pink
      100: '#fce7f3',  // very light pink
      200: '#fbcfe8',  // light pink
      300: '#f9a8d4',  // medium light pink
      400: '#f472b6',  // medium pink
      500: '#ec4899',  // main pink
      600: '#db2777',  // darker pink
      700: '#be185d',  // dark pink
      800: '#9d174d',  // very dark pink
      900: '#831843',  // darkest pink
    },
    neutral: {
      50: '#fafafa',   // lightest gray
      100: '#f5f5f5',  // very light gray
      200: '#e5e5e5',  // light gray
      300: '#d4d4d4',  // medium light gray
      400: '#a3a3a3',  // medium gray
      500: '#737373',  // main gray
      600: '#525252',  // darker gray
      700: '#404040',  // dark gray
      800: '#262626',  // very dark gray
      900: '#171717',  // darkest gray (almost black)
    }
  },
  gradients: {
    primaryLight: 'bg-gradient-to-r from-pink-50 to-pink-100',
    primaryMedium: 'bg-gradient-to-r from-pink-100 to-pink-200',
    primaryDark: 'bg-gradient-to-r from-pink-200 to-pink-300',
    neutral: 'bg-gradient-to-r from-gray-50 to-white',
  },
  shadows: {
    soft: 'shadow-lg shadow-pink-100/50',
    medium: 'shadow-xl shadow-pink-200/25',
    strong: 'shadow-2xl shadow-pink-300/20',
  }
}

// Dynamic theme function that generates theme based on user colors
export const createDynamicTheme = (primaryColor: string, secondaryColor: string, accentColor: string) => {
  // Helper function to convert hex to RGB
  const hexToRgb = (hex: string) => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16)
    } : null;
  };

  // Helper function to create color variations
  const createColorVariations = (baseColor: string) => {
    const rgb = hexToRgb(baseColor);
    if (!rgb) return defaultTheme.colors.primary;

    const { r, g, b } = rgb;
    
    return {
      50: `rgb(${Math.min(255, r + 40)}, ${Math.min(255, g + 40)}, ${Math.min(255, b + 40)})`,
      100: `rgb(${Math.min(255, r + 35)}, ${Math.min(255, g + 35)}, ${Math.min(255, b + 35)})`,
      200: `rgb(${Math.min(255, r + 25)}, ${Math.min(255, g + 25)}, ${Math.min(255, b + 25)})`,
      300: `rgb(${Math.min(255, r + 15)}, ${Math.min(255, g + 15)}, ${Math.min(255, b + 15)})`,
      400: `rgb(${Math.min(255, r + 10)}, ${Math.min(255, g + 10)}, ${Math.min(255, b + 10)})`,
      500: baseColor,
      600: `rgb(${Math.max(0, r - 10)}, ${Math.max(0, g - 10)}, ${Math.max(0, b - 10)})`,
      700: `rgb(${Math.max(0, r - 20)}, ${Math.max(0, g - 20)}, ${Math.max(0, b - 20)})`,
      800: `rgb(${Math.max(0, r - 30)}, ${Math.max(0, g - 30)}, ${Math.max(0, b - 30)})`,
      900: `rgb(${Math.max(0, r - 40)}, ${Math.max(0, g - 40)}, ${Math.max(0, b - 40)})`,
    };
  };

  return {
    colors: {
      primary: createColorVariations(primaryColor),
      secondary: createColorVariations(secondaryColor),
      accent: createColorVariations(accentColor),
      neutral: defaultTheme.colors.neutral
    },
    gradients: {
      primary: `linear-gradient(135deg, ${primaryColor}, ${accentColor})`,
      secondary: `linear-gradient(135deg, ${secondaryColor}, ${primaryColor})`,
      neutral: defaultTheme.gradients.neutral,
    },
    shadows: {
      soft: `0 4px 20px ${primaryColor}40`,
      medium: `0 8px 30px ${secondaryColor}30`,
      strong: `0 12px 40px ${accentColor}20`,
    }
  };
};

// Backwards compatibility - export as 'theme' for existing components
export const theme = defaultTheme;

// Brand name configuration
export const brand = {
  name: 'VetCare',
  shortName: 'VC',
  tagline: 'Tu clínica veterinaria digital',
  description: 'Gestión profesional para clínicas veterinarias modernas'
}

// Predefined color schemes
export const colorSchemes = {
  pink: {
    primary: '#EC4899',
    secondary: '#F9A8D4', 
    accent: '#BE185D',
    name: 'Rosa Pastel'
  },
  blue: {
    primary: '#3B82F6',
    secondary: '#93C5FD',
    accent: '#1D4ED8',
    name: 'Azul Profesional'
  },
  green: {
    primary: '#10B981',
    secondary: '#86EFAC',
    accent: '#047857',
    name: 'Verde Natura'
  },
  orange: {
    primary: '#F59E0B',
    secondary: '#FCD34D',
    accent: '#D97706',
    name: 'Naranja Energía'
  },
  purple: {
    primary: '#8B5CF6',
    secondary: '#C4B5FD',
    accent: '#7C3AED',
    name: 'Púrpura Elegante'
  },
  teal: {
    primary: '#14B8A6',
    secondary: '#7DD3FC',
    accent: '#0891B2',
    name: 'Turquesa Calma'
  }
};