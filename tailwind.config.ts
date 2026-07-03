import type { Config } from 'tailwindcss'

export default {
  content: [
    './app/**/*.{vue,ts}',
    './components/**/*.{vue,ts}',
    './pages/**/*.{vue,ts}',
    './layouts/**/*.{vue,ts}',
  ],
  theme: {
    extend: {
      colors: {
        surface: {
          DEFAULT: '#1a1a24',
          deep: '#0f0f13',
          border: '#2a2a3a',
        },
        brand: {
          DEFAULT: '#6c63ff',
          light: '#a78bfa',
          dark: '#9b59b6',
        },
      },
      fontFamily: {
        sans: ['-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'sans-serif'],
      },
    },
  },
} satisfies Config
