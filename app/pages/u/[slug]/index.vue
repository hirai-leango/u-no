<template>
  <div v-if="profile">
    <!-- ヘッダー -->
    <div class="-mt-8 -mx-4 mb-8 overflow-hidden">
      <!-- カバー（藍色ヒーロー・湯呑み模様）に人物情報を集約 -->
      <div class="relative bg-gradient-to-br from-brand to-brand-press px-4 pt-10 pb-7 overflow-hidden">
        <div class="absolute inset-0 opacity-[0.16] bg-repeat pointer-events-none" style="background-image:url('/og-yunomi.png'); background-size:56px 73px;" />
        <div class="relative">
          <div class="flex items-end justify-between gap-4">
            <div class="min-w-0 flex-1">
              <h1 class="text-3xl font-black text-white leading-tight break-words">{{ profile.displayName }}</h1>
              <p v-if="profile.headline" class="text-white/85 text-sm font-semibold mt-2 leading-snug">{{ profile.headline }}</p>
            </div>
            <img :src="hiResAvatar(profile.photoURL)" @error="onAvatarError" class="w-24 h-24 rounded-full object-cover flex-none ring-4 ring-white/90 shadow-lg" />
          </div>
          <p v-if="profile.bio" class="text-white/80 text-sm leading-relaxed whitespace-pre-wrap mt-5">{{ profile.bio }}</p>
          <div v-if="safeLinks.length" class="flex flex-wrap gap-2 mt-3">
            <a
              v-for="l in safeLinks"
              :key="l.url"
              :href="l.url"
              target="_blank"
              rel="nofollow ugc noopener noreferrer"
              class="text-xs text-white/90 border border-white/40 rounded px-2 py-1 hover:border-white hover:bg-white/10 transition-colors"
            >{{ l.label }}</a>
          </div>
          <div v-if="snsList.length" class="flex flex-wrap items-center gap-3.5 mt-3">
            <a
              v-for="s in snsList"
              :key="s.key"
              :href="s.url"
              target="_blank"
              rel="nofollow ugc noopener noreferrer"
              :aria-label="s.label"
              class="text-white/75 hover:text-white transition-colors"
            >
              <Icon :name="s.icon" class="text-xl" />
            </a>
          </div>
        </div>
      </div>
    </div>

    <!-- アクションボタン（訪問者向け） -->
    <div v-if="canReview || showSignupToReview" class="flex gap-3 mb-6">
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
    </div>

    <!-- エピソード0件のときだけ成長CTA（件数はタブに表示） -->
    <div v-if="reviews.length === 0" class="mb-8">
      <div class="rounded-lg bg-surface-deep px-5 py-6 text-center">
        <p class="text-sm font-bold text-ink mb-1">まだエピソードがありません</p>
        <template v-if="isMyPage">
          <p class="text-xs text-ink-mute mb-4 leading-relaxed">知人にあなたのエピソード（人柄や仕事ぶり）を書いてもらいましょう。</p>
          <button
            class="inline-flex items-center justify-center px-5 py-2.5 bg-brand text-white rounded text-sm font-bold hover:bg-brand-hover transition-colors"
            @click="shareProfile"
          >{{ copied ? 'URLをコピーしました！' : 'エピソードを受け取る' }}</button>
        </template>
        <template v-else-if="canReview">
          <p class="text-xs text-ink-mute mb-4 leading-relaxed">あなたが最初のエピソードを贈りませんか？</p>
          <NuxtLink
            :to="`/u/${slug}/review/`"
            class="inline-flex items-center justify-center px-5 py-2.5 bg-brand text-white rounded text-sm font-bold hover:bg-brand-hover transition-colors"
          >エピソードを贈る</NuxtLink>
        </template>
        <template v-else-if="showSignupToReview">
          <p class="text-xs text-ink-mute mb-4 leading-relaxed">あなたが最初のひとりになりませんか？</p>
          <NuxtLink
            :to="`/signup/?redirect=/u/${slug}/review/`"
            class="inline-flex items-center justify-center px-5 py-2.5 bg-brand text-white rounded text-sm font-bold hover:bg-brand-hover transition-colors"
          >登録してエピソードを書く</NuxtLink>
        </template>
      </div>
    </div>

    <!-- タブ切替 -->
    <div class="flex border-b border-surface-border mb-6">
      <button
        class="flex-1 py-3 text-sm font-bold transition-colors border-b-2 -mb-px"
        :class="tab === 'reviews' ? 'text-brand border-brand' : 'text-ink-mute border-transparent hover:text-ink'"
        @click="tab = 'reviews'"
      >
        受け取った<span v-if="reviews.length" class="tabular-nums">({{ reviews.length }})</span>
      </button>
      <button
        class="flex-1 py-3 text-sm font-bold transition-colors border-b-2 -mb-px"
        :class="tab === 'given' ? 'text-brand border-brand' : 'text-ink-mute border-transparent hover:text-ink'"
        @click="tab = 'given'"
      >
        贈った<span v-if="givenCount" class="tabular-nums">({{ givenCount }})</span>
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
    <section v-show="tab === 'resume'" class="mb-8">
      <div v-if="!hasResume" class="text-center py-12 text-ink-mute">
        <p class="text-sm">まだ経歴が登録されていません。</p>
      </div>
      <div v-else class="space-y-8">
        <div v-if="profile.resume.experience.length">
          <h3 class="text-xs text-ink-mute mb-4">職歴</h3>
          <div class="relative ml-1.5">
            <div
              v-for="exp in profile.resume.experience"
              :key="exp.company + exp.title"
              class="relative pl-6 pb-6 last:pb-0 border-l border-surface-border last:border-transparent"
            >
              <span class="absolute -left-[5px] top-1 w-2.5 h-2.5 rounded-full bg-brand ring-2 ring-white" />
              <component
                :is="exp.url && isHttpUrl(exp.url) ? 'a' : 'div'"
                :href="exp.url && isHttpUrl(exp.url) ? exp.url : undefined"
                :target="exp.url && isHttpUrl(exp.url) ? '_blank' : undefined"
                :rel="exp.url && isHttpUrl(exp.url) ? 'nofollow ugc noopener noreferrer' : undefined"
                class="font-semibold text-sm text-ink flex items-center gap-2"
                :class="exp.url && isHttpUrl(exp.url) ? 'hover:text-brand transition-colors' : ''"
              >
                <img v-if="faviconUrl(exp.url)" :src="faviconUrl(exp.url)" alt="" class="w-4 h-4 rounded-sm flex-none" />
                <span>{{ exp.company }}</span>
              </component>
              <div v-if="exp.title" class="text-sm text-ink-soft mt-0.5">{{ exp.title }}</div>
              <div class="text-xs text-ink-mute mt-0.5">{{ exp.startDate }} – {{ exp.endDate }}</div>
              <p v-if="exp.description" class="text-xs text-ink-mute mt-1.5 leading-relaxed">{{ exp.description }}</p>
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
      <div v-else>
        <!-- 関係性の切り替え（全種類・0件も表示して収集を促す） -->
        <div class="flex flex-wrap gap-2 mb-5">
          <button
            class="px-3 py-1 rounded-full text-xs font-semibold border transition-colors"
            :class="relFilter === 'all' ? 'bg-brand text-white border-brand' : 'bg-surface border-line text-ink-soft hover:text-ink'"
            @click="relFilter = 'all'"
          >すべて<span class="tabular-nums">({{ reviews.length }})</span></button>
          <button
            v-for="rel in relOrder"
            :key="rel"
            class="px-3 py-1 rounded-full text-xs font-semibold border transition-colors"
            :class="relFilter === rel ? 'bg-brand text-white border-brand' : (countByRel(rel) === 0 ? 'bg-surface border-line text-ink-mute hover:text-ink-soft' : 'bg-surface border-line text-ink-soft hover:text-ink')"
            @click="relFilter = rel"
          >{{ RELATIONSHIP_LABELS[rel] }}<span class="tabular-nums">({{ countByRel(rel) }})</span></button>
        </div>

        <template v-if="filteredReviews.length">
          <ReviewCard
            v-for="review in visibleReviews"
            :key="review.id"
            :review="review"
            :profile-slug="slug"
            :show-giveback="isMyPage && !givenToUserIds.has(review.fromUserId)"
          />
          <button
            v-if="filteredReviews.length > visibleCount"
            class="w-full mt-4 py-3 rounded border border-surface-border text-sm font-semibold text-ink-mute hover:text-ink hover:border-brand transition-colors"
            @click="visibleCount += 10"
          >
            もっと見る（残り{{ filteredReviews.length - visibleCount }}件）
          </button>
        </template>

        <!-- 選択した関係性が0件：収集CTA -->
        <div v-else class="text-center py-10">
          <p class="text-sm text-ink-mute mb-4 leading-relaxed">
            <template v-if="relFilter !== 'all'">
              {{ RELATIONSHIP_LABELS[relFilter] }}からのエピソードはまだありません。<br>
              様々な方とのエピソードがあなたの信頼をつくりあげます。
            </template>
            <template v-else>まだエピソードがありません。</template>
          </p>
          <button
            v-if="isMyPage"
            class="inline-flex items-center justify-center px-5 py-2.5 bg-brand text-white rounded text-sm font-bold hover:bg-brand-hover transition-colors"
            @click="shareProfile"
          >{{ copied ? 'URLをコピーしました！' : 'URLをシェアしてエピソードを受け取る' }}</button>
        </div>
      </div>
    </section>

    <!-- 贈ったエピソード一覧（宛先を主役に） -->
    <section v-show="tab === 'given'">
      <div v-if="givenReviews.length === 0" class="text-center py-12 text-ink-mute">
        <p class="text-sm">まだ誰にもエピソードを贈っていません。</p>
      </div>
      <div v-else>
        <div v-for="g in givenReviews" :key="g.id" class="py-5 border-b border-line">
          <div class="flex items-center gap-2 mb-2">
            <!-- 贈った本人（プロフィール主） -->
            <img :src="hiResAvatar(profile.photoURL, 96)" alt="" class="w-8 h-8 rounded-full object-cover flex-none ring-1 ring-line" />
            <span class="text-ink-mute text-sm flex-none">→</span>
            <!-- 宛先 -->
            <NuxtLink v-if="g.toSlug" :to="`/u/${g.toSlug}/`" class="flex-none">
              <img :src="hiResAvatar(g.toPhotoURL, 96)" alt="" class="w-9 h-9 rounded-full object-cover bg-surface-card hover:ring-2 ring-brand transition-all" />
            </NuxtLink>
            <div v-else class="flex-none">
              <img :src="hiResAvatar(g.toPhotoURL, 96)" alt="" class="w-9 h-9 rounded-full object-cover bg-surface-card" />
            </div>
            <div class="min-w-0">
              <div class="flex items-center gap-2">
                <NuxtLink v-if="g.toSlug" :to="`/u/${g.toSlug}/`" class="text-sm font-bold text-brand hover:underline truncate">
                  {{ g.toDisplayName || 'ユーザー' }}さんへ
                </NuxtLink>
                <span v-else class="text-sm font-bold text-ink truncate">{{ g.toDisplayName || 'ユーザー' }}さんへ</span>
                <span v-if="g.relationship" class="text-[10px] px-2 py-0.5 rounded-sm bg-surface-card text-ink-soft font-semibold flex-none">{{ RELATIONSHIP_LABELS[g.relationship] }}</span>
              </div>
              <p v-if="g.toHeadline" class="text-xs text-ink-mute truncate">{{ g.toHeadline }}</p>
            </div>
          </div>
          <p class="text-sm text-ink-soft leading-relaxed whitespace-pre-wrap">{{ g.comment }}</p>
        </div>
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
import type { UserProfile, Review, Relationship, SnsLinks } from '~/types'
import { RELATIONSHIP_LABELS } from '~/types'

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

