// Theme configuration for pastel pink veterinary app
export const theme = {
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

// Brand name configuration
export const brand = {
  name: 'VetCare',
  shortName: 'VC',
  tagline: 'Tu clínica veterinaria digital',
  description: 'Gestión profesional para clínicas veterinarias modernas'
}