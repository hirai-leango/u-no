<template>
  <div class="max-w-sm mx-auto pt-8">
    <NuxtLink :to="`/u/${slug}/`" class="inline-flex items-center gap-1 text-ink-mute text-sm hover:text-ink-soft mb-6 transition-colors">
      ← {{ profile?.displayName ?? '' }}のページへ戻る
    </NuxtLink>

    <!-- 温かい導入（依頼者の名前・写真） -->
    <div v-if="profile" class="flex items-center gap-3 bg-brand/5 border border-brand/15 rounded-lg px-4 py-3 mb-6">
      <img
        v-if="profile.photoURL"
        :src="profile.photoURL"
        class="w-12 h-12 rounded-full object-cover flex-none"
      />
      <p class="text-sm text-ink leading-snug">
        <span class="font-bold">{{ profile.displayName }}</span> さんが、あなたとのエピソードを待っています。
      </p>
    </div>

    <h1 class="text-2xl font-extrabold mb-1 font-black text-ink">
      エピソードを書く
    </h1>
    <p class="text-ink-mute text-sm mb-8">
      <template v-if="currentUser && profile">{{ currentUser.displayName }}さんが{{ profile.displayName }}さんと働いていた時の、人柄や仕事ぶりを教えてください。</template>
      <template v-else>人柄や仕事ぶりを教えてください。</template>
    </p>

    <div v-if="existing" class="flex items-center justify-between bg-surface border border-surface-border rounded px-4 py-3 mb-6 text-sm">
      <span class="text-ink-mute">以前のエピソードを編集中</span>
      <button class="text-red-400 hover:text-red-300 text-xs transition-colors" @click="confirmDelete">削除</button>
    </div>

    <div class="mb-6">
      <label class="block text-xs font-bold tracking-widest text-ink-mute mb-2">
        関係性
      </label>
      <div class="grid grid-cols-4 gap-2">
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
      <label class="block text-xs font-bold tracking-widest text-ink-mute mb-2">エピソード</label>
      <textarea
        v-model="comment"
        :maxlength="1000"
        rows="5"
        placeholder="例: 突然の依頼にも即レスで対応してくれた。回答がめちゃくちゃ的確だった。"
        v-autogrow
        class="w-full bg-surface border border-surface-border rounded px-4 py-3 text-sm outline-none focus:border-brand transition-colors resize-none min-h-[6rem] text-ink placeholder-ink-mute"
      />
      <div class="text-right text-xs mt-1" :class="comment.length > 950 ? 'text-warn' : 'text-ink-mute'">
        {{ comment.length }} / 1000
      </div>
    </div>

    <button
      :disabled="!comment.trim() || !relationship || submitting"
      class="w-full py-3 rounded font-bold text-sm bg-brand text-white transition-colors hover:bg-brand-hover disabled:bg-disabled-bg disabled:text-disabled-text"
      @click="goToConfirm"
    >
      {{ buttonLabel }}
    </button>

    <!-- 確認モーダル（プレビュー・長文はスクロール） -->
    <div
      v-if="showConfirmModal"
      class="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4 py-6"
      @click.self="showConfirmModal = false"
    >
      <div class="w-full max-w-sm bg-surface border border-surface-border rounded-lg p-6 flex flex-col max-h-[calc(100dvh-3rem)]">
        <div class="flex-none mb-4">
          <!-- あなた → ◯◯さん -->
          <div class="flex items-center justify-center gap-4 mb-2">
            <img v-if="currentUser?.photoURL" :src="currentUser.photoURL" class="w-14 h-14 rounded-full object-cover" alt="" />
            <div v-else class="w-14 h-14 rounded-full bg-surface-border" />
            <span class="text-brand text-xl">→</span>
            <img v-if="profile?.photoURL" :src="profile.photoURL" class="w-14 h-14 rounded-full object-cover ring-2 ring-brand" alt="" />
            <div v-else class="w-14 h-14 rounded-full bg-surface-border" />
          </div>
          <div class="flex items-center justify-center gap-4 text-[10px] mb-3">
            <span class="w-14 text-center text-ink-mute">あなた</span>
            <span class="w-5"></span>
            <span class="w-14 text-center text-ink-soft font-bold truncate">{{ profile?.displayName }}</span>
          </div>
          <h2 class="text-base font-black text-ink text-center">{{ profile?.displayName }}さんへ、エピソードを贈ります</h2>
          <p class="text-[11px] text-ink-mute text-center mt-1">あなたの実名で、{{ profile?.displayName }}さんのページに公開されます</p>
        </div>

        <!-- スクロール領域 -->
        <div class="bg-surface-deep border border-surface-border rounded p-4 mb-4 overflow-y-auto flex-1 min-h-0">
          <p class="text-[11px] text-ink-mute mb-1">関係性</p>
          <p class="text-sm text-ink mb-3">{{ relationshipLabel }}</p>
          <p class="text-[11px] text-ink-mute mb-1">エピソード</p>
          <p class="text-sm text-ink leading-relaxed whitespace-pre-wrap">{{ comment }}</p>
        </div>

        <p v-if="comment.trim().length <= 100" class="text-xs text-warn mb-4 flex-none">
          ⚠️ 少し短いようです。具体的な出来事があるほど信頼が伝わります。
        </p>

        <div class="flex gap-2 flex-none">
          <button
            class="flex-1 py-3 rounded border border-surface-border text-sm font-semibold text-ink-mute hover:text-ink transition-colors"
            @click="showConfirmModal = false"
          >
            修正する
          </button>
          <button
            :disabled="submitting"
            class="flex-1 py-3 rounded bg-brand text-white text-sm font-bold hover:bg-brand-hover disabled:bg-disabled-bg disabled:text-disabled-text transition-colors"
            @click="publish"
          >
            {{ existing ? '更新する' : '公開する' }}
          </button>
        </div>
      </div>
    </div>

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

