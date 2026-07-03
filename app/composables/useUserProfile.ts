import { doc, getDoc, setDoc, query, collection, where, getDocs, getFirestore } from 'firebase/firestore'
import type { UserProfile } from '~/types'

export function useUserProfile() {
  const db = getFirestore()

  async function getProfileBySlug(slug: string): Promise<UserProfile | null> {
    const q = query(collection(db, 'users'), where('slug', '==', slug))
    const snap = await getDocs(q)
    if (snap.empty) return null
    return { uid: snap.docs[0].id, ...snap.docs[0].data() } as UserProfile
  }

  async function getProfileByUid(uid: string): Promise<UserProfile | null> {
    const snap = await getDoc(doc(db, 'users', uid))
    if (!snap.exists()) return null
    return { uid: snap.id, ...snap.data() } as UserProfile
  }

  async function isSlugAvailable(slug: string): Promise<boolean> {
    const q = query(collection(db, 'users'), where('slug', '==', slug))
    const snap = await getDocs(q)
    return snap.empty
  }

  async function saveProfile(uid: string, data: Partial<UserProfile>): Promise<void> {
    await setDoc(doc(db, 'users', uid), data, { merge: true })
  }

  return { getProfileBySlug, getProfileByUid, isSlugAvailable, saveProfile }
}
