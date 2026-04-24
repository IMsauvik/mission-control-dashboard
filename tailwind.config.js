/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        'imeco-green': '#22c55e',
        'imeco-green-light': '#4ade80',
        'imeco-green-dark': '#16a34a',
        'imeco-bg': '#060c18',
        'imeco-card': '#0a1628',
        'imeco-border': '#1a2d45',
        'imeco-surface': '#0d1f35',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      animation: {
        'pulse-green': 'pulse-green 2s ease-in-out infinite',
        shimmer: 'shimmer 2s linear infinite',
      },
      keyframes: {
        'pulse-green': {
          '0%, 100%': { opacity: 1 },
          '50%': { opacity: 0.4 },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
      },
    },
  },
  plugins: [],
}
