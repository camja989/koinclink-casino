/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        casino: {
          gold: '#FFD700',
          darkGreen: '#006400',
          red: '#DC143C',
          purple: '#800080',
          navy: '#000080',
        },
        neon: {
          blue: '#00FFFF',
          pink: '#FF1493',
          green: '#00FF00',
          yellow: '#FFFF00',
        }
      },
      animation: {
        'spin-slow': 'spin 3s linear infinite',
        'pulse-fast': 'pulse 1s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'bounce-slow': 'bounce 2s infinite',
        'glow': 'glow 2s ease-in-out infinite alternate',
      },
      keyframes: {
        glow: {
          from: {
            textShadow: '0 0 5px #fff, 0 0 10px #fff, 0 0 15px #fff',
          },
          to: {
            textShadow: '0 0 10px #fff, 0 0 20px #fff, 0 0 30px #fff',
          },
        },
      },
      fontFamily: {
        'casino': ['serif'],
        'digital': ['monospace'],
      },
      backgroundImage: {
        'casino-gradient': 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f0f23 100%)',
        'gold-gradient': 'linear-gradient(45deg, #FFD700, #FFA500)',
        'neon-gradient': 'linear-gradient(45deg, #00FFFF, #FF1493)',
      }
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
  ],
}
