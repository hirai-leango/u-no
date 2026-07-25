<template>
  <div>
    <div v-if="review && profile" class="max-w-xl mx-auto">
      <!-- エピソードカード（プロフィールのカードと同じ見た目に統一：箱線なし・下線区切り） -->
      <div class="border-b border-line pb-6">
        <!-- 誰から誰へ（投稿者 → ◯◯さん）: プロフィールのカードと同じ from→to 形式で統一 -->
        <div class="flex items-center gap-2 mb-3">
          <component
            :is="review.fromSlug ? 'NuxtLink' : 'span'"
            :to="review.fromSlug ? `/u/${review.fromSlug}/` : undefined"
            class="flex-none"
          >
            <img :src="hiResAvatar(review.fromPhotoURL, 96)" alt="" class="w-9 h-9 rounded-full object-cover ring-1 ring-line hover:ring-2 ring-brand transition-all bg-surface-card" @error="onAvatarError" />
          </component>
          <span class="text-ink-mute text-sm flex-none">→</span>
          <NuxtLink :to="`/u/${slug}/`" class="flex-none">
            <img :src="hiResAvatar(profile.photoURL, 96)" alt="" class="w-9 h-9 rounded-full object-cover ring-1 ring-line hover:ring-2 ring-brand transition-all bg-surface-card" @error="onAvatarError" />
          </NuxtLink>
          <div class="min-w-0 flex-1">
            <div class="flex items-center gap-2 flex-wrap">
              <span class="text-sm truncate">
                <component
                  :is="review.fromSlug ? 'NuxtLink' : 'span'"
                  :to="review.fromSlug ? `/u/${review.fromSlug}/` : undefined"
                  class="font-bold text-brand hover:underline"
                >{{ review.fromDisplayName || 'ユーザー' }}さん</component>
                <span class="text-ink-mute"> → </span>
                <NuxtLink :to="`/u/${slug}/`" class="font-bold text-ink hover:text-brand transition-colors">{{ profile.displayName }}さん</NuxtLink>
              </span>
              <span v-if="relLabel" class="text-[10px] px-2 py-0.5 rounded-sm bg-surface-card text-ink-soft font-semibold flex-none">{{ relLabel }}</span>
            </div>
            <p v-if="review.fromHeadline" class="text-xs text-ink-mute truncate">{{ review.fromHeadline }}</p>
            <p class="text-xs text-ink-mute">{{ formatDate(review.createdAt) }}</p>
          </div>
        </div>

        <!-- 本文 -->
        <p class="text-sm text-ink-soft leading-relaxed whitespace-pre-wrap">{{ review.comment }}</p>
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

// 日付表示（プロフィールのカードと同じ書式で揃える）
function formatDate(date: any) {
  if (!date) return ''
  const d = date?.toDate ? date.toDate() : new Date(date)
  return isNaN(d.getTime()) ? '' : d.toLocaleDateString('ja-JP', { year: 'numeric', month: 'long', day: 'numeric' })
}

function truncate(s: string, n: number) {
  if (!s) return ''
  const clean = s.replace(/\s+/g, ' ').trim()
  return clean.length > n ? clean.slice(0, n) + '…' : clean
}

const ogComment = computed(() => truncate(review.value?.comment ?? '', 78))