useSeoMeta({
  title: () => profile.value ? `${profile.value.displayName}さんへのエピソードを書く | ユーノーミー` : 'エピソードを書く | ユーノーミー',
  robots: 'noindex, nofollow',
})
const existing = ref<Review | null>(null)
const comment = ref('')
const relationship = ref<Relationship | null>(null)
const submitting = ref(false)

const { getProfileBySlug, getProfileByUid } = useUserProfile()
const { getMyReview, upsertReview, deleteReview } = useReviews()
const isPhoneVerified = useIsPhoneVerified()
const showPhoneModal = ref(false)
const showConfirmModal = ref(false)
const relationshipLabel = computed(() => relationship.value ? RELATIONSHIP_LABELS[relationship.value] : '')

// 入力状態に応じたボタンのラベル
const buttonLabel = computed(() => {
  const hasRel = !!relationship.value
  const hasText = !!comment.value.trim()
  if (!hasRel && !hasText) return '関係性を選択してください'
  if (!hasRel && hasText) return '関係性が未選択です'
  if (hasRel && !hasText) return 'エピソードを入力してください'
  return '確認画面へ進む'
})

async function load() {
  const p = await getProfileBySlug(slug.value)
  if (!p || !currentUser.value) return
  // 自分自身にはエピソードできない
  if (p.uid === currentUser.value.uid) return navigateTo(`/u/${slug.value}/`)
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

// 確認画面（モーダル）を開く
function goToConfirm() {
  if (!profile.value || !currentUser.value || !comment.value.trim() || !relationship.value) return
  showConfirmModal.value = true
}

// 確認画面で「公開する」を押したとき
async function publish() {
  showConfirmModal.value = false
  // 【一時バイパス】reCAPTCHA/電話認証の設定が整うまで、本人確認をスキップして投稿を開通させる。
  // 復活させるときは下のブロックのコメントを外す。
  // if (!isPhoneVerified.value) {
  //   showPhoneModal.value = true
  //   return
  // }
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
    headline: myProfile?.headline ?? '',
  }, comment.value.trim(), relationship.value)
  navigateTo(`/u/${slug.value}/`)
}

async function onPhoneVerified() {
  showPhoneModal.value = false
  await doSubmit()
}

async function confirmDelete() {
  if (!profile.value || !currentUser.value) return
  if (!confirm('エピソードを削除しますか？')) return
  await deleteReview(profile.value.uid, currentUser.value.uid)
  navigateTo(`/u/${slug.value}/`)
}
</script>
