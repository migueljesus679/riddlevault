/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        dark: '#0a0a0f',
        card: '#13131f',
        'card-hover': '#1a1a2e',
        border: '#2d2d44',
        'green-neon': '#00ff41',
        'green-dim': '#00c832',
      },
      fontFamily: {
        mono: ['JetBrains Mono', 'Courier New', 'monospace'],
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      animation: {
        glitch: 'glitch 2s infinite',
        'pulse-slow': 'pulse 3s infinite',
        'fade-in': 'fadeIn 0.5s ease-out',
        'slide-up': 'slideUp 0.4s ease-out',
      },
      keyframes: {
        glitch: {
          '0%, 100%': { textShadow: '0.05em 0 0 rgba(0,255,65,0.75), -0.05em -0.025em 0 rgba(251,191,36,0.75)' },
          '15%': { textShadow: '-0.05em -0.025em 0 rgba(0,255,65,0.75), 0.025em 0.025em 0 rgba(251,191,36,0.75)' },
          '50%': { textShadow: '0.025em 0.05em 0 rgba(0,255,65,0.75), 0.05em 0 0 rgba(251,191,36,0.75)' },
        },
        fadeIn: {
          from: { opacity: '0' },
          to: { opacity: '1' },
        },
        slideUp: {
          from: { transform: 'translateY(20px)', opacity: '0' },
          to: { transform: 'translateY(0)', opacity: '1' },
        },
      },
    },
  },
  plugins: [],
};
