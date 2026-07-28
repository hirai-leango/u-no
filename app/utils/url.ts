// URLの安全性チェック（XSS・オープンリダイレクト対策）

// http/https のみ許可（javascript: data: などを弾く）
export function isHttpUrl(u?: string | null): boolean {
  return /^https?:\/\//i.test((u ?? '').trim())
}

// 表示用: 安全なURLだけ返す（不正なら空文字）
export function safeUrl(u?: string | null): string {
  return isHttpUrl(u) ? (u as string).trim() : ''
}

// リダイレクト用: 内部パスのみ許可（'/'始まり。'//' や '/\' の外部誘導は弾く）
export function safeInternalRedirect(r?: string | null, fallback = ''): string {
  const v = (r ?? '').trim()
  if (/^\/(?![/\\])/.test(v)) return v
  return fallback
}

// URLのドメインからファビコンURLを生成（企業ロゴ代わり）。不正なら空文字。
export function faviconUrl(u?: string | null, size = 64): string {
  const v = (u ?? '').trim()
  if (!isHttpUrl(v)) return ''
  try {
    const host = new URL(v).hostname
    return `https://www.google.com/s2/favicons?sz=${size}&domain=${host}`
  } catch {
    return ''
  }
}

// 写真が無い/無効なときの代替アバター（人物シルエット・壊れた画像アイコンを防ぐ）
export const AVATAR_PLACEHOLDER =
  "data:image/svg+xml,%3Csvg%20xmlns='http://www.w3.org/2000/svg'%20viewBox='0%200%2040%2040'%3E%3Crect%20width='40'%20height='40'%20fill='%23e6e0d3'/%3E%3Ccircle%20cx='20'%20cy='16'%20r='6.5'%20fill='%23c3bcac'/%3E%3Cpath%20d='M7%2037c0-7.5%205.8-12%2013-12s13%204.5%2013%2012'%20fill='%23c3bcac'/%3E%3C/svg%3E"

// Google等のアバターURLを高解像度で取得（=s96-c → =s{size}-c）。空/無効ならプレースホルダー。
export function hiResAvatar(u?: string | null, size = 256): string {
  const v = (u ?? '').trim()
  if (!v) return AVATAR_PLACEHOLDER
  // googleusercontent の「=s96-c」「=s96」等のサイズ指定を差し替え
  if (/googleusercontent\.com/.test(v)) {
    return v.replace(/=s\d+(-c)?$/, `=s${size}-c`)
  }
  return v
}
