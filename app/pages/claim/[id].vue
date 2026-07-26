<template>
  <div class="max-w-md mx-auto pt-8">
    <div v-if="loading" class="text-center py-20 text-ink-mute text-sm">読み込み中…</div>

    <div v-else-if="!pending" class="text-center py-20">
      <p class="text-ink-mute text-sm">リンクが無効か、期限切れです。</p>
      <NuxtLink to="/" class="inline-block mt-4 text-brand font-semibold hover:underline">トップへ</NuxtLink>
    </div>

    <template v-else>
      <!-- ヘッダー -->
      <div class="text-center mb-6">
        <p class="text-2xl mb-2">🎁</p>
        <h1 class="text-xl font-bold text-ink mb-1">{{ pending.name }}さんへ<br>エピソードが届いています</h1>
        <p class="text-sm text-ink-mute">あなたについて、知人が書いてくれました。</p>
      </div>

      <!-- 届いたエピソード -->
      <div class="border border-surface-border rounded-xl overflow-hidden divide-y divide-line mb-6">
        <div v-for="r in reviews" :key="r.id" class="p-4">
          <div class="flex items-center gap-2 mb-2">
            <img :src="hiResAvatar(r.fromPhotoURL, 96)" :alt="`${r.fromDisplayName || 'ある方'}さんのアイコン`" class="w-8 h-8 rounded-full object-cover flex-none ring-1 ring-line bg-surface-card" />
            <span class="text-ink-mute text-sm flex-none">→</span>
            <div class="w-8 h-8 rounded-full flex-none ring-1 ring-line bg-surface-card flex items-center justify-center text-[11px] text-ink-mute font-bold">{{ initial }}</div>
            <div class="min-w-0 flex-1">
              <div class="flex items-center gap-1.5">
                <span class="text-xs font-bold text-ink truncate">{{ r.fromDisplayName || 'ある方' }}さんより</span>
                <span v-if="relLabel(r)" class="text-[10px] px-1.5 py-0.5 rounded-sm bg-surface-card text-ink-soft font-semibold flex-none">{{ relLabel(r) }}</span>
              </div>
              <p v-if="r.fromHeadline" class="text-[11px] text-ink-mute truncate">{{ r.fromHeadline }}</p>
            </div>
          </div>
          <p class="text-sm text-ink-soft leading-relaxed whitespace-pre-wrap">{{ r.comment }}</p>
        </div>
        <div v-if="!reviews.length" class="p-6 text-center text-xs text-ink-mute">エピソードが見つかりませんでした</div>
      </div>

      <!-- 受け取り済み -->
      <div v-if="claimed" class="text-center rounded-xl bg-surface-deep px-6 py-6">
        <p class="text-sm font-bold text-ink mb-1">このエピソードは受け取り済みです</p>
        <p class="text-xs text-ink-mute">受け取ったアカウントでログインしてください。</p>
      </div>

      <!-- 受け取りCTA -->
      <template v-else>
        <NuxtLink
          :to="claimSignupUrl"
          class="block w-full text-center py-3.5 rounded-lg font-bold text-sm bg-brand text-white hover:bg-brand-hover transition-colors mb-3"
        >
          受け取る（無料でプロフィールを作る）
        </NuxtLink>
        <p class="text-center text-xs text-ink-mute leading-relaxed">
          受け取ると、このエピソードがあなたのプロフィールに表示されます。<br>
          ユーノーミーは、知人が書く「他己紹介」であなたの信頼を可視化するサービスです。
        </p>
      </template>
    </template>
  </div>
</template>

<script setup lang="ts">
import type { Relationship } from '~/types'
import { RELATIONSHIP_LABELS } from '~/types'

useSeoMeta({
  robots: 'noindex, nofollow',
  title: 'エピソードが届いています | ユーノーミー',
})

const route = useRoute()
const id = computed(() => route.params.id as string)
const { getPending, getPendingReviews } = useClaim()

const pending = ref<any>(null)
const reviews = ref<any[]>([])
const loading = ref(true)

onMounted(async () => {
  try {
    pending.value = await getPending(id.value)
    if (pending.value) reviews.value = sortByCredibility(await getPendingReviews(id.value) as any)
  } finally {
    loading.value = false
  }
})

const claimed = computed(() => !!pending.value?.claimedByUid)
const initial = computed(() => (pending.value?.name ?? '?').trim().charAt(0) || '?')
const claimSignupUrl = computed(() => `/signup/?claim=${id.value}&redirect=${encodeURIComponent(`/claim/${id.value}/`)}`)

const RECEIVED_REL_DISPLAY: Partial<Record<Relationship, string>> = { boss: '部下', subordinate: '上司' }
function relLabel(r: any) {
  const rel = r.relationship as Relationship
  if (!rel) return ''
  return RECEIVED_REL_DISPLAY[rel] ?? RELATIONSHIP_LABELS[rel] ?? ''
}
</script>
