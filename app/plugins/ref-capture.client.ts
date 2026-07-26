// 計測（S0-1）: 招待リンク ?ref={招待者uid} で来訪した場合に被参照IDを保存。
// 後で登録完了時に signup_complete のパラメータへ載せ、K（招待→新規）を測る。
export default defineNuxtPlugin(() => {
  if (!import.meta.client) return
  try {
    const params = new URLSearchParams(window.location.search)
    const ref = params.get('ref')
    if (ref) localStorage.setItem('uno_ref', ref)
  } catch {
    // 何もしない
  }
})
