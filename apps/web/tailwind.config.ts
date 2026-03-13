import type { Config } from 'tailwindcss';

export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      boxShadow: {
        panel: '0 20px 60px rgba(0, 0, 0, 0.35)',
      },
      colors: {
        aegis: {
          50: '#fff3e8',
          300: '#ffb275',
          400: '#ff964e',
          500: '#ff7a1a',
          600: '#f26800',
          700: '#c95500',
        },
      },
      fontFamily: {
        display: ['Chakra Petch', 'sans-serif'],
        sans: ['Manrope', 'sans-serif'],
        mono: ['IBM Plex Mono', 'monospace'],
      },
    },
  },
  plugins: [],
} satisfies Config;