// SNSアイコン（入力済みのみ・http(s)のみ）
const SNS_META: { key: keyof SnsLinks; icon: string; label: string }[] = [
  { key: 'x', icon: 'simple-icons:x', label: 'X' },
  { key: 'instagram', icon: 'simple-icons:instagram', label: 'Instagram' },
  { key: 'linkedin', icon: 'simple-icons:linkedin', label: 'LinkedIn' },
  { key: 'facebook', icon: 'simple-icons:facebook', label: 'Facebook' },
  { key: 'youtube', icon: 'simple-icons:youtube', label: 'YouTube' },
  { key: 'note', icon: 'simple-icons:note', label: 'note' },
  { key: 'github', icon: 'simple-icons:github', label: 'GitHub' },
]
const snsList = computed(() =>
  SNS_META
    .map(m => ({ ...m, url: profile.value?.sns?.[m.key] ?? '' }))
    .filter(m => isHttpUrl(m.url)))
const reviews = ref<Review[]>(data.value?.reviews ?? [])
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

const tab = ref<'reviews' | 'given' | 'resume'>('reviews')

// 受け取ったエピソードの関係性フィルター
const relFilter = ref<Relationship | 'all'>('all')
// 全関係性を切り替えボタンに（0件も表示して「集めよう」を促す）
const relOrder = Object.keys(RELATIONSHIP_LABELS) as Relationship[]
function countByRel(rel: Relationship) {
  return reviews.value.filter(r => r.relationship === rel).length
}
const filteredReviews = computed(() =>
  relFilter.value === 'all'
    ? reviews.value
    : reviews.value.filter(r => r.relationship === relFilter.value))

