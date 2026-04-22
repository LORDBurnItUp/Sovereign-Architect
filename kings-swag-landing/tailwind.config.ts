import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        obsidian: {
          DEFAULT: "#020202",
          50: "#0f0f0f",
          100: "#0a0a0a",
          200: "#060606",
          300: "#040404",
          400: "#020202",
          500: "#000000",
        },
        gold: {
          DEFAULT: "#FFD700",
          soft: "#FFECAA",
          deep: "#C9A227",
          dust: "#3a2e0a",
        },
        matrix: {
          DEFAULT: "#00FF41",
          soft: "#9EFFB9",
          deep: "#006619",
        },
        alert: {
          DEFAULT: "#FF3131",
          soft: "#FF8585",
          deep: "#8A0000",
        },
        cyan: {
          DEFAULT: "#00E5FF",
          soft: "#A0F2FF",
        },
        sand: "#E8D4A8",
      },
      boxShadow: {
        'neon-gold': '0 0 15px rgba(255, 215, 0, 0.45), 0 0 40px rgba(255, 215, 0, 0.12)',
        'neon-gold-lg': '0 0 30px rgba(255, 215, 0, 0.55), 0 0 80px rgba(255, 215, 0, 0.2)',
        'neon-matrix': '0 0 15px rgba(0, 255, 65, 0.45)',
        'neon-alert': '0 0 15px rgba(255, 49, 49, 0.6)',
        'inset-edge': 'inset 0 1px 0 rgba(255,255,255,0.04), inset 0 -1px 0 rgba(0,0,0,0.6)',
        'sovereign': '0 30px 80px -40px rgba(0,0,0,0.9), 0 0 0 1px rgba(255,215,0,0.06), inset 0 1px 0 rgba(255,215,0,0.05)',
      },
      fontFamily: {
        orbitron: ['var(--font-display)', 'sans-serif'],
        display: ['var(--font-display)', 'sans-serif'],
        mono: ['var(--font-mono)', 'monospace'],
        serif: ['var(--font-serif)', 'serif'],
        sans: ['var(--font-body)', 'system-ui', 'sans-serif'],
      },
      fontSize: {
        '2xs': ['10px', '14px'],
        '3xs': ['9px', '12px'],
      },
      backdropBlur: {
        xs: '2px',
        '2xl': '40px',
        '3xl': '64px',
      },
      transitionTimingFunction: {
        'sovereign': 'cubic-bezier(0.19, 1, 0.22, 1)',
        'tactical': 'cubic-bezier(0.76, 0, 0.24, 1)',
      },
      gridTemplateColumns: {
        '14': 'repeat(14, minmax(0, 1fr))',
        '16': 'repeat(16, minmax(0, 1fr))',
      },
    },
  },
  plugins: [],
};
export default config;
