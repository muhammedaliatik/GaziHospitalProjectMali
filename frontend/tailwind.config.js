/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        cyber: {
          bg:          '#080C14',
          surface:     '#0E1424',
          card:        '#131B2E',
          cardHover:   '#18233C',
          border:      '#1E293B',
          borderGlow:  '#06B6D433',
        },
        neon: {
          cyan:        '#06B6D4',
          cyanGlow:    '#22D3EE',
          amber:       '#F59E0B',
          amberGlow:   '#FBBF24',
          rose:        '#F43F5E',
          emerald:     '#10B981',
          emeraldGlow: '#34D399',
          purple:      '#8B5CF6',
        },
        severity: {
          normal:       '#10B981',
          mild:         '#F59E0B',
          moderate:     '#F97316',
          severe:       '#EF4444',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'Consolas', 'monospace'],
      },
      boxShadow: {
        neonCyan:  '0 0 20px -3px rgba(6, 182, 212, 0.35)',
        neonAmber: '0 0 20px -3px rgba(245, 158, 11, 0.35)',
        neonRose:  '0 0 20px -3px rgba(244, 63, 94, 0.35)',
        glass:     '0 8px 32px 0 rgba(0, 0, 0, 0.45)',
      },
      animation: {
        'fade-in':    'fadeIn 0.2s ease-out',
        'slide-up':   'slideUp 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'glow':       'glow 2s ease-in-out infinite alternate',
      },
      keyframes: {
        fadeIn:  { from: { opacity: 0 }, to: { opacity: 1 } },
        slideUp: { from: { opacity: 0, transform: 'translateY(12px)' }, to: { opacity: 1, transform: 'translateY(0)' } },
        glow: {
          '0%': { boxShadow: '0 0 5px rgba(6,182,212,0.2)' },
          '100%': { boxShadow: '0 0 20px rgba(6,182,212,0.6)' },
        },
      },
    },
  },
  plugins: [],
}
