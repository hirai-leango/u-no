// URL をトレイリングスラッシュ付きに統一（SEO: 重複コンテンツ回避）
// 例: /settings/resume → /settings/resume/ へ 301 リダイレクト
export default defineEventHandler((event) => {
  const url = getRequestURL(event)
  const { pathname, search } = url

  if (
    pathname === '/' ||            // ルートは対象外
    pathname.endsWith('/') ||      // すでにスラッシュ付き
    pathname.startsWith('/api') || // API は対象外
    pathname.startsWith('/_') ||   // /_nuxt などのアセット
    pathname.includes('.')         // favicon.svg / robots.txt など拡張子付き
  ) return

  return sendRedirect(event, pathname + '/' + search, 301)
})