// エピソードは10件ずつ表示（フィルター切替でリセット）
const visibleCount = ref(10)
watch(relFilter, () => { visibleCount.value = 10 })
const visibleReviews = computed(() => filteredReviews.value.slice(0, visibleCount.value))

// Facepile用：他己紹介をくれた人のアイコン（先頭6人）
const facepile = computed(() => reviews.value.slice(0, 6))

const isMyPage = computed(() =>
  !!currentUser.value && !!profile.value && currentUser.value.uid === profile.value.uid)

// この人が贈ったエピソード一覧（受け取った数は reviews.length）
const { getGivenReviews } = useReviews()
const { getProfileByUid } = useUserProfile()

// 受け取ったエピソードの投稿者を最新プロフィール（写真・名前・肩書き）に同期
onMounted(async () => {
  await Promise.all(reviews.value.map(async (r) => {
    try {
      const ap = await getProfileByUid(r.fromUserId)
      if (ap) {
        r.fromDisplayName = ap.displayName
        r.fromPhotoURL = ap.photoURL
        r.fromHeadline = ap.headline
        r.fromSlug = ap.slug
      }
    } catch { /* この1件はスキップ */ }
  }))
  reviews.value = [...reviews.value]
})
const givenReviews = ref<Review[]>([])
const givenCount = computed(() => givenReviews.value.length)
// お返しナッジ用：自分が既にエピソードを贈った相手のuid集合
const givenToUserIds = computed(() => new Set(givenReviews.value.map(g => g.toUserId)))
watch(profile, async (p) => {
  if (import.meta.client && p?.uid) {
    try {
      const list = await getGivenReviews(p.uid)
      givenReviews.value = list // まず表示
      // 宛先の最新プロフィール（氏名・写真・会社役職）を補完（1件失敗しても全体は落とさない）
      await Promise.all(list.map(async (g) => {
        try {
          const rp = await getProfileByUid(g.toUserId)
          if (rp) {
            g.toDisplayName = rp.displayName
            g.toPhotoURL = rp.photoURL
            g.toSlug = rp.slug
            g.toHeadline = rp.headline
          }
        } catch { /* この1件はスキップ */ }
      }))
      givenReviews.value = [...list] // 補完後に反映
    } catch { /* noop */ }
  }
}, { immediate: true })

// アバターが高解像度URLで読めない場合は元URLにフォールバック
function onAvatarError(e: Event) {
  const img = e.target as HTMLImageElement
  const original = profile.value?.photoURL ?? ''
  if (original && img.src !== original) img.src = original
}

const copied = ref(false)
async function shareProfile() {
  const url = window.location.href
  const name = profile.value?.displayName ?? ''
  // スマホ等はネイティブ共有シート、非対応環境はURLコピーにフォールバック
  if (navigator.share) {
    try {
      await navigator.share({
        title: `${name}さんのプロフィール`,
        text: `${name}さんへエピソードを書いてください`,
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
