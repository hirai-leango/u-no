import {
  doc, getDoc, setDoc, deleteDoc,
  collection, query, where, orderBy, getDocs, serverTimestamp, getFirestore,
} from 'firebase/firestore'
import type { Review } from '~/types'

export function useReviews() {
  const db = getFirestore()

  function reviewDocId(toUserId: string, fromUserId: string) {
    return `${toUserId}_${fromUserId}`
  }

  async function getReviews(toUserId: string): Promise<Review[]> {
    const q = query(
      collection(db, 'reviews'),
      where('toUserId', '==', toUserId),
      orderBy('createdAt', 'desc'),
    )
    const snap = await getDocs(q)
    return snap.docs.map(d => ({ id: d.id, ...d.data() }) as Review)
  }

  async function getMyReview(toUserId: string, fromUserId: string): Promise<Review | null> {
    const snap = await getDoc(doc(db, 'reviews', reviewDocId(toUserId, fromUserId)))
    if (!snap.exists()) return null
    return { id: snap.id, ...snap.data() } as Review
  }

  async function upsertReview(
    toUserId: string,
    from: { uid: string; displayName: string; photoURL: string; slug: string },
    comment: string,
  ): Promise<void> {
    const id = reviewDocId(toUserId, from.uid)
    const existing = await getDoc(doc(db, 'reviews', id))
    await setDoc(doc(db, 'reviews', id), {
      toUserId,
      fromUserId: from.uid,
      fromDisplayName: from.displayName,
      fromPhotoURL: from.photoURL,
      fromSlug: from.slug,
      comment,
      updatedAt: serverTimestamp(),
      createdAt: existing.exists() ? existing.data().createdAt : serverTimestamp(),
    })
  }

  async function deleteReview(toUserId: string, fromUserId: string): Promise<void> {
    await deleteDoc(doc(db, 'reviews', reviewDocId(toUserId, fromUserId)))
  }

  return { getReviews, getMyReview, upsertReview, deleteReview }
}
