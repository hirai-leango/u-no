import {
  getFirestore, doc, collection, setDoc, getDoc, updateDoc,
  query, where, getDocs, serverTimestamp,
} from 'firebase/firestore'
import type { Review } from '~/types'

// S1-3 claim: 未登録者への「他己紹介」を先に書き、登録時に本人へ紐づける仕組み。
// 仮ID(pendingRecipients)にエピソードを貯め、登録時は付け替えずマッピングで合流する。
export function useClaim() {
  const db = getFirestore()

  // 未登録の受け取り予定者（仮の器）を作成し、その仮IDを返す
  async function createPending(name: string, createdBy: string): Promise<string> {
    const ref = doc(collection(db, 'pendingRecipients'))
    await setDoc(ref, {
      name,
      createdBy,
      claimedByUid: null,
      createdAt: serverTimestamp(),
    })
    return ref.id
  }

  async function getPending(pendingId: string) {
    const snap = await getDoc(doc(db, 'pendingRecipients', pendingId))
    return snap.exists() ? { id: snap.id, ...snap.data() } as any : null
  }

  // 仮ID宛に貯まったエピソード（claimプレビュー・受け取り一覧の合流に使う）
  async function getPendingReviews(pendingId: string): Promise<Review[]> {
    const q = query(collection(db, 'reviews'), where('toUserId', '==', pendingId))
    const snap = await getDocs(q)
    return snap.docs.map(d => ({ id: d.id, ...d.data() }) as Review)
  }

  // 自分が「知人について書いた」相手（仮の器）の一覧。新しい順
  async function getMyPendings(createdBy: string): Promise<any[]> {
    const q = query(collection(db, 'pendingRecipients'), where('createdBy', '==', createdBy))
    const snap = await getDocs(q)
    return snap.docs
      .map(d => ({ id: d.id, ...d.data() }) as any)
      .sort((a, b) => ((b.createdAt as any)?.toMillis?.() ?? 0) - ((a.createdAt as any)?.toMillis?.() ?? 0))
  }

  // 受け取り確定：仮の器を自分のuidでclaimする（未claimのみ・1回だけ）
  async function claimPending(pendingId: string, uid: string): Promise<boolean> {
    const pending = await getPending(pendingId)
    if (!pending || pending.claimedByUid) return false
    await updateDoc(doc(db, 'pendingRecipients', pendingId), {
      claimedByUid: uid,
      claimedAt: serverTimestamp(),
    })
    return true
  }

  return { createPending, getPending, getPendingReviews, claimPending, getMyPendings }
}
