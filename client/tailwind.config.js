/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          green: '#34D399',
          yellow: '#22D3EE',
          'green-light': '#5EEAD4',
        },
        // Accent scale (legacy token name "gold" — values are now teal)
        gold: {
          50: '#F0FDFA',
          100: '#CCFBF1',
          200: '#99F6E4',
          400: '#2DD4BF',
          500: '#14B8A6',
          600: '#0D9488',
          700: '#0F766E',
        },
        navy: {
          50: '#EEF4F6',
          100: '#D8E4E8',
          600: '#16455A',
          700: '#103648',
          800: '#0B2534',
          900: '#071A26',
          950: '#04111A',
        },
        surface: {
          DEFAULT: '#FFFFFF',
          50: '#F3F7F8',
          100: '#E9F0F2',
          200: '#DBE6E9',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        card: '0 1px 3px 0 rgb(0 0 0 / 0.07), 0 1px 2px -1px rgb(0 0 0 / 0.07)',
        'card-md': '0 4px 6px -1px rgb(0 0 0 / 0.07), 0 2px 4px -2px rgb(0 0 0 / 0.07)',
        'card-lg': '0 10px 15px -3px rgb(0 0 0 / 0.08), 0 4px 6px -4px rgb(0 0 0 / 0.08)',
      },
      borderRadius: {
        xl: '0.875rem',
        '2xl': '1.25rem',
      },
    },
  },
  plugins: [],
}
