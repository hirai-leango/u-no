// サーバー(Nitro/Workers)側の未処理エラーを構造化ログに出す
export default defineNitroPlugin((nitroApp) => {
  nitroApp.hooks.hook('error', (error, ctx) => {
    const e = error as Error & { statusCode?: number }
    console.error('[server-error]', JSON.stringify({
      url: ctx?.event?.path,
      statusCode: e?.statusCode,
      message: e?.message,
      stack: e?.stack,
    }))
  })
})
