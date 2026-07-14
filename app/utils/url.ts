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
