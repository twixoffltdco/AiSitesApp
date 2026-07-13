import type { Config } from 'tailwindcss';

const config: Config = {
  darkMode: 'class',
  content: [
    './src/app/**/*.{ts,tsx}',
    './src/components/**/*.{ts,tsx}'
  ],
  theme: {
    extend: {
      colors: {
        accent: {
          DEFAULT: '#7c5cff',
          light: '#9c85ff',
          dark: '#5b3df0'
        },
        surface: {
          DEFAULT: '#0f0f14',
          soft: '#16161f',
          card: '#1b1b26',
          border: '#2a2a38'
        }
      },
      borderRadius: {
        xl2: '1.25rem'
      },
      boxShadow: {
        card: '0 4px 24px rgba(0,0,0,0.35)',
        glow: '0 0 0 1px rgba(124,92,255,0.4), 0 0 24px rgba(124,92,255,0.25)'
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif']
      }
    }
  },
  plugins: []
};

export default config;
