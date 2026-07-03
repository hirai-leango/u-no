<template>
  <div class="flex flex-col items-center justify-center min-h-[70vh] text-center">
    <div class="inline-block bg-gradient-to-r from-brand to-brand-dark text-white text-xs font-bold tracking-widest uppercase px-3 py-1 rounded-full mb-6">
      You know — 有能
    </div>
    <h1 class="text-4xl md:text-5xl font-extrabold mb-4 bg-gradient-to-br from-white to-brand-light bg-clip-text text-transparent">
      自分の有能さを<br>第三者に証明してもらう
    </h1>
    <p class="text-gray-400 text-base mb-10 max-w-sm">
      履歴書と第三者レビューを組み合わせた、<br>信頼できる自己紹介ページを作ろう。
    </p>

    <div v-if="!user" class="flex flex-col gap-3 w-64">
      <button
        v-for="provider in providers"
        :key="provider.id"
        class="flex items-center justify-center gap-3 px-5 py-3 rounded-xl font-semibold text-sm transition-opacity hover:opacity-80 active:scale-95"
        :class="provider.class"
        @click="login(provider.id)"
      >
        <Icon :name="provider.icon" class="text-lg" />
        {{ provider.label }}
      </button>
    </div>

    <div v-else class="flex flex-col items-center gap-4">
      <p class="text-gray-400 text-sm">ログイン中: {{ user.displayName }}</p>
      <NuxtLink
        v-if="userSlug"
        :to="`/u/${userSlug}`"
        class="px-6 py-3 bg-brand rounded-xl font-semibold text-sm hover:opacity-80 transition-opacity"
      >
        マイページへ →
      </NuxtLink>
      <NuxtLink
        v-else
        to="/onboarding"
        class="px-6 py-3 bg-brand rounded-xl font-semibold text-sm hover:opacity-80 transition-opacity"
      >
        プロフィールを設定する →
      </NuxtLink>
    </div>
  </div>
</template>

<script setup lang="ts">
import {
  GoogleAuthProvider,
  GithubAuthProvider,
  FacebookAuthProvider,
  signInWithPopup,
} from 'firebase/auth'

const user = useCurrentUser()
const { $auth } = useNuxtApp()
const userSlug = ref('')

const providers = [
  { id: 'google', label: 'Googleでログイン', icon: 'logos:google-icon', class: 'bg-white text-gray-800' },
  { id: 'github', label: 'GitHubでログイン', icon: 'logos:github-icon', class: 'bg-gray-900 text-white border border-surface-border' },
  { id: 'facebook', label: 'Facebookでログイン', icon: 'logos:facebook', class: 'bg-[#1877f2] text-white' },
]

watch(user, async (u) => {
  if (!u) return
  const { getProfileByUid } = useUserProfile()
  const profile = await getProfileByUid(u.uid)
  userSlug.value = profile?.slug ?? ''
  if (!profile) navigateTo('/onboarding')
}, { immediate: true })

async function login(providerId: string) {
  const providerMap: Record<string, any> = {
    google: new GoogleAuthProvider(),
    github: new GithubAuthProvider(),
    facebook: new FacebookAuthProvider(),
  }
  await signInWithPopup($auth, providerMap[providerId])
}
</script>
