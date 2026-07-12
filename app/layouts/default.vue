<template>
  <div class="min-h-screen bg-surface-deep text-ink font-sans">
    <header class="border-b border-surface-border">
      <div class="max-w-3xl mx-auto px-4 h-14 flex items-center justify-between">
        <NuxtLink to="/" class="flex items-center gap-2 text-brand font-bold text-lg tracking-tight">
          <img src="/favicon.svg" alt="ユーノーミー" class="w-6 h-8" style="image-rendering: pixelated;" />
          ユーノーミー
        </NuxtLink>
        <nav v-if="user" class="flex items-center gap-3">
          <NuxtLink :to="`/u/${userSlug}`" class="text-sm text-ink-mute hover:text-ink transition-colors">
            マイページ
          </NuxtLink>
          <NuxtLink to="/settings" class="text-sm text-ink-mute hover:text-ink transition-colors">
            設定
          </NuxtLink>
          <NuxtLink v-if="user.photoURL" :to="`/u/${userSlug}`">
            <img
              :src="user.photoURL"
              class="w-8 h-8 rounded-full cursor-pointer hover:ring-2 ring-brand transition-all"
            />
          </NuxtLink>
        </nav>
      </div>
    </header>
    <main class="max-w-3xl mx-auto px-4 py-8">
      <slot />
    </main>
    <footer class="border-t border-surface-border mt-12">
      <div class="max-w-3xl mx-auto px-4 py-6 flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-xs text-ink-mute">
        <span>© 2026 u-no.me</span>
        <NuxtLink to="/terms" class="hover:text-ink-mute transition-colors">利用規約</NuxtLink>
        <NuxtLink to="/privacy" class="hover:text-ink-mute transition-colors">プライバシーポリシー</NuxtLink>
      </div>
    </footer>
  </div>
</template>

<script setup lang="ts">
import { getAuth, signOut as firebaseSignOut } from 'firebase/auth'

const user = useCurrentUser()
const userSlug = ref('')

watch(user, async (u) => {
  if (!u) return
  const { getProfileByUid } = useUserProfile()
  const profile = await getProfileByUid(u.uid)
  userSlug.value = profile?.slug ?? ''
}, { immediate: true })

async function signOut() {
  const auth = getAuth()
  await firebaseSignOut(auth)
  navigateTo('/')
}
</script>
