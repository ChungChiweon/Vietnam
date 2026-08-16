/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        ivory: {
          50: '#FFFCF8',
          100: '#FBF6EF',
          200: '#F5EDE2',
          300: '#EFE3D3',
        },
        blush: {
          50: '#FFF5F5',
          100: '#FDE8E8',
          200: '#FBD0D0',
          300: '#F7B0B0',
          400: '#F08A8A',
          500: '#E66A6A',
          600: '#D04A4A',
        },
        rose: {
          50: '#FDF2F4',
          100: '#FBE5E8',
          200: '#F5CDD3',
          300: '#EBA9B4',
          400: '#DE8493',
          500: '#C9617A',
          600: '#A8455E',
          700: '#87394C',
          800: '#5F2835',
          900: '#3A1820',
        },
        charcoal: {
          700: '#3A2E2E',
          800: '#2A2222',
          900: '#1A1515',
        },
      },
      fontFamily: {
        serif: ['"Playfair Display"', 'Georgia', 'serif'],
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
      },
      boxShadow: {
        soft: '0 2px 12px -2px rgba(168, 69, 94, 0.08)',
        card: '0 4px 24px -6px rgba(168, 69, 94, 0.12)',
        elevated: '0 12px 40px -8px rgba(168, 69, 94, 0.18)',
      },
      borderRadius: {
        '2xl': '1.25rem',
        '3xl': '1.75rem',
      },
      keyframes: {
        'fade-in-up': {
          '0%': { opacity: '0', transform: 'translateY(16px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'fade-in': {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        'scale-in': {
          '0%': { opacity: '0', transform: 'scale(0.96)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        'slide-in-right': {
          '0%': { transform: 'translateX(100%)' },
          '100%': { transform: 'translateX(0)' },
        },
        'slide-up': {
          '0%': { transform: 'translateY(100%)' },
          '100%': { transform: 'translateY(0)' },
        },
        'float': {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-8px)' },
        },
      },
      animation: {
        'fade-in-up': 'fade-in-up 0.6s ease-out forwards',
        'fade-in': 'fade-in 0.5s ease-out forwards',
        'scale-in': 'scale-in 0.4s ease-out forwards',
        'slide-in-right': 'slide-in-right 0.3s ease-out forwards',
        'slide-up': 'slide-up 0.3s ease-out forwards',
        'float': 'float 3s ease-in-out infinite',
      },
    },
  },
  plugins: [],
};
