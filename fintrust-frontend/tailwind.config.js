/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        navy: {
          dark: '#020712',
          deep: '#000205',
          medium: '#080F25',
          light: '#0E1B38',
          glass: 'rgba(2, 7, 18, 0.65)'
        },
        sky: {
          accent: '#59CFFF',
          glow: '#92E0FF',
          dark: '#1E6F9F'
        },
        beige: {
          soft: '#F5E6D3',
          warm: '#E1D0BC',
          dark: '#BBA68D'
        }
      },
      fontFamily: {
        sans: ['Outfit', 'Inter', 'sans-serif'],
      },
      boxShadow: {
        'sky-glow': '0 0 20px rgba(89, 207, 255, 0.25)',
        'sky-glow-lg': '0 0 35px rgba(89, 207, 255, 0.4)',
        'beige-glow': '0 0 20px rgba(245, 230, 211, 0.15)'
      },
      animation: {
        'float-slow': 'float 8s ease-in-out infinite',
        'float-medium': 'float 5s ease-in-out infinite',
        'pulse-glow': 'pulseGlow 2.5s ease-in-out infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px) rotate(0deg)' },
          '50%': { transform: 'translateY(-15px) rotate(2deg)' },
        },
        pulseGlow: {
          '0%, 100%': { opacity: '0.6', filter: 'drop-shadow(0 0 5px rgba(89, 207, 255, 0.3))' },
          '50%': { opacity: '1', filter: 'drop-shadow(0 0 15px rgba(89, 207, 255, 0.6))' },
        }
      }
    },
  },
  plugins: [],
}
