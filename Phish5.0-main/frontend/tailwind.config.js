/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        cyber: {
          50: '#f0f9ff',
          100: '#e0f2fe',
          200: '#bae6fd',
          300: '#7dd3fc',
          400: '#38bdf8',
          500: '#0ea5e9',
          600: '#0284c7',
          700: '#0369a1',
          800: '#075985',
          900: '#0c4a6e',
        },
        neon: {
          blue: '#00d4ff',
          green: '#00ff88',
          red: '#ff0055',
          yellow: '#ffcc00',
          purple: '#9b59b6',
        },
        dark: {
          900: '#020617',
          800: '#0f172a',
          700: '#1e293b',
          600: '#334155',
          500: '#475569',
        }
      },
      backgroundImage: {
        'cyber-gradient': 'linear-gradient(135deg, #0f172a 0%, #020617 100%)',
        'card-gradient': 'linear-gradient(135deg, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0.02) 100%)',
        'neon-glow': 'radial-gradient(ellipse at center, rgba(0,212,255,0.15) 0%, transparent 70%)',
      },
      boxShadow: {
        'neon-blue': '0 0 20px rgba(0, 212, 255, 0.5)',
        'neon-green': '0 0 20px rgba(0, 255, 136, 0.5)',
        'neon-red': '0 0 20px rgba(255, 0, 85, 0.5)',
        'card': '0 4px 30px rgba(0, 0, 0, 0.3)',
        'card-hover': '0 8px 40px rgba(0, 212, 255, 0.2)',
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'float': 'float 6s ease-in-out infinite',
        'scan': 'scan 2s linear infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-20px)' },
        },
        scan: {
          '0%': { transform: 'translateY(-100%)' },
          '100%': { transform: 'translateY(100%)' },
        },
      },
    },
  },
  plugins: [],
}
