/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#10B981',
          50: '#ECFDF5',
          100: '#D1FAE5',
          200: '#A7F3D0',
          300: '#6EE7B7',
          400: '#34D399',
          500: '#10B981',
          600: '#059669',
          700: '#047857',
          800: '#065F46',
          900: '#064E3B',
        },
        secondary: {
          DEFAULT: '#F0EBE3',
          50: '#2C2420',
          100: '#3A322C',
          200: '#4A4038',
          300: '#6A6058',
          400: '#8A8078',
          500: '#B0A898',
          600: '#D0C8B8',
          700: '#F0EBE3',
          800: '#f5f2ed',
          900: '#ffffff',
        },
        background: '#2C2420',
        surface: '#3A322C',
        border: '#4A4038',
        accent: '#1A3A2A',
        warning: '#D4A017',
        danger: '#B91C1C',
        sidebar: {
          DEFAULT: '#483C32',
          accent: '#5A4E42',
          foreground: '#FFFFFF',
          border: 'rgba(255,255,255,0.12)',
          primary: {
            DEFAULT: '#10B981',
            foreground: '#FFFFFF',
          },
          'accent-foreground': 'rgba(255,255,255,0.75)',
        },
      },
    },
  },
  plugins: [],
};
