/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
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
