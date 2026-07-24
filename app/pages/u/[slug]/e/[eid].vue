<template>
  <div>
    <div v-if="review && profile" class="max-w-xl mx-auto">
      <!-- エピソードカード -->
      <div class="border border-surface-border rounded-2xl p-6 md:p-8 bg-white">
        <!-- 宛先 -->
        <NuxtLink :to="`/u/${slug}/`" class="flex items-center gap-3 mb-5 group">
          <img
            :src="hiResAvatar(profile.photoURL, 96)"
            class="w-12 h-12 rounded-full object-cover flex-none"
            @error="onAvatarError"
          />
          <div class="min-w-0">
            <p class="text-xs text-ink-mute">エピソードの宛先</p>
            <p class="font-bold text-ink group-hover:text-brand transition-colors truncate">{{ profile.displayName }}さん</p>
          </div>
        </NuxtLink>

        <!-- 本文 -->
        <p class="text-lg text-ink leading-relaxed whitespace-pre-wrap">{{ review.comment }}</p>

        <!-- 書いた人 -->
        <div class="flex items-center gap-3 mt-6 pt-5 border-t border-surface-border">
          <component
            :is="review.fromSlug ? 'NuxtLink' : 'div'"
            :to="review.fromSlug ? `/u/${review.fromSlug}/` : undefined"
            class="flex items-center gap-3 min-w-0 group"
          >
            <img
              :src="hiResAvatar(review.fromPhotoURL, 96)"
              class="w-10 h-10 rounded-full object-cover flex-none"
              @error="onAvatarError"
            />
            <div class="min-w-0">
              <div class="flex items-center gap-2">
                <span class="text-sm font-semibold text-ink group-hover:text-brand transition-colors truncate">{{ review.fromDisplayName || 'ユーザー' }}さん</span>
                <span v-if="relLabel" class="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-brand/8 text-brand flex-none">{{ relLabel }}</span>
              </div>
              <p v-if="review.fromHeadline" class="text-xs text-ink-mute truncate">{{ review.fromHeadline }}</p>
            </div>
          </component>
        </div>
      </div>

      <!-- CTA -->
      <NuxtLink
        :to="`/u/${slug}/`"
        class="block w-full text-center mt-5 py-3.5 rounded-lg font-bold text-sm bg-brand text-white hover:bg-brand-hover transition-colors"
      >
        {{ profile.displayName }}さんのプロフィールをすべて見る →
      </NuxtLink>
      <p class="text-center text-xs text-ink-mute mt-6">
        ユーノーミーは、知人が書く「他己紹介」であなたの信頼を可視化するサービスです。
      </p>
    </div>

    <div v-else class="max-w-xl mx-auto text-center py-20">
      <p class="text-ink-mute">エピソードが見つかりませんでした。</p>
      <NuxtLink to="/" class="inline-block mt-4 text-brand font-semibold hover:underline">トップへ</NuxtLink>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Relationship } from '~/types'
import { RELATIONSHIP_LABELS } from '~/types'

// 受け取ったエピソードの表示は「書いた人が自分にとって何か」の視点に反転
const RECEIVED_REL_DISPLAY: Partial<Record<Relationship, string>> = { boss: '部下', subordinate: '上司' }

const route = useRoute()
const slug = computed(() => route.params.slug as string)
const eid = computed(() => route.params.eid as string)

const { data } = await useFetch(`/api/profile/${slug.value}`)
const profile = computed(() => data.value?.profile ?? null)
const review = computed(() => (data.value?.reviews ?? []).find((r: any) => r.id === eid.value) ?? null)

const relLabel = computed(() => {
  const rel = review.value?.relationship as Relationship | undefined
  if (!rel) return ''
  return RECEIVED_REL_DISPLAY[rel] ?? RELATIONSHIP_LABELS[rel] ?? ''
})

function truncate(s: string, n: number) {
  if (!s) return ''
  const clean = s.replace(/\s+/g, ' ').trim()
  return clean.length > n ? clean.slice(0, n) + '…' : clean
}

const ogComment = computed(() => truncate(review.value?.comment ?? '', 78))

useSeoMeta({
  title: () => review.value && profile.value ? `${profile.value.displayName}さんへのエピソード | ユーノーミー` : 'ユーノーミー',
  ogTitle: () => review.value && profile.value ? `${review.value.fromDisplayName}さんが書いた、${profile.value.displayName}さんへのエピソード` : 'ユーノーミー',
  description: () => ogComment.value,
  ogDescription: () => ogComment.value,
  robots: () => (review.value && profile.value?.isSearchable !== false ? 'index, follow' : 'noindex, nofollow'),
})

// エピソード専用の動的OG画像
defineOgImageComponent('Episode', {
  comment: ogComment.value,
  fromName: review.value?.fromDisplayName ?? '',
  fromPhoto: review.value?.fromPhotoURL ?? '',
  toName: profile.value?.displayName ?? '',
  relationship: relLabel.value,
}, {
  width: 1200,
  height: 630,
})

function onAvatarError(e: Event) {
  const t = e.target as HTMLImageElement
  t.style.visibility = 'hidden'
}
</script>
