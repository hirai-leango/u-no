<template>
  <div v-if="profile">
    <useSeoMeta
      :title="`${profile.displayName}の有能レビュー`"
      :og-title="`${profile.displayName}の有能レビュー`"
      :description="`有能スコア ${reviews.length} | ${profile.bio}`"
      :og-image="profile.photoURL"
    />

    <!-- ヘッダー -->
    <div class="flex items-start gap-4 mb-8">
      <img :src="profile.photoURL" class="w-16 h-16 rounded-full object-cover" />
      <div class="flex-1">
        <h1 class="text-xl font-extrabold text-white">{{ profile.displayName }}</h1>
        <p class="text-gray-400 text-sm mt-1">{{ profile.bio }}</p>
      </div>
      <div class="text-right">
        <div class="text-3xl font-extrabold bg-gradient-to-br from-brand-light to-brand bg-clip-text text-transparent">
          {{ reviews.length }}
        </div>
        <div class="text-xs text-gray-500 tracking-widest uppercase">有能スコア</div>
      </div>
    </div>

    <!-- アクションボタン -->
    <div class="flex gap-3 mb-10">
      <NuxtLink
        v-if="canReview"
        :to="`/u/${slug}/review`"
        class="px-5 py-2.5 bg-gradient-to-r from-brand to-brand-dark rounded-xl text-sm font-bold hover:opacity-80 transition-opacity"
      >
        レビューを書く
      </NuxtLink>
      <button
        class="px-5 py-2.5 bg-surface border border-surface-border rounded-xl text-sm font-semibold text-gray-400 hover:text-gray-200 transition-colors"
        @click="copyUrl"
      >
        {{ copied ? 'コピーしました！' : '🔗 URLをコピー' }}
      </button>
    </div>

    <!-- 履歴書 -->
    <section v-if="hasResume" class="mb-10">
      <h2 class="text-xs font-bold tracking-widest uppercase text-gray-500 mb-4">履歴書</h2>
      <div class="bg-surface border border-surface-border rounded-2xl p-6 space-y-6">
        <div v-if="profile.resume.summary">
          <h3 class="text-xs text-gray-500 mb-1">自己PR</h3>
          <p class="text-sm text-gray-200 leading-relaxed">{{ profile.resume.summary }}</p>
        </div>

        <div v-if="profile.resume.skills.length">
          <h3 class="text-xs text-gray-500 mb-2">スキル</h3>
          <div class="flex flex-wrap gap-2">
            <span
              v-for="skill in profile.resume.skills"
              :key="skill"
              class="px-3 py-1 bg-surface-deep border border-surface-border rounded-full text-xs text-brand-light"
            >{{ skill }}</span>
          </div>
        </div>

        <div v-if="profile.resume.experience.length">
          <h3 class="text-xs text-gray-500 mb-3">職歴</h3>
          <div class="space-y-4">
            <div v-for="exp in profile.resume.experience" :key="exp.company + exp.title">
              <div class="font-semibold text-sm text-gray-200">{{ exp.title }} @ {{ exp.company }}</div>
              <div class="text-xs text-gray-500 mt-0.5">{{ exp.startDate }} – {{ exp.endDate }}</div>
              <p v-if="exp.description" class="text-xs text-gray-400 mt-1 leading-relaxed">{{ exp.description }}</p>
            </div>
          </div>
        </div>

        <div v-if="profile.resume.education.length">
          <h3 class="text-xs text-gray-500 mb-3">学歴</h3>
          <div class="space-y-2">
            <div v-for="edu in profile.resume.education" :key="edu.institution">
              <div class="font-semibold text-sm text-gray-200">{{ edu.institution }}</div>
              <div class="text-xs text-gray-500">{{ edu.degree }} / {{ edu.field }} ({{ edu.startDate }} – {{ edu.endDate }})</div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- レビュー一覧 -->
    <section>
      <h2 class="text-xs font-bold tracking-widest uppercase text-gray-500 mb-4">有能レビュー</h2>
      <div v-if="reviews.length === 0" class="text-center py-12 text-gray-600">
        <p class="text-2xl mb-2">💭</p>
        <p class="text-sm">まだレビューがありません</p>
      </div>
      <div v-else class="space-y-4">
        <div
          v-for="review in reviews"
          :key="review.id"
          class="bg-surface border border-surface-border rounded-2xl p-5 relative overflow-hidden"
        >
          <div class="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-brand to-brand-dark opacity-60" />
          <div class="flex items-center gap-3 mb-3">
            <NuxtLink :to="`/u/${review.fromSlug}`">
              <img :src="review.fromPhotoURL" class="w-9 h-9 rounded-full object-cover hover:ring-2 ring-brand transition-all" />
            </NuxtLink>
            <div>
              <NuxtLink :to="`/u/${review.fromSlug}`" class="text-sm font-bold text-brand-light hover:underline">
                {{ review.fromDisplayName }}
              </NuxtLink>
              <div class="text-xs text-gray-600">{{ formatDate(review.updatedAt) }}</div>
            </div>
            <!-- 自分のレビューなら編集リンク -->
            <NuxtLink
              v-if="currentUser?.uid === review.fromUserId"
              :to="`/u/${slug}/review`"
              class="ml-auto text-xs text-gray-500 hover:text-gray-300 transition-colors"
            >
              編集
            </NuxtLink>
          </div>
          <p class="text-sm text-gray-300 leading-relaxed">{{ review.comment }}</p>
        </div>
      </div>
    </section>
  </div>

  <div v-else-if="notFound" class="text-center py-20 text-gray-600">
    <p class="text-4xl mb-4">🔍</p>
    <p>このユーザーは見つかりませんでした</p>
  </div>

  <div v-else class="text-center py-20 text-gray-600">
    <p class="text-sm">読み込み中...</p>
  </div>
</template>

<script setup lang="ts">
import type { UserProfile, Review } from '~/types'

const route = useRoute()
const slug = computed(() => route.params.slug as string)
const currentUser = useCurrentUser()

const { data } = await useAsyncData(`profile-${slug.value}`, async () => {
  const { getProfileBySlug } = useUserProfile()
  const { getReviews } = useReviews()
  const p = await getProfileBySlug(slug.value)
  if (!p) return { profile: null, reviews: [] }
  const r = await getReviews(p.uid)
  return { profile: p, reviews: r }
})

const profile = computed(() => data.value?.profile ?? null)
const reviews = computed(() => data.value?.reviews ?? [])
const notFound = computed(() => data.value?.profile === null)

const hasResume = computed(() => {
  const r = profile.value?.resume
  if (!r) return false
  return r.summary || r.skills.length || r.experience.length || r.education.length
})

const canReview = computed(() => {
  if (!currentUser.value) return false
  if (!profile.value) return false
  return currentUser.value.uid !== profile.value.uid
})

const copied = ref(false)
function copyUrl() {
  navigator.clipboard.writeText(window.location.href)
  copied.value = true
  setTimeout(() => copied.value = false, 2000)
}

function formatDate(date: any) {
  if (!date) return ''
  const d = date.toDate ? date.toDate() : new Date(date)
  return d.toLocaleDateString('ja-JP', { year: 'numeric', month: 'long', day: 'numeric' })
}
</script>
