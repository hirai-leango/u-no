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

// Google等のアバターURLを高解像度で取得（=s96-c → =s{size}-c）。それ以外はそのまま。
export function hiResAvatar(u?: string | null, size = 256): string {
  const v = (u ?? '').trim()
  if (!v) return ''
  // googleusercontent の「=s96-c」「=s96」等のサイズ指定を差し替え
  if (/googleusercontent\.com/.test(v)) {
    return v.replace(/=s\d+(-c)?$/, `=s${size}-c`)
  }
  return v
}
