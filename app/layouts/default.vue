<template>
  <div class="min-h-screen bg-surface-deep text-gray-100 font-sans">
    <header class="border-b border-surface-border">
      <div class="max-w-3xl mx-auto px-4 h-14 flex items-center justify-between">
        <NuxtLink to="/" class="text-brand-light font-bold text-lg tracking-tight">
          有能レビュー
        </NuxtLink>
        <nav v-if="user" class="flex items-center gap-3">
          <NuxtLink :to="`/u/${userSlug}`" class="text-sm text-gray-400 hover:text-gray-200 transition-colors">
            マイページ
          </NuxtLink>
          <NuxtLink to="/settings" class="text-sm text-gray-400 hover:text-gray-200 transition-colors">
            設定
          </NuxtLink>
          <img
            v-if="user.photoURL"
            :src="user.photoURL"
            class="w-8 h-8 rounded-full cursor-pointer"
            @click="signOut"
          />
        </nav>
      </div>
    </header>
    <main class="max-w-3xl mx-auto px-4 py-8">
      <slot />
    </main>
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
