import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        poke: {
          bg: '#0f0f1a',
          surface: '#161625',
          card: '#1a1a30',
          'card-hover': '#222240',
          input: '#12122a',
          red: '#e94560',
          'red-glow': 'rgba(233, 69, 96, 0.35)',
          'red-subtle': 'rgba(233, 69, 96, 0.12)',
          muted: '#6b6b85',
          secondary: '#9d9db5',
        },
      },
      fontFamily: {
        display: ['Inter', 'Segoe UI', 'system-ui', 'sans-serif'],
      },
      animation: {
        'pokeball-float': 'pokeball-float 3s ease-in-out infinite',
        'dot-bounce': 'dot-bounce 1.2s ease-in-out infinite',
        'card-in': 'card-in 400ms cubic-bezier(0.4,0,0.2,1) both',
      },
      keyframes: {
        'pokeball-float': {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-4px)' },
        },
        'dot-bounce': {
          '0%, 80%, 100%': { transform: 'scale(0.6)', opacity: '0.4' },
          '40%': { transform: 'scale(1)', opacity: '1' },
        },
        'card-in': {
          from: { opacity: '0', transform: 'translateY(16px) scale(0.97)' },
          to: { opacity: '1', transform: 'translateY(0) scale(1)' },
        },
      },
    },
  },
  plugins: [],
};

export default config;