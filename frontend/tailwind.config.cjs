/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#f7fbfb',
          100: '#eaf7f7',
          200: '#cfeff0',
          300: '#a7e6e4',
          400: '#59d7cc',
          500: '#2fbfb4',
          600: '#26998f',
          700: '#1d736b',
          800: '#145048',
          900: '#0b2b2a'
        },
        accent: {
          50: '#fff6f5',
          100: '#ffebe9',
          200: '#ffd6d2',
          300: '#ffb8ad',
          400: '#ff8a74',
          500: '#ff6f58',
          600: '#ff4f36',
          700: '#d43d2b',
          800: '#a82b20',
          900: '#691713'
        }
      },
      backgroundImage: {
        'brand-gradient': 'linear-gradient(135deg, #eaf7f7 0%, #a7e6e4 50%, #59d7cc 100%)',
        'soft-gradient': 'linear-gradient(180deg, rgba(255,255,255,0.6), rgba(255,255,255,0.2))'
      }
    }
  },
  plugins: [],
}
