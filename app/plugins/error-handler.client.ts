// クライアント側の未処理エラーを構造化ログに出す（Cloudflareのログで確認可能）
export default defineNuxtPlugin((nuxtApp) => {
  nuxtApp.vueApp.config.errorHandler = (err, _instance, info) => {
    const e = err as Error
    console.error('[client-error]', JSON.stringify({
      message: e?.message,
      stack: e?.stack,
      info,
      url: import.meta.client ? location?.href : undefined,
    }))
  }

  nuxtApp.hook('vue:error', (err, _instance, info) => {
    const e = err as Error
    console.error('[vue:error]', JSON.stringify({ message: e?.message, info }))
  })
})
