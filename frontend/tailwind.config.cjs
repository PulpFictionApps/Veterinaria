/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        greenbrand: {
          50: '#f3fbf6',
          100: '#e6f7ed',
          200: '#c0efd5',
          300: '#9be6bc',
          400: '#55d694',
          500: '#2cc67a',
          600: '#22a763',
          700: '#1a7f4c',
          800: '#135b37',
          900: '#0b3b24'
        }
      },
      backgroundImage: {
        'green-gradient': 'linear-gradient(135deg, #dff8ec 0%, #a6f0c9 50%, #55d694 100%)',
        'soft-gradient': 'linear-gradient(180deg, rgba(255,255,255,0.6), rgba(255,255,255,0.2))'
      }
    }
  },
  plugins: [],
}
