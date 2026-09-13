/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#E8EEF5',
          100: '#D1DDEB',
          200: '#A3BCD6',
          300: '#759AC2',
          400: '#4779AE',
          500: '#1E3A5F',
          600: '#18304C',
          700: '#12243A',
          800: '#0C1827',
          900: '#060C13',
          DEFAULT: '#1E3A5F',
        },
        accent: {
          50: '#FDF6EB',
          100: '#FAEDD6',
          200: '#F5D68A',
          300: '#E8A33D',
          400: '#D4922E',
          500: '#C4892A',
          DEFAULT: '#E8A33D',
        },
        success: '#2E9B5E',
        danger: '#E03131',
        warning: '#F59F00',
        info: '#339AF0',
      },
      animation: {
        'fade-in': 'fadeIn 0.3s ease-in-out',
        'slide-up': 'slideUp 0.3s ease-out',
        'slide-down': 'slideDown 0.3s ease-out',
        'scale-in': 'scaleIn 0.2s ease-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        slideDown: {
          '0%': { transform: 'translateY(-10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        scaleIn: {
          '0%': { transform: 'scale(0.95)', opacity: '0' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
      },
    },
  },
  plugins: [],
}
