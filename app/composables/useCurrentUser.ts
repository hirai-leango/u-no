import { getAuth, onAuthStateChanged, type User } from 'firebase/auth'

export function useCurrentUser() {
  const user = useState<User | null>('current-user', () => null)

  if (import.meta.client) {
    const auth = getAuth()
    onAuthStateChanged(auth, (u) => {
      user.value = u
    })
  }

  return user
}
