import type { Review, Relationship } from '~/types'

// 信用重み（S0-2, v0.1）: エピソードの「信頼できる度合い」を内部計算する。
// ※ 数値はUIに出さない。並び順・（将来）埋め込み選定などの内部判断にのみ使う。
//
// 設計思想：相互取引で作りにくい＝偽りにくい推薦ほど信用が高い。
//  - 非対称な関係（上に立つ者が下を保証する等）を加点
//  - 具体性（本文の厚み）を加点（ただし水増し対策で上限あり・二次要素に留める）
//  - 相互称賛（A⇄B）は「独立性がやや下がる」ぶんの軽い割引（断罪ではない）
//
// 関係性は「相手（＝紹介される本人）が投稿者にとって何か」を格納している点に注意。
//  subordinate = 本人は投稿者の部下 → 投稿者は上司として部下を保証（見返りが少なく信用大）
//  contractor  = 本人は投稿者の業務委託先 → 発注者が受注者を保証（信用大）
//  boss/client = 上位者・顧客への保証（やや政治的/取引的だが価値あり）
const RELATIONSHIP_TRUST: Partial<Record<Relationship, number>> = {
  subordinate: 0.6,
  contractor: 0.6,
  boss: 0.4,
  client: 0.4,
  colleague: 0.1,
}

export function credibilityScore(review: Review, mutualUids?: Set<string>): number {
  let score = 1
  // 非対称な関係を加点
  score += RELATIONSHIP_TRUST[review.relationship] ?? 0
  // 具体性（本文の厚み）を加点：400字で +0.5、それ以上は頭打ち（水増し対策）
  const len = (review.comment ?? '').trim().length
  score += Math.min(len, 400) / 800
  // 相互称賛は軽い割引（×0.85）。相互＝深い関係の場合もあるため断罪しない
  if (mutualUids?.has(review.fromUserId)) score *= 0.85
  return score
}

// 信頼できる順に並べる（同点は新しい順）。元配列は破壊しない。
export function sortByCredibility(reviews: Review[], mutualUids?: Set<string>): Review[] {
  return [...reviews].sort((a, b) => {
    const d = credibilityScore(b, mutualUids) - credibilityScore(a, mutualUids)
    if (Math.abs(d) > 1e-9) return d
    const ta = a.createdAt ? new Date(a.createdAt as any).getTime() : 0
    const tb = b.createdAt ? new Date(b.createdAt as any).getTime() : 0
    return tb - ta
  })
}
