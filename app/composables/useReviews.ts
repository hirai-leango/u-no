import {
  doc, getDoc, setDoc, deleteDoc,
  collection, query, where, getDocs, getCountFromServer, serverTimestamp, getFirestore,
} from 'firebase/firestore'
import type { Review, Relationship } from '~/types'

export function useReviews() {
  const db = getFirestore()

  function reviewDocId(toUserId: string, fromUserId: string) {
    return `${toUserId}_${fromUserId}`
  }

  async function getReviews(toUserId: string): Promise<Review[]> {
    const q = query(
      collection(db, 'reviews'),
      where('toUserId', '==', toUserId),
    )
    const snap = await getDocs(q)
    const list = snap.docs.map(d => ({ id: d.id, ...d.data() }) as Review)
    // インデックス不要にするためクライアント側で新しい順にソート
    return list.sort((a, b) => {
      const ta = (a.createdAt as any)?.toMillis?.() ?? 0
      const tb = (b.createdAt as any)?.toMillis?.() ?? 0
      return tb - ta
    })
  }

  async function getMyReview(toUserId: string, fromUserId: string): Promise<Review | null> {
    const snap = await getDoc(doc(db, 'reviews', reviewDocId(toUserId, fromUserId)))
    if (!snap.exists()) return null
    return { id: snap.id, ...snap.data() } as Review
  }

  async function upsertReview(
    toUserId: string,
    from: { uid: string; displayName: string; photoURL: string; slug: string; headline?: string },
    comment: string,
    relationship: Relationship,
  ): Promise<void> {
    const id = reviewDocId(toUserId, from.uid)
    const existing = await getDoc(doc(db, 'reviews', id))
    await setDoc(doc(db, 'reviews', id), {
      toUserId,
      fromUserId: from.uid,
      fromDisplayName: from.displayName,
      fromPhotoURL: from.photoURL,
      fromSlug: from.slug,
      fromHeadline: from.headline ?? '',
      relationship,
      comment,
      updatedAt: serverTimestamp(),
      createdAt: existing.exists() ? existing.data().createdAt : serverTimestamp(),
    })
  }

  async function deleteReview(toUserId: string, fromUserId: string): Promise<void> {
    await deleteDoc(doc(db, 'reviews', reviewDocId(toUserId, fromUserId)))
  }

  // 自分が他人に贈ったエピソード数（fromUserId == 自分）
  async function getGivenCount(fromUserId: string): Promise<number> {
    const q = query(collection(db, 'reviews'), where('fromUserId', '==', fromUserId))
    const snap = await getCountFromServer(q)
    return snap.data().count
  }

  return { getReviews, getMyReview, upsertReview, deleteReview, getGivenCount }
}
