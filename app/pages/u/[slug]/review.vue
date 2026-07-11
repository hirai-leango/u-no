<template>
  <div class="max-w-sm mx-auto pt-8">
    <NuxtLink :to="`/u/${slug}`" class="inline-flex items-center gap-1 text-ink-mute text-sm hover:text-ink-soft mb-8 transition-colors">
      ← {{ profile?.displayName ?? '' }}のページへ戻る
    </NuxtLink>

    <h1 class="text-2xl font-extrabold mb-1 font-display text-ink">
      レビューを書く
    </h1>
    <p class="text-ink-mute text-sm mb-8">
      {{ profile?.displayName }} さんへの正直なレビューをお願いします
    </p>

    <div v-if="existing" class="flex items-center justify-between bg-surface border border-surface-border rounded px-4 py-3 mb-6 text-sm">
      <span class="text-ink-mute">以前のレビューを編集中</span>
      <button class="text-red-400 hover:text-red-300 text-xs transition-colors" @click="confirmDelete">削除</button>
    </div>

    <div class="mb-6">
      <label class="block text-xs font-bold tracking-widest uppercase text-ink-mute mb-2">
        {{ profile?.displayName ?? 'この人' }} との関係
      </label>
      <div class="grid grid-cols-3 gap-2">
        <button
          v-for="(label, key) in RELATIONSHIP_LABELS"
          :key="key"
          type="button"
          class="px-2 py-2.5 rounded text-xs font-semibold border transition-colors"
          :class="relationship === key
            ? 'bg-brand text-white border-brand'
            : 'bg-surface text-ink-mute border-surface-border hover:text-ink'"
          @click="relationship = key as Relationship"
        >
          {{ label }}
        </button>
      </div>
    </div>

    <div class="mb-6">
      <label class="block text-xs font-bold tracking-widest uppercase text-ink-mute mb-2">コメント</label>
      <textarea
        v-model="comment"
        :maxlength="300"
        rows="5"
        placeholder="例: 突然の依頼にも即レスで対応してくれた。回答がめちゃくちゃ的確だった。"
        class="w-full bg-surface border border-surface-border rounded px-4 py-3 text-sm outline-none focus:border-brand transition-colors resize-none text-ink placeholder-ink-mute"
      />
      <div class="text-right text-xs mt-1" :class="comment.length > 270 ? 'text-warn' : 'text-ink-mute'">
        {{ comment.length }} / 300
      </div>
    </div>

    <button
      :disabled="!comment.trim() || !relationship || submitting"
      class="w-full py-3 rounded font-bold text-sm bg-gradient-to-r from-brand to-brand-dark text-white transition-opacity disabled:opacity-40"
      @click="submit"
    >
      {{ existing ? '更新する' : 'レビューを送信する' }}
    </button>

    <PhoneVerifyModal
      v-if="showPhoneModal"
      @close="showPhoneModal = false"
      @verified="onPhoneVerified"
    />
  </div>
</template>

<script setup lang="ts">
definePageMeta({ middleware: 'auth' })

import type { UserProfile, Review, Relationship } from '~/types'
import { RELATIONSHIP_LABELS } from '~/types'

const route = useRoute()
const slug = computed(() => route.params.slug as string)
const currentUser = useCurrentUser()

const profile = ref<UserProfile | null>(null)
const existing = ref<Review | null>(null)
const comment = ref('')
const relationship = ref<Relationship | null>(null)
const submitting = ref(false)

const { getProfileBySlug, getProfileByUid } = useUserProfile()
const { getMyReview, upsertReview, deleteReview } = useReviews()
const isPhoneVerified = useIsPhoneVerified()
const showPhoneModal = ref(false)

async function load() {
  const p = await getProfileBySlug(slug.value)
  if (!p || !currentUser.value) return
  // 自分自身にはレビューできない
  if (p.uid === currentUser.value.uid) return navigateTo(`/u/${slug.value}`)
  profile.value = p
  existing.value = await getMyReview(p.uid, currentUser.value.uid)
  if (existing.value) {
    comment.value = existing.value.comment
    relationship.value = existing.value.relationship ?? null
  }
}

onMounted(() => {
  if (currentUser.value) load()
  watch(currentUser, (u) => {
    if (u) load()
  })
})

async function submit() {
  if (!profile.value || !currentUser.value || !comment.value.trim() || !relationship.value) return
  // 電話番号未認証なら本人確認モーダルを出す
  if (!isPhoneVerified.value) {
    showPhoneModal.value = true
    return
  }
  await doSubmit()
}

async function doSubmit() {
  if (!profile.value || !currentUser.value || !relationship.value) return
  submitting.value = true
  const myProfile = await getProfileByUid(currentUser.value.uid)
  await upsertReview(profile.value.uid, {
    uid: currentUser.value.uid,
    displayName: currentUser.value.displayName ?? '',
    photoURL: currentUser.value.photoURL ?? '',
    slug: myProfile?.slug ?? '',
  }, comment.value.trim(), relationship.value)
  navigateTo(`/u/${slug.value}`)
}

async function onPhoneVerified() {
  showPhoneModal.value = false
  await doSubmit()
}

async function confirmDelete() {
  if (!profile.value || !currentUser.value) return
  if (!confirm('レビューを削除しますか？')) return
  await deleteReview(profile.value.uid, currentUser.value.uid)
  navigateTo(`/u/${slug.value}`)
}
</script>
