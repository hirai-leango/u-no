<template>
  <div class="max-w-md mx-auto pt-10 text-center">
    <p class="text-3xl mb-3">🎉</p>
    <h1 class="text-2xl font-black text-ink mb-2">ようこそ、ユーノーミーへ</h1>
    <p class="text-sm text-ink-mute leading-relaxed mb-8">
      最初のエピソードを集めましょう。<br>知人が書く「他己紹介」が、あなたの信頼になります。
    </p>

    <!-- ① 依頼する -->
    <div class="border border-surface-border rounded-xl p-5 mb-4 text-left">
      <p class="font-bold text-ink mb-1">知人にエピソードを依頼する</p>
      <p class="text-xs text-ink-mute leading-relaxed mb-4">お世話になった方にあなたのURLを送って、一言書いてもらいましょう。多いほど信頼が伝わります。</p>
      <button
        class="w-full py-3 rounded-lg font-bold text-sm bg-brand text-white hover:bg-brand-hover transition-colors"
        @click="shareForRequest"
      >{{ copied ? 'URLをコピーしました！' : 'URLをシェアして依頼する' }}</button>
    </div>

    <!-- ② 書く -->
    <div class="border border-surface-border rounded-xl p-5 mb-8 text-left">
      <p class="font-bold text-ink mb-1">知人について書く</p>
      <p class="text-xs text-ink-mute leading-relaxed mb-4">あなたから相手へエピソードを贈れます。相手が受け取ると、お互いの信頼がつながります。</p>
      <NuxtLink
        to="/write/"
        class="block w-full text-center py-3 rounded-lg font-bold text-sm border border-brand text-brand hover:bg-brand/5 transition-colors"
      >知人について書く</NuxtLink>
    </div>

    <NuxtLink :to="slug ? `/u/${slug}/` : '/'" class="text-sm text-ink-mute hover:text-ink transition-colors">
      あとで（マイページへ）
    </NuxtLink>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ middleware: 'auth' })
useSeoMeta({ robots: 'noindex, nofollow', title: 'ようこそ | ユーノーミー' })

const currentUser = useCurrentUser()
const { getProfileByUid } = useUserProfile()
const { track } = useTrack()
const { showToast } = useToast()

const slug = ref('')
const copied = ref(false)

watch(currentUser, async (u) => {
  if (!u) return
  const p = await getProfileByUid(u.uid)
  slug.value = p?.slug ?? ''
}, { immediate: true })

async function shareForRequest() {
  if (!slug.value || !currentUser.value) return
  track('invite_sent', { source: 'onboarding_start' })
  const url = `${window.location.origin}/u/${slug.value}/?ref=${currentUser.value.uid}`
  const name = currentUser.value.displayName ?? ''
  if (navigator.share) {
    try { await navigator.share({ title: `${name}さんへのエピソードをお願いします`, text: `${name}さんとのエピソードを書いていただけませんか？`, url }) } catch { /* キャンセル */ }
  } else {
    await navigator.clipboard.writeText(url)
    copied.value = true
    showToast('プロフィールURLをコピーしました')
    setTimeout(() => (copied.value = false), 2500)
  }
}
</script>
