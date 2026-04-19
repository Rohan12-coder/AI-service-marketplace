/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // ── Dark Luxury Backgrounds ──────────────
        'bg-primary':   '#0A0A0F',
        'bg-secondary': '#12121A',
        'bg-card':      '#1A1A26',
        'bg-elevated':  '#22223A',
        'bg-overlay':   '#0D0D18',

        // ── Gold Accent Palette ──────────────────
        gold: {
          DEFAULT: '#D4AF37',
          light:   '#F0D060',
          muted:   '#A8892B',
          dark:    '#8B6914',
          pale:    '#F5E99A',
          glow:    'rgba(212,175,55,0.15)',
          border:  'rgba(212,175,55,0.2)',
          border2: 'rgba(212,175,55,0.4)',
        },

        // ── Text ────────────────────────────────
        'text-primary':  '#F5F5F5',
        'text-secondary':'#C8C8D8',
        'text-muted':    '#9090A0',
        'text-disabled': '#55556A',

        // ── Status Colors ────────────────────────
        status: {
          success: '#22C55E',
          warning: '#F59E0B',
          error:   '#EF4444',
          info:    '#3B82F6',
        },

        // ── Emergency Red ────────────────────────
        emergency: '#DC2626',
      },

      fontFamily: {
        playfair: ['Playfair Display', 'Georgia', 'serif'],
        dm:       ['DM Sans', 'system-ui', 'sans-serif'],
        mono:     ['JetBrains Mono', 'monospace'],
      },

      fontSize: {
        'hero':   ['clamp(2.5rem, 6vw, 5rem)', { lineHeight: '1.1', letterSpacing: '-0.02em' }],
        'title':  ['clamp(1.75rem, 4vw, 3rem)',  { lineHeight: '1.2', letterSpacing: '-0.01em' }],
        'lead':   ['clamp(1rem, 2vw, 1.25rem)',   { lineHeight: '1.6' }],
      },

      spacing: {
        '18': '4.5rem',
        '22': '5.5rem',
        '30': '7.5rem',
        '88': '22rem',
        '128': '32rem',
      },

      borderRadius: {
        'card':   '16px',
        'button': '8px',
        'input':  '6px',
        'badge':  '4px',
        'pill':   '9999px',
      },

      boxShadow: {
        'card':          '0 4px 24px rgba(0,0,0,0.4)',
        'card-hover':    '0 8px 40px rgba(0,0,0,0.5), 0 0 0 1px rgba(212,175,55,0.3)',
        'gold-glow':     '0 0 20px rgba(212,175,55,0.25)',
        'gold-glow-lg':  '0 0 40px rgba(212,175,55,0.35)',
        'button-gold':   '0 4px 16px rgba(212,175,55,0.3)',
        'button-gold-hover': '0 6px 24px rgba(212,175,55,0.5)',
        'inset-gold':    'inset 0 0 0 1px rgba(212,175,55,0.2)',
        'modal':         '0 24px 80px rgba(0,0,0,0.8)',
        'navbar':        '0 1px 0 rgba(212,175,55,0.1), 0 4px 20px rgba(0,0,0,0.4)',
      },

      backgroundImage: {
        'gradient-gold':        'linear-gradient(135deg, #D4AF37 0%, #F0D060 50%, #A8892B 100%)',
        'gradient-gold-subtle': 'linear-gradient(135deg, rgba(212,175,55,0.1) 0%, rgba(212,175,55,0.05) 100%)',
        'gradient-dark':        'linear-gradient(135deg, #0A0A0F 0%, #12121A 50%, #1A1A26 100%)',
        'gradient-card':        'linear-gradient(145deg, #1A1A26 0%, #12121A 100%)',
        'gradient-hero':        'radial-gradient(ellipse at 70% 50%, rgba(212,175,55,0.08) 0%, transparent 60%), radial-gradient(ellipse at 30% 80%, rgba(59,130,246,0.05) 0%, transparent 50%), linear-gradient(180deg, #0A0A0F 0%, #12121A 100%)',
        'gradient-radial-gold': 'radial-gradient(circle, rgba(212,175,55,0.15) 0%, transparent 70%)',
        'noise':                "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='0.03'/%3E%3C/svg%3E\")",
      },

      animation: {
        'fade-in':      'fadeIn 0.4s ease-out forwards',
        'fade-up':      'fadeUp 0.5s ease-out forwards',
        'fade-down':    'fadeDown 0.5s ease-out forwards',
        'slide-in-right': 'slideInRight 0.4s ease-out forwards',
        'slide-in-left':  'slideInLeft 0.4s ease-out forwards',
        'scale-in':     'scaleIn 0.3s ease-out forwards',
        'spin-slow':    'spin 3s linear infinite',
        'pulse-gold':   'pulseGold 2s ease-in-out infinite',
        'shimmer':      'shimmer 2s linear infinite',
        'bounce-subtle':'bounceSubtle 2s ease-in-out infinite',
        'typewriter':   'typewriter 3s steps(30) infinite',
        'float':        'float 6s ease-in-out infinite',
        'glow-pulse':   'glowPulse 3s ease-in-out infinite',
      },

      keyframes: {
        fadeIn: {
          '0%':   { opacity: '0' },
          '100%': { opacity: '1' },
        },
        fadeUp: {
          '0%':   { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        fadeDown: {
          '0%':   { opacity: '0', transform: 'translateY(-20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideInRight: {
          '0%':   { opacity: '0', transform: 'translateX(30px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
        slideInLeft: {
          '0%':   { opacity: '0', transform: 'translateX(-30px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
        scaleIn: {
          '0%':   { opacity: '0', transform: 'scale(0.9)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        pulseGold: {
          '0%, 100%': { boxShadow: '0 0 0 0 rgba(212,175,55,0)' },
          '50%':       { boxShadow: '0 0 0 8px rgba(212,175,55,0.15)' },
        },
        shimmer: {
          '0%':   { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        bounceSubtle: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%':       { transform: 'translateY(-6px)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0) rotate(0deg)' },
          '33%':       { transform: 'translateY(-12px) rotate(1deg)' },
          '66%':       { transform: 'translateY(-6px) rotate(-1deg)' },
        },
        glowPulse: {
          '0%, 100%': { opacity: '0.6' },
          '50%':       { opacity: '1' },
        },
      },

      transitionDuration: {
        '250': '250ms',
        '350': '350ms',
        '400': '400ms',
      },

      transitionTimingFunction: {
        'smooth': 'cubic-bezier(0.4, 0, 0.2, 1)',
        'bounce': 'cubic-bezier(0.34, 1.56, 0.64, 1)',
      },

      backdropBlur: {
        xs: '2px',
      },

      zIndex: {
        '60': '60',
        '70': '70',
        '80': '80',
        '90': '90',
        '100': '100',
      },

      screens: {
        'xs': '375px',
        '3xl': '1600px',
      },
    },
  },
  plugins: [],
};
