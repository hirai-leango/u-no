// 計測（S0-1）: GA4カスタムイベントの単一入口。
// ここを通すことで命名を一元化し、将来はDB集計やKPIダッシュボードに拡張できる。
// サーバー側では nuxt-gtag がno-opになるため安全。
export function useTrack() {
  function track(event: string, params: Record<string, string | number | boolean> = {}) {
    try {
      // useTrackEvent は nuxt-gtag が自動importする（= gtag('event', name, params)）
      useTrackEvent(event, params)
    } catch {
      // 計測失敗で本体機能を止めない
    }
  }

  // 招待経由の登録（K値）を測るための被参照ID。ランディング時に保存済み（ref-capture.client.ts）
  function consumeRef(): string {
    if (!import.meta.client) return ''
    try {
      const r = localStorage.getItem('uno_ref') ?? ''
      if (r) localStorage.removeItem('uno_ref')
      return r
    } catch {
      return ''
    }
  }

  return { track, consumeRef }
}
