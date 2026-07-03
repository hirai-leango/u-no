import { getAuth, onAuthStateChanged } from 'firebase/auth'

export default defineNuxtRouteMiddleware(async () => {
  if (import.meta.server) return

  const auth = getAuth()

  // Firebase Authの初期化完了を待つ
  const user = await new Promise((resolve) => {
    const unsubscribe = onAuthStateChanged(auth, (u) => {
      unsubscribe()
      resolve(u)
    })
  })

  if (!user) {
    return navigateTo('/')
  }
})