// --- TDK（Title / Description / Keywords）最適化 ---
// タイトル: 「宛先さんへのエピソード（投稿者さんより）｜ユーノーミー」
const metaTitle = computed(() => {
  const r = review.value, p = profile.value
  if (!r || !p) return 'エピソード | ユーノーミー'
  const from = r.fromDisplayName || 'ある方'
  return `${p.displayName}さんへのエピソード（${from}さんより）｜ユーノーミー`
})
// OGタイトル: SNS向けに「誰が誰について書いたか」を前面に
const metaOgTitle = computed(() => {
  const r = review.value, p = profile.value
  if (!r || !p) return 'ユーノーミー'
  return `${r.fromDisplayName || 'ある方'}さんが書いた、${p.displayName}さんへのエピソード`
})
// ディスクリプション: 関係性＋投稿者を添えて本文抜粋（検索結果でのクリックを促す）
const metaDescription = computed(() => {
  const r = review.value, p = profile.value
  if (!r || !p) return ''
  const from = r.fromDisplayName || 'ある方'
  const who = relLabel.value ? `${p.displayName}さんの${relLabel.value}・${from}さん` : `${from}さん`
  return truncate(`${who}が綴った、${p.displayName}さんの人物エピソード。「${truncate(r.comment, 72)}」`, 118)
})
// キーワード（補助的。人物名・関係性・サービス語彙）
const metaKeywords = computed(() => {
  const r = review.value, p = profile.value
  if (!r || !p) return ''
  return [p.displayName, r.fromDisplayName, relLabel.value, '他己紹介', 'エピソード', '評判', '人物', 'ビジネスプロフィール', 'ユーノーミー']
    .filter(Boolean).join(', ')
})

useSeoMeta({
  title: () => metaTitle.value,
  description: () => metaDescription.value,
  keywords: () => metaKeywords.value,
  // OGP（Facebook / LINE など）
  ogTitle: () => metaOgTitle.value,
  ogDescription: () => metaDescription.value,
  ogType: 'article',
  ogSiteName: 'ユーノーミー',
  ogLocale: 'ja_JP',
  // Twitter/X 大画像カード（エピソード専用OG画像を大きく表示）
  twitterCard: 'summary_large_image',
  twitterTitle: () => metaOgTitle.value,
  twitterDescription: () => metaDescription.value,
  // article 系
  articlePublishedTime: () => (review.value?.createdAt ? String(review.value.createdAt) : undefined),
  articleModifiedTime: () => (review.value?.updatedAt ? String(review.value.updatedAt) : review.value?.createdAt ? String(review.value.createdAt) : undefined),
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

// 構造化データ（Review + BreadcrumbList）
// エピソード＝第三者が実名で書く他己紹介 → schema.org Review にそのまま対応
const SITE = 'https://u-no.me'
useHead(() => {
  const r = review.value
  const p = profile.value
  if (!r || !p) return {}
  const person: Record<string, any> = {
    '@type': 'Person',
    name: p.displayName,
    url: `${SITE}/u/${p.slug}/`,
  }
  if (p.photoURL) person.image = p.photoURL
  if (p.headline) person.jobTitle = p.headline

  const author: Record<string, any> = { '@type': 'Person', name: r.fromDisplayName || 'ユーザー' }
  if (r.fromSlug) author.url = `${SITE}/u/${r.fromSlug}/`
  if (r.fromPhotoURL) author.image = r.fromPhotoURL
  if (r.fromHeadline) author.jobTitle = r.fromHeadline

  const review_: Record<string, any> = {
    '@type': 'Review',
    '@id': `${SITE}/u/${p.slug}/e/${r.id}/`,
    url: `${SITE}/u/${p.slug}/e/${r.id}/`,
    reviewBody: r.comment,
    author,
    itemReviewed: person,
    publisher: { '@type': 'Organization', name: 'ユーノーミー', url: `${SITE}/` },
  }
  if (r.createdAt) review_.datePublished = String(r.createdAt).slice(0, 10)

  const breadcrumb = {
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'ホーム', item: `${SITE}/` },
      { '@type': 'ListItem', position: 2, name: `${p.displayName}さん`, item: `${SITE}/u/${p.slug}/` },
      { '@type': 'ListItem', position: 3, name: 'エピソード' },
    ],
  }

  return {
    script: [{
      type: 'application/ld+json',
      innerHTML: JSON.stringify({ '@context': 'https://schema.org', '@graph': [review_, breadcrumb] }),
    }],
  }
})

function onAvatarError(e: Event) {
  const t = e.target as HTMLImageElement
  t.style.visibility = 'hidden'
}
</script>
