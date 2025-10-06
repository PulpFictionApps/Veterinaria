/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        // Paleta neutral uniforme - tonos de gris y blanco
        primary: {
          50: '#ffffff',    // Blanco puro
          100: '#fafafa',   // Blanco humo
          200: '#f5f5f5',   // Gris muy claro
          300: '#e5e5e5',   // Gris claro
          400: '#d4d4d4',   // Gris medio claro
          500: '#a3a3a3',   // Gris medio
          600: '#737373',   // Gris oscuro medio
          700: '#525252',   // Gris oscuro
          800: '#404040',   // Gris muy oscuro
          900: '#262626'    // Casi negro
        },
        secondary: {
          50: '#f9fafb',    // Blanco cálido
          100: '#f3f4f6',   // Gris cálido muy claro
          200: '#e5e7eb',   // Gris cálido claro
          300: '#d1d5db',   // Gris cálido medio claro
          400: '#9ca3af',   // Gris cálido medio
          500: '#6b7280',   // Gris cálido oscuro medio
          600: '#4b5563',   // Gris cálido oscuro
          700: '#374151',   // Gris cálido muy oscuro
          800: '#1f2937',   // Casi negro cálido
          900: '#111827'    // Negro cálido
        },
        accent: {
          50: '#f8fafc',    // Blanco azulado muy sutil
          100: '#f1f5f9',   // Gris azulado muy claro
          200: '#e2e8f0',   // Gris azulado claro
          300: '#cbd5e1',   // Gris azulado medio claro
          400: '#94a3b8',   // Gris azulado medio
          500: '#64748b',   // Gris azulado oscuro medio
          600: '#475569',   // Gris azulado oscuro
          700: '#334155',   // Gris azulado muy oscuro
          800: '#1e293b',   // Casi negro azulado
          900: '#0f172a'    // Negro azulado
        },
        // Mantenemos colores de estado para feedback
        success: {
          50: '#f0fdf4',
          500: '#22c55e',
          600: '#16a34a'
        },
        warning: {
          50: '#fffbeb',
          500: '#f59e0b',
          600: '#d97706'
        },
        danger: {
          50: '#fef2f2',
          500: '#ef4444',
          600: '#dc2626'
        }
      },
      backgroundImage: {
        'gradient-primary': 'linear-gradient(135deg, #fafafa 0%, #f5f5f5 50%, #e5e5e5 100%)',
        'gradient-secondary': 'linear-gradient(135deg, #f9fafb 0%, #f3f4f6 50%, #e5e7eb 100%)',
        'gradient-mixed': 'linear-gradient(135deg, #525252 0%, #404040 50%, #262626 100%)',
        'gradient-soft': 'linear-gradient(180deg, rgba(255,255,255,0.95), rgba(250,250,250,0.85))',
        'gradient-card': 'linear-gradient(135deg, rgba(255,255,255,0.98), rgba(249,250,251,0.95))',
        'gradient-subtle': 'linear-gradient(135deg, #ffffff 0%, #fafafa 100%)'
      },
      boxShadow: {
        'subtle': '0 1px 3px rgba(0, 0, 0, 0.05)',
        'soft': '0 4px 12px rgba(0, 0, 0, 0.08)',
        'medium': '0 8px 25px rgba(0, 0, 0, 0.12)',
        'large': '0 15px 35px rgba(0, 0, 0, 0.15)',
        'card': '0 2px 8px rgba(0, 0, 0, 0.06)',
        'card-hover': '0 6px 20px rgba(0, 0, 0, 0.12)',
        'inner-subtle': 'inset 0 1px 2px rgba(0, 0, 0, 0.04)'
      }
    }
  },
  plugins: [],
}
