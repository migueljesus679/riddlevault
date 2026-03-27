import type { Config } from 'tailwindcss';

export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        parchment: '#f4e4ba',
        gold: '#c9a84c',
        'dark-brown': '#2d1810',
        'forest-green': '#1a2e1a',
        'midnight-blue': '#1a1a2e',
        ember: '#8b4513',
        mithril: '#c0c0c0',
        'shadow-black': '#0d0d0d',
      },
      fontFamily: {
        cinzel: ['Cinzel', 'serif'],
        crimson: ['Crimson Text', 'serif'],
        fira: ['Fira Code', 'monospace'],
      },
    },
  },
  plugins: [],
} satisfies Config;
