<template>
  <div v-if="profile">
    <!-- ヘッダー -->
    <div class="mb-8">
      <div class="flex items-start gap-4">
        <img :src="profile.photoURL" class="w-16 h-16 rounded-full object-cover flex-none" />
        <div class="flex-1 min-w-0">
          <h1 class="text-xl font-extrabold text-ink">{{ profile.displayName }}</h1>
          <p v-if="profile.headline" class="text-brand text-sm font-semibold mt-0.5">{{ profile.headline }}</p>
        </div>
      </div>
      <p v-if="profile.bio" class="text-ink-soft text-sm mt-3 leading-relaxed whitespace-pre-wrap">{{ profile.bio }}</p>
      <div v-if="safeLinks.length" class="flex flex-wrap gap-2 mt-3">
        <a
          v-for="l in safeLinks"
          :key="l.url"
          :href="l.url"
          target="_blank"
          rel="noopener noreferrer"
          class="text-xs text-brand border border-surface-border rounded px-2 py-1 hover:border-brand transition-colors"
        >{{ l.label }}</a>
      </div>
    </div>

    <!-- アクションボタン -->
    <div class="flex gap-3 mb-10">
      <NuxtLink
        v-if="canReview"
        :to="`/u/${slug}/review/`"
        class="px-5 py-2.5 bg-brand text-white rounded text-sm font-bold hover:bg-brand-hover transition-colors"
      >
        エピソードを贈る
      </NuxtLink>
      <NuxtLink
        v-if="showSignupToReview"
        :to="`/signup/?redirect=/u/${slug}/review/`"
        class="px-5 py-2.5 bg-brand text-white rounded text-sm font-bold hover:bg-brand-hover transition-colors"
      >
        アカウントを登録してエピソードを書く
      </NuxtLink>
      <button
        v-if="isMyPage"
        class="px-5 py-2.5 w-64 text-center whitespace-nowrap bg-surface border border-surface-border rounded text-sm font-semibold text-ink-mute hover:text-ink transition-colors"
        @click="shareProfile"
      >
        {{ copied ? 'URLをコピーしました！' : '知人からエピソードを受け取る' }}
      </button>
    </div>

    <!-- 贈った／受け取ったサマリー -->
    <div class="flex gap-3 mb-10">
      <div class="flex-1 bg-surface border border-surface-border rounded-lg p-4 text-center">
        <div class="text-2xl font-black text-ink tabular-nums">{{ givenCount }}</div>
        <div class="text-xs text-ink-mute mt-0.5">贈ったエピソード</div>
      </div>
      <div class="flex-1 bg-surface border border-surface-border rounded-lg p-4 text-center">
        <div class="text-2xl font-black text-ink tabular-nums">{{ reviews.length }}</div>
        <div class="text-xs text-ink-mute mt-0.5">受け取ったエピソード</div>
      </div>
    </div>

    <!-- タブ切替 -->
    <div class="flex border-b border-surface-border mb-6">
      <button
        class="flex-1 py-3 text-sm font-bold transition-colors border-b-2 -mb-px"
        :class="tab === 'reviews' ? 'text-brand border-brand' : 'text-ink-mute border-transparent hover:text-ink'"
        @click="tab = 'reviews'"
      >
        エピソード<span v-if="reviews.length" class="tabular-nums">({{ reviews.length }})</span>
      </button>
      <button
        class="flex-1 py-3 text-sm font-bold transition-colors border-b-2 -mb-px"
        :class="tab === 'resume' ? 'text-brand border-brand' : 'text-ink-mute border-transparent hover:text-ink'"
        @click="tab = 'resume'"
      >
        経歴
      </button>
    </div>

    <!-- 経歴 -->
    <section v-show="tab === 'resume'" class="mb-10">
      <div v-if="!hasResume" class="text-center py-12 text-ink-mute">
        <p class="text-sm">まだ経歴が登録されていません。</p>
      </div>
      <div v-else class="bg-surface border border-surface-border rounded-none p-6 space-y-6">
        <div v-if="profile.resume.experience.length">
          <h3 class="text-xs text-ink-mute mb-3">職歴</h3>
          <div class="space-y-4">
            <div v-for="exp in profile.resume.experience" :key="exp.company + exp.title">
              <div class="font-semibold text-sm text-ink">{{ exp.title }} @ {{ exp.company }}</div>
              <div class="text-xs text-ink-mute mt-0.5">{{ exp.startDate }} – {{ exp.endDate }}</div>
              <p v-if="exp.description" class="text-xs text-ink-mute mt-1 leading-relaxed">{{ exp.description }}</p>
            </div>
          </div>
        </div>

        <div v-if="profile.resume.education.length">
          <h3 class="text-xs text-ink-mute mb-3">学歴</h3>
          <div class="space-y-2">
            <div v-for="edu in profile.resume.education" :key="edu.institution">
              <div class="font-semibold text-sm text-ink">{{ edu.institution }}</div>
              <div class="text-xs text-ink-mute">{{ edu.degree }} / {{ edu.field }} ({{ edu.startDate }} – {{ edu.endDate }})</div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- エピソード一覧 -->
    <section v-show="tab === 'reviews'">
      <div v-if="reviews.length === 0" class="text-center py-12 text-ink-mute">
        <p class="text-sm">まだエピソードがありません。</p>
      </div>
      <div v-else class="space-y-4">
        <ReviewCard
          v-for="review in visibleReviews"
          :key="review.id"
          :review="review"
          :profile-slug="slug"
        />
        <button
          v-if="reviews.length > visibleCount"
          class="w-full py-3 rounded border border-surface-border text-sm font-semibold text-ink-mute hover:text-ink hover:border-brand transition-colors"
          @click="visibleCount += 10"
        >
          もっと見る（残り{{ reviews.length - visibleCount }}件）
        </button>
      </div>
    </section>
  </div>

  <div v-else-if="notFound" class="text-center py-20 text-ink-mute">
    <p class="text-4xl mb-4">🔍</p>
    <p>このユーザーは見つかりませんでした</p>
  </div>

  <div v-else class="text-center py-20 text-ink-mute">
    <p class="text-sm">読み込み中...</p>
  </div>
