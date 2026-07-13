<template>
  <div class="flex flex-col gap-3 w-64 mx-auto">
    <button
      v-for="p in providers"
      :key="p.id"
      class="flex items-center justify-center gap-3 px-5 py-3 rounded font-semibold text-sm hover:opacity-80"
      :class="p.class"
      @click="login(p.id)"
    >
      <Icon :name="p.icon" class="text-lg" />
      {{ p.label }}
    </button>
  </div>
</template>

<script setup lang="ts">
import { GoogleAuthProvider, GithubAuthProvider, FacebookAuthProvider, signInWithPopup, getAuth } from 'firebase/auth'

const user = useCurrentUser()

const providers = [
  { id: 'google', label: 'Googleで続ける', icon: 'logos:google-icon', class: 'bg-white text-gray-800 border border-surface-border' },
  // TODO: いつか実装する（Meta/GitHub側の設定・審査が必要）
  // { id: 'github', label: 'GitHubで続ける', icon: 'logos:github-icon', class: 'bg-gray-900 text-white' },
  // { id: 'facebook', label: 'Facebookで続ける', icon: 'logos:facebook', class: 'bg-[#1877f2] text-white' },
]

const route = useRoute()
const redirect = computed(() => (route.query.redirect as string) || '')

watch(user, async (u) => {
  if (!u) return
  const { getProfileByUid } = useUserProfile()
  const profile = await getProfileByUid(u.uid)
  if (profile && profile.slug) {
    // 登録済み: リダイレクト先が指定されていればそこへ
    navigateTo(redirect.value || '/u/' + profile.slug + '/')
  } else {
    // 未登録: オンボーディングへ（リダイレクト先を引き継ぐ）
    navigateTo(redirect.value ? '/onboarding/?redirect=' + encodeURIComponent(redirect.value) : '/onboarding/')
  }
}, { immediate: true })

async function login(id: string) {
  const m: Record<string, any> = { google: new GoogleAuthProvider(), github: new GithubAuthProvider(), facebook: new FacebookAuthProvider() }
  await signInWithPopup(getAuth(), m[id])
}
</script>
