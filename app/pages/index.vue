<template>
  <div class="flex flex-col items-center justify-center min-h-[70vh] text-center">
    <h1 class="text-4xl md:text-5xl font-extrabold mb-4 font-black text-ink leading-tight">
      流石に０レビューは、<br>努力不足じゃない？
    </h1>
    <p class="text-ink-soft text-base mb-10 max-w-md leading-relaxed">
      ユーノーミーは第三者レビューを組み合わせた、<br>ビジネスプロフィールサービスです。
    </p>

    <div v-if="!user" class="flex flex-col gap-3 w-64">
      <button
        v-for="provider in providers"
        :key="provider.id"
        class="flex items-center justify-center gap-3 px-5 py-3 rounded font-semibold text-sm transition-opacity hover:opacity-80 active:scale-95"
        :class="provider.class"
        @click="login(provider.id)"
      >
        <Icon :name="provider.icon" class="text-lg" />
        {{ provider.label }}
      </button>
    </div>

    <div v-else class="flex flex-col items-center gap-4">
      <p class="text-ink-mute text-sm">ログイン中: {{ user.displayName }}</p>
      <NuxtLink
        v-if="userSlug"
        :to="`/u/${userSlug}`"
        class="px-6 py-3 bg-brand text-white rounded font-bold text-sm hover:bg-brand-hover transition-colors"
      >
        マイページへ →
      </NuxtLink>
      <NuxtLink
        v-else
        to="/onboarding"
        class="px-6 py-3 bg-brand text-white rounded font-bold text-sm hover:bg-brand-hover transition-colors"
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
  getAuth,
} from 'firebase/auth'

useSeoMeta({
  title: 'u-no.me（ユーノーミー）| 信頼が紡ぐビジネスプロフィールSNS',
  ogTitle: 'u-no.me（ユーノーミー）| 信頼が紡ぐビジネスプロフィールSNS',
  description: '履歴書と第三者レビューで信頼できる自己紹介ページをつくろう',
  ogDescription: '履歴書と第三者レビューで信頼できる自己紹介ページをつくろう',
})

const user = useCurrentUser()
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
  const auth = getAuth()
  const providerMap: Record<string, any> = {
    google: new GoogleAuthProvider(),
    github: new GithubAuthProvider(),
    facebook: new FacebookAuthProvider(),
  }
  await signInWithPopup(auth, providerMap[providerId])
}
</script>
