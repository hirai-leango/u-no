import { getAuth, onAuthStateChanged, type User } from 'firebase/auth'

export function useCurrentUser() {
  const user = useState<User | null>('current-user', () => null)
  const authReady = useState<boolean>('auth-ready', () => false)

  if (import.meta.client && !authReady.value) {
    const auth = getAuth()
    onAuthStateChanged(auth, (u) => {
      user.value = u
      authReady.value = true
    })
  }

  return user
}

export function useAuthReady() {
  return useState<boolean>('auth-ready', () => false)
}
