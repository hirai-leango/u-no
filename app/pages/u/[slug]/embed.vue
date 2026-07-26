<template>
  <div class="min-h-screen bg-white p-3 font-sans">
    <div v-if="profile" class="max-w-[480px] mx-auto border border-surface-border rounded-xl overflow-hidden">
      <!-- ヘッダー -->
      <a :href="profileUrl" target="_blank" rel="noopener" class="flex items-center gap-3 p-4 bg-surface-deep/60 hover:bg-surface-deep transition-colors">
        <img :src="hiResAvatar(profile.photoURL, 96)" :alt="`${profile.displayName}さんのアイコン`" class="w-12 h-12 rounded-full object-cover flex-none ring-1 ring-line bg-surface-card" />
        <div class="min-w-0 flex-1">
          <p class="font-bold text-ink truncate">{{ profile.displayName }}</p>
          <p v-if="profile.headline" class="text-xs text-ink-mute truncate">{{ profile.headline }}</p>
        </div>
        <div class="text-right flex-none">
          <p class="text-lg font-bold text-brand leading-none tabular-nums">{{ reviews.length }}</p>
          <p class="text-[10px] text-ink-mute mt-0.5">件の紹介</p>
        </div>
      </a>

      <!-- 上位エピソード -->
      <div v-if="topReviews.length" class="divide-y divide-line">
        <div v-for="r in topReviews" :key="r.id" class="p-4">
          <p class="text-sm text-ink-soft leading-relaxed">{{ truncate(r.comment, 96) }}</p>
          <div class="flex items-center gap-1.5 mt-2 text-xs text-ink-mute">
            <span class="font-semibold text-ink-soft">{{ r.fromDisplayName || 'ある方' }}さん</span>
            <span v-if="relLabel(r)" class="px-1.5 py-0.5 rounded-sm bg-surface-card text-ink-soft font-semibold">{{ relLabel(r) }}</span>
          </div>
        </div>
      </div>
      <div v-else class="p-4 text-center text-xs text-ink-mute">まだ紹介がありません</div>

      <!-- フッターCTA -->
      <a :href="profileUrl" target="_blank" rel="noopener" class="flex items-center justify-center gap-2 py-3 border-t border-line text-sm font-bold text-brand hover:bg-brand/5 transition-colors">
        <img src="/favicon.svg" alt="" class="w-4 h-5" style="image-rendering: pixelated;" />
        ユーノーミーで信頼を見る →
      </a>
    </div>

    <div v-else class="max-w-[480px] mx-auto p-6 text-center text-sm text-ink-mute">
      プロフィールが見つかりませんでした
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Relationship } from '~/types'
import { RELATIONSHIP_LABELS } from '~/types'

// 埋め込み専用：サイトのヘッダー/フッターを外す・検索非対象
definePageMeta({ layout: false })
useSeoMeta({ robots: 'noindex, nofollow' })

const SITE = 'https://u-no.me'
const route = useRoute()
const slug = computed(() => route.params.slug as string)

const { data } = await useFetch(`/api/profile/${slug.value}`)
const profile = computed(() => data.value?.profile ?? null)
const reviews = computed(() => data.value?.reviews ?? [])

// S0-2: 信頼できる順の上位2件（相互判定は埋め込みでは省略＝関係性・具体性で並べる）
const topReviews = computed(() => sortByCredibility(reviews.value as any).slice(0, 2))

// 招待経由の登録を測るため ?ref に本人uidを付与（K計測）
const profileUrl = computed(() => `${SITE}/u/${slug.value}/?ref=${profile.value?.uid ?? ''}`)

// 受け取り表示は「書いた人が本人にとって何者か」の視点に反転（ReviewCardと統一）
const RECEIVED_REL_DISPLAY: Partial<Record<Relationship, string>> = { boss: '部下', subordinate: '上司' }
function relLabel(r: any) {
  const rel = r.relationship as Relationship
  if (!rel) return ''
  return RECEIVED_REL_DISPLAY[rel] ?? RELATIONSHIP_LABELS[rel] ?? ''
}

function truncate(s: string, n: number) {
  const clean = (s ?? '').replace(/\s+/g, ' ').trim()
  return clean.length > n ? clean.slice(0, n) + '…' : clean
}

useSeoMeta({
  title: () => profile.value ? `${profile.value.displayName} | ユーノーミー` : 'ユーノーミー',
})
</script>