</template>

<script setup lang="ts">
import type { UserProfile, Review } from '~/types'

const route = useRoute()
const slug = computed(() => route.params.slug as string)
const currentUser = useCurrentUser()

const { data } = await useFetch(`/api/profile/${slug.value}`)

const profileData = computed(() => data.value?.profile ?? null)

useSeoMeta({
  title: () => profileData.value ? `${profileData.value.displayName} | ユーノーミー` : 'ユーノーミー',
  ogTitle: () => profileData.value ? `${profileData.value.displayName} | ユーノーミー` : 'ユーノーミー',
  description: () => profileData.value ? (profileData.value.bio || `${profileData.value.displayName}のプロフィール`) : '',
  robots: () => (profileData.value && profileData.value.isSearchable === false) ? 'noindex, nofollow' : 'index, follow',
})

// プロフィールごとの動的OG画像（氏名・肩書き・顔写真）
defineOgImageComponent('Profile', {
  name: profileData.value?.displayName ?? 'ユーノーミー',
  headline: profileData.value?.headline ?? '',
  photo: profileData.value?.photoURL ?? '',
}, {
  width: 1200,
  height: 630,
})

const profile = computed(() => data.value?.profile ?? null)
// リンクは http(s) のみ許可（javascript: 等のXSSを排除）
const safeLinks = computed(() => (profile.value?.links ?? []).filter(l => isHttpUrl(l.url)))
const reviews = computed(() => data.value?.reviews ?? [])
const notFound = computed(() => data.value?.profile === null)

const hasResume = computed(() => {
  const r = profile.value?.resume
  if (!r) return false
  return r.experience.length || r.education.length
})

const canReview = computed(() => {
  if (!currentUser.value) return false
  if (!profile.value) return false
  return currentUser.value.uid !== profile.value.uid
})

// 未ログインで他人のページを見ているとき
const showSignupToReview = computed(() => !currentUser.value && !!profile.value)

const tab = ref<'reviews' | 'resume'>('reviews')

// エピソードは10件ずつ表示
const visibleCount = ref(10)
const visibleReviews = computed(() => reviews.value.slice(0, visibleCount.value))

const isMyPage = computed(() =>
  !!currentUser.value && !!profile.value && currentUser.value.uid === profile.value.uid)

// プロフィール本人が「贈ったエピソード数」を集計（受け取った数は reviews.length）
const { getGivenCount } = useReviews()
const givenCount = ref(0)
watch(profile, async (p) => {
  if (import.meta.client && p?.uid) {
    try { givenCount.value = await getGivenCount(p.uid) } catch { /* noop */ }
  }
}, { immediate: true })

const copied = ref(false)
async function shareProfile() {
  const url = window.location.href
  const name = profile.value?.displayName ?? ''
  // スマホ等はネイティブ共有シート、非対応環境はURLコピーにフォールバック
  if (navigator.share) {
    try {
      await navigator.share({
        title: `${name}さんのプロフィール`,
        text: `${name}さんへエピソード（他己紹介）を書いてください`,
        url,
      })
    } catch {
      // 共有をキャンセルした場合は何もしない
    }
  } else {
    await navigator.clipboard.writeText(url)
    copied.value = true
    setTimeout(() => (copied.value = false), 2000)
  }
}

</script>
