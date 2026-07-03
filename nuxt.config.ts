export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  ssr: false,
  devtools: { enabled: true },
  nitro: {
    preset: 'cloudflare_module',
    rollupConfig: {
      external: ['firebase-admin', 'firebase-admin/auth'],
    },
  },
  modules: [
    '@nuxtjs/tailwindcss',
    '@nuxt/icon',
    'nuxt-vuefire',
    '@vueuse/nuxt',
  ],
  vuefire: {
    config: {
      apiKey: process.env.FIREBASE_API_KEY,
      authDomain: process.env.FIREBASE_AUTH_DOMAIN,
      projectId: process.env.FIREBASE_PROJECT_ID,
      storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
      messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID,
      appId: process.env.FIREBASE_APP_ID,
    },
  },
  runtimeConfig: {
    geminiApiKey: process.env.GEMINI_API_KEY,
    public: {},
  },
})
