<template>
  <div class="max-w-sm mx-auto pt-8">
    <NuxtLink :to="`/u/${slug}`" class="inline-flex items-center gap-1 text-gray-500 text-sm hover:text-gray-300 mb-8 transition-colors">
      ← {{ profile?.displayName ?? '' }}のページへ戻る
    </NuxtLink>

    <h1 class="text-2xl font-extrabold mb-1 bg-gradient-to-br from-white to-brand-light bg-clip-text text-transparent">
      有能レビューを書く
    </h1>
    <p class="text-gray-400 text-sm mb-8">
      {{ profile?.displayName }} さんへの正直なレビューをお願いします
    </p>

    <div v-if="existing" class="flex items-center justify-between bg-surface border border-surface-border rounded-xl px-4 py-3 mb-6 text-sm">
      <span class="text-gray-400">以前のレビューを編集中</span>
      <button class="text-red-400 hover:text-red-300 text-xs transition-colors" @click="confirmDelete">削除</button>
    </div>

    <div class="mb-6">
      <label class="block text-xs font-bold tracking-widest uppercase text-gray-500 mb-2">コメント</label>
      <textarea
        v-model="comment"
        :maxlength="300"
        rows="5"
        placeholder="例: 突然の依頼にも即レスで対応してくれた。回答がめちゃくちゃ的確だった。"
        class="w-full bg-surface border border-surface-border rounded-xl px-4 py-3 text-sm outline-none focus:border-brand transition-colors resize-none text-gray-100 placeholder-gray-600"
      />
      <div class="text-right text-xs mt-1" :class="comment.length > 270 ? 'text-orange-400' : 'text-gray-600'">
        {{ comment.length }} / 300
      </div>
    </div>

    <button
      :disabled="!comment.trim() || submitting"
      class="w-full py-3 rounded-xl font-bold text-sm bg-gradient-to-r from-brand to-brand-dark text-white transition-opacity disabled:opacity-40"
      @click="submit"
    >
      {{ existing ? '更新する' : 'レビューを送信する' }}
    </button>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ middleware: 'auth' })

import type { UserProfile, Review } from '~/types'

const route = useRoute()
const slug = computed(() => route.params.slug as string)
const currentUser = useCurrentUser()

const profile = ref<UserProfile | null>(null)
const existing = ref<Review | null>(null)
const comment = ref('')
const submitting = ref(false)

const { getProfileBySlug, getProfileByUid } = useUserProfile()
const { getMyReview, upsertReview, deleteReview } = useReviews()

async function load() {
  const p = await getProfileBySlug(slug.value)
  if (!p || !currentUser.value) return
  // 自分自身にはレビューできない
  if (p.uid === currentUser.value.uid) return navigateTo(`/u/${slug.value}`)
  profile.value = p
  existing.value = await getMyReview(p.uid, currentUser.value.uid)
  if (existing.value) comment.value = existing.value.comment
}

onMounted(() => {
  if (currentUser.value) load()
  watch(currentUser, (u) => {
    if (u) load()
  })
})

async function submit() {
  if (!profile.value || !currentUser.value || !comment.value.trim()) return
  submitting.value = true
  const myProfile = await getProfileByUid(currentUser.value.uid)
  await upsertReview(profile.value.uid, {
    uid: currentUser.value.uid,
    displayName: currentUser.value.displayName ?? '',
    photoURL: currentUser.value.photoURL ?? '',
    slug: myProfile?.slug ?? '',
  }, comment.value.trim())
  navigateTo(`/u/${slug.value}`)
}

async function confirmDelete() {
  if (!profile.value || !currentUser.value) return
  if (!confirm('レビューを削除しますか？')) return
  await deleteReview(profile.value.uid, currentUser.value.uid)
  navigateTo(`/u/${slug.value}`)
}
</script>
