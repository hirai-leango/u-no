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
        // ライト＆ブルー：信頼・誠実
        surface: {
          DEFAULT: '#ffffff',   // カード背景
          deep: '#f5f8fc',      // ページ背景
          border: '#e3e9f2',    // 罫線
        },
        brand: {
          DEFAULT: '#2563eb',   // 信頼の青
          light: '#3b82f6',
          dark: '#1d4ed8',
        },
        ink: {
          DEFAULT: '#1a2b46',   // 主要テキスト（濃紺寄りの黒）
          soft: '#4a5b76',      // 本文
          mute: '#8a99b0',      // 補助テキスト
        },
      },
      fontFamily: {
        sans: ['"Noto Sans JP"', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'sans-serif'],
      },
    },
  },
} satisfies Config
