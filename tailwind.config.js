/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          yellow: '#F5D000',
          'yellow-dark': '#D4B200',
          'yellow-light': '#FFF3A3',
          brown: '#3C3430',
          'brown-light': '#5C5450',
          'brown-lighter': '#8C8480',
          green: '#5CE37C',
          'green-dark': '#3CBF5C',
          'green-light': '#BFFFD0',
          cream: '#FAF8F5',
          'off-white': '#F5F0EB',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'Consolas', 'monospace'],
      },
      boxShadow: {
        card: '0 2px 12px 0 rgba(60, 52, 48, 0.08)',
        'card-hover': '0 8px 32px 0 rgba(60, 52, 48, 0.16)',
      },
      animation: {
        'flip-in': 'flipIn 0.4s ease-out',
        'slide-up': 'slideUp 0.3s ease-out',
        'fade-in': 'fadeIn 0.3s ease-out',
        'pulse-green': 'pulseGreen 0.6s ease-in-out',
      },
      keyframes: {
        flipIn: {
          '0%': { transform: 'rotateY(90deg)', opacity: '0' },
          '100%': { transform: 'rotateY(0deg)', opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(16px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        pulseGreen: {
          '0%, 100%': { backgroundColor: 'rgba(92, 227, 124, 0.2)' },
          '50%': { backgroundColor: 'rgba(92, 227, 124, 0.5)' },
        },
      },
    },
  },
  plugins: [],
}
