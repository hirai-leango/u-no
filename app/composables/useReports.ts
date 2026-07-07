import {
  addDoc, collection, query, where, getDocs, serverTimestamp, getFirestore,
} from 'firebase/firestore'

export function useReports() {
  const db = getFirestore()

  async function reportTarget(
    targetType: 'review' | 'comment',
    targetId: string,
    reporterUid: string,
    reason: string,
  ): Promise<void> {
    // 同じ人が同じ対象を二重通報しないよう確認
    const q = query(
      collection(db, 'reports'),
      where('targetId', '==', targetId),
      where('reporterUid', '==', reporterUid),
    )
    const snap = await getDocs(q)
    if (!snap.empty) return

    await addDoc(collection(db, 'reports'), {
      targetType,
      targetId,
      reporterUid,
      reason,
      resolved: false,
      createdAt: serverTimestamp(),
    })
  }

  return { reportTarget }
}
