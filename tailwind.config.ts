import type { Config } from 'tailwindcss'

// u-no.me 確定ブランドトークン（生成り×呉須×金茶）
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
          DEFAULT: '#ffffff',   // カード背景（白）
          card: '#EEE5D2',      // 生成り深：チップ・タグ背景
          deep: '#F6F1E6',      // 生成り：ページ背景
          border: '#D9CCB0',    // hairline（互換エイリアス）
        },
        line: '#D9CCB0',        // hairline border
        ink: {
          DEFAULT: '#26211B',   // 墨：本文テキスト
          soft: '#5B5449',      // 墨ソフト：補助テキスト
          mute: '#8B8173',      // さらに淡い補助
        },
        brand: {
          DEFAULT: '#1F4B7A',   // 呉須：ボタン・リンク・新着証言
          hover: '#183C63',
          press: '#122D4A',
          light: '#1F4B7A',     // 互換（旧brand-light）
          dark: '#122D4A',      // 互換（旧brand-dark）
        },
        mark: '#5C7E56',        // 若竹色：ロゴ専用
        trust: '#D4A857',       // 金茶：trust badge・アクセント
        good: '#9DB35A',        // 萌黄色：Good優勢
        empty: '#C6A6A0',       // 桜鼠：空プロフィール・Bad相殺
        warn: '#A8502F',        // 紅：警告・削除（控えめ）
        disabled: {
          bg: '#E3DCC9',
          text: '#B0A78E',
        },
      },
      fontFamily: {
        sans: ['"Zen Kaku Gothic New"', '"Noto Sans JP"', '-apple-system', 'BlinkMacSystemFont', 'sans-serif'],
        display: ['"Shippori Mincho"', 'serif'],
        dot: ['"DotGothic16"', 'monospace'],
      },
      borderRadius: {
        DEFAULT: '8px',
      },
    },
  },
} satisfies Config
