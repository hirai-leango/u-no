import {
  doc, getDoc, setDoc, deleteDoc, addDoc,
  collection, query, where, getDocs, serverTimestamp, getFirestore,
} from 'firebase/firestore'
import type { Vote, ReviewComment } from '~/types'

export function useReviewInteractions() {
  const db = getFirestore()

  // ---- 公正さ評価（fair / unfair） ----

  function voteDocId(reviewId: string, voterUid: string) {
    return `${reviewId}__${voterUid}`
  }

  async function getVotes(reviewId: string): Promise<Vote[]> {
    const q = query(collection(db, 'votes'), where('reviewId', '==', reviewId))
    const snap = await getDocs(q)
    return snap.docs.map(d => ({ id: d.id, ...d.data() }) as Vote)
  }

  async function setVote(
    reviewId: string,
    voter: { uid: string; displayName: string; photoURL: string; slug: string },
    value: 'fair' | 'unfair',
  ): Promise<void> {
    const id = voteDocId(reviewId, voter.uid)
    const ref = doc(db, 'votes', id)
    const existing = await getDoc(ref)
    // 同じ値を再クリックしたら取り消し
    if (existing.exists() && existing.data().value === value) {
      await deleteDoc(ref)
      return
    }
    await setDoc(ref, {
      reviewId,
      voterUid: voter.uid,
      voterName: voter.displayName,
      voterPhoto: voter.photoURL,
      voterSlug: voter.slug,
      value,
      createdAt: serverTimestamp(),
    })
  }

  // ---- ツリーコメント ----

  async function getComments(reviewId: string): Promise<ReviewComment[]> {
    const q = query(
      collection(db, 'comments'),
      where('reviewId', '==', reviewId),
    )
    const snap = await getDocs(q)
    const list = snap.docs.map(d => ({ id: d.id, ...d.data() }) as ReviewComment)
    // インデックス不要にするためクライアント側で時系列ソート
    return list.sort((a, b) => {
      const ta = (a.createdAt as any)?.toMillis?.() ?? 0
      const tb = (b.createdAt as any)?.toMillis?.() ?? 0
      return ta - tb
    })
  }

  async function addComment(
    reviewId: string,
    parentId: string | null,
    author: { uid: string; displayName: string; photoURL: string; slug: string },
    text: string,
  ): Promise<ReviewComment> {
    const ref = await addDoc(collection(db, 'comments'), {
      reviewId,
      parentId,
      authorUid: author.uid,
      authorName: author.displayName,
      authorPhoto: author.photoURL,
      authorSlug: author.slug,
      text,
      createdAt: serverTimestamp(),
    })
    // 即時反映用に作成したコメントを返す（createdAtはクライアント時刻で暫定）
    return {
      id: ref.id,
      reviewId,
      parentId,
      authorUid: author.uid,
      authorName: author.displayName,
      authorPhoto: author.photoURL,
      authorSlug: author.slug,
      text,
      createdAt: new Date(),
    }
  }

  async function deleteComment(commentId: string): Promise<void> {
    await deleteDoc(doc(db, 'comments', commentId))
  }

  return { getVotes, setVote, getComments, addComment, deleteComment }
}
