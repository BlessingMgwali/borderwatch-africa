/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        navy: {
          DEFAULT: '#0F2044',
          dark: '#0A1628',
          light: '#1a3060',
        },
        orange: {
          DEFAULT: '#E85D24',
          light: '#FFF4EE',
          hover: '#d14f1a',
        },
        success: '#1D9E75',
        warning: '#F2A623',
        danger: '#E24B4A',
        surface: '#F8F9FA',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      animation: {
        'pulse-ring': 'pulse-ring 2s cubic-bezier(0.455, 0.03, 0.515, 0.955) infinite',
        'dash': 'dash 3s linear infinite',
        'count-up': 'count-up 1s ease-out forwards',
      },
      keyframes: {
        'pulse-ring': {
          '0%': { transform: 'scale(0.9)', opacity: '1' },
          '70%': { transform: 'scale(2)', opacity: '0' },
          '100%': { transform: 'scale(2.5)', opacity: '0' },
        },
        'dash': {
          to: { 'stroke-dashoffset': '0' },
        },
      },
    },
  },
  plugins: [],
};
