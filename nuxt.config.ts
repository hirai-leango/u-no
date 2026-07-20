import { readdirSync, readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'

// content/media/*.md から静的化（プリレンダー）するメディアURLを算出（ビルド時のみ実行）
function mediaPrerenderRoutes(): string[] {
  const dir = fileURLToPath(new URL('./app/content/media', import.meta.url))
  const routes = new Set<string>(['/media/'])
  const cats = new Set<string>()
  for (const f of readdirSync(dir)) {
    if (!f.endsWith('.md')) continue
    const src = readFileSync(`${dir}/${f}`, 'utf-8')
    const fm = src.match(/^---\r?\n([\s\S]*?)\r?\n---/)?.[1] ?? ''
    const slug = (fm.match(/^slug:\s*(.+)$/m)?.[1] ?? f.replace(/\.md$/, '')).trim().replace(/^["']|["']$/g, '')
    const cat = fm.match(/^categorySlug:\s*(.+)$/m)?.[1]?.trim().replace(/^["']|["']$/g, '')
    routes.add(`/media/${slug}/`)
    if (cat) cats.add(`/media/category/${cat}/`)
  }
  return [...routes, ...cats]
}

export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },
  css: ['~/assets/css/brand.css'],
  app: {
    head: {
      link: [
        { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
        { rel: 'preconnect', href: 'https://fonts.gstatic.com', crossorigin: '' },
        { rel: 'stylesheet', href: 'https://fonts.googleapis.com/css2?family=Zen+Kaku+Gothic+New:wght@400;500;700;900&family=DotGothic16&display=swap' },
        { rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' },
        { rel: 'icon', type: 'image/svg+xml', href: '/favicon.svg' },
        { rel: 'icon', type: 'image/png', sizes: '32x32', href: '/favicon-32.png' },
        { rel: 'icon', type: 'image/png', sizes: '16x16', href: '/favicon-16.png' },
        { rel: 'apple-touch-icon', href: '/apple-touch-icon.png' },
      ],
    },
  },
  nitro: {
    preset: 'cloudflare_module',
    // SEO記事は固定コンテンツなのでビルド時に静的HTML化（Workers起動時の重い処理＝間欠500を回避）
    prerender: {
      crawlLinks: false,
      routes: [...mediaPrerenderRoutes(), '/terms/', '/privacy/'],
    },
    routeRules: {
      // ハッシュ付きJS/CSSは長期キャッシュ（不変）
      '/_nuxt/**': { headers: { 'cache-control': 'public, max-age=31536000, immutable' } },
      // HTMLは常に再検証（古いページを掴まない）
      // ※動的OG(/_og)は nuxt-og-image が自前で長期キャッシュを付与するため対象外でよい
      '/**': { headers: { 'cache-control': 'no-cache' } },
    },
  },
  modules: [
    '@nuxtjs/tailwindcss',
    '@nuxt/icon',
    '@vueuse/nuxt',
    'nuxt-gtag',
    '@nuxt/fonts',
    'nuxt-og-image',
  ],
  // GA4測定ID（G-XXXXXXXXXX）
  gtag: {
    id: 'G-GS86EJ3M2H',
  },
  // 動的OG画像の日本語用フォント。既存サイトのフォントには触らないよう
  // リモートプロバイダを無効化し、ローカルのNoto Sans JPのみ登録
  fonts: {
    providers: {
      google: false,
      googleicons: false,
      bunny: false,
      fontshare: false,
      fontsource: false,
    },
    families: [
      { name: 'Noto Sans JP', src: '/og-fonts/noto-sans-jp-400.ttf', weight: 400, global: true },
      { name: 'Noto Sans JP', src: '/og-fonts/noto-sans-jp-700.ttf', weight: 700, global: true },
    ],
  },
  runtimeConfig: {
    geminiApiKey: process.env.GEMINI_API_KEY,
    public: {
      firebaseApiKey: process.env.FIREBASE_API_KEY,
      firebaseAuthDomain: process.env.FIREBASE_AUTH_DOMAIN,
      firebaseProjectId: process.env.FIREBASE_PROJECT_ID,
      firebaseStorageBucket: process.env.FIREBASE_STORAGE_BUCKET,
      firebaseMessagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID,
      firebaseAppId: process.env.FIREBASE_APP_ID,
    },
  },
})
