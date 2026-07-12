<template>
  <div v-if="profile">
    <!-- ヘッダー -->
    <div class="flex items-start gap-4 mb-8">
      <img :src="profile.photoURL" class="w-16 h-16 rounded-full object-cover" />
      <div class="flex-1">
        <h1 class="text-xl font-extrabold text-ink">{{ profile.displayName }}</h1>
        <p v-if="profile.headline" class="text-brand text-sm font-semibold mt-0.5">{{ profile.headline }}</p>
        <p v-if="profile.bio" class="text-ink-soft text-sm mt-1">{{ profile.bio }}</p>
        <div v-if="profile.links && profile.links.length" class="flex flex-wrap gap-2 mt-2">
          <a
            v-for="l in profile.links"
            :key="l.url"
            :href="l.url"
            target="_blank"
            rel="noopener noreferrer"
            class="text-xs text-brand border border-surface-border rounded px-2 py-1 hover:border-brand transition-colors"
          >{{ l.label }}</a>
        </div>
      </div>
      <div class="text-right">
        <div class="text-3xl font-extrabold text-brand">
          {{ reviews.length }}
        </div>
        <div class="text-xs text-ink-mute tracking-widest">信頼スコア</div>
      </div>
    </div>

    <!-- アクションボタン -->
    <div class="flex gap-3 mb-10">
      <NuxtLink
        v-if="canReview"
        :to="`/u/${slug}/review`"
        class="px-5 py-2.5 bg-brand text-white rounded text-sm font-bold hover:bg-brand-hover transition-colors"
      >
        レビューを書く
      </NuxtLink>
      <button
        class="px-5 py-2.5 bg-surface border border-surface-border rounded text-sm font-semibold text-ink-mute hover:text-ink transition-colors"
        @click="copyUrl"
      >
        {{ copied ? 'コピーしました！' : 'URLをコピー' }}
      </button>
      <button
        v-if="isMyPage"
        class="px-5 py-2.5 bg-surface border border-surface-border rounded text-sm font-semibold text-ink-mute hover:text-warn transition-colors ml-auto"
        @click="logout"
      >
        ログアウト
      </button>
    </div>

    <!-- タブ切替 -->
    <div class="flex border-b border-surface-border mb-6">
      <button
        class="flex-1 py-3 text-sm font-bold transition-colors border-b-2 -mb-px"
        :class="tab === 'reviews' ? 'text-brand border-brand' : 'text-ink-mute border-transparent hover:text-ink'"
        @click="tab = 'reviews'"
      >
        レビュー<span v-if="reviews.length" class="ml-1 tabular-nums">{{ reviews.length }}</span>
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
        <div v-if="profile.resume.summary">
          <h3 class="text-xs text-ink-mute mb-1">自己PR</h3>
          <p class="text-sm text-ink leading-relaxed">{{ profile.resume.summary }}</p>
        </div>

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

    <!-- レビュー一覧 -->
    <section v-show="tab === 'reviews'">
      <div v-if="reviews.length === 0" class="text-center py-12 text-ink-mute">
        <p class="text-sm">まだ推薦のメッセージがありません。</p>
      </div>
      <div v-else class="space-y-4">
        <ReviewCard
          v-for="review in reviews"
          :key="review.id"
          :review="review"
          :profile-slug="slug"
        />
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
  description: () => profileData.value ? `有能スコア ${data.value?.reviews?.length ?? 0} | ${profileData.value.bio}` : '',
  ogImage: () => profileData.value?.photoURL ?? '',
  robots: () => (profileData.value && profileData.value.isSearchable === false) ? 'noindex, nofollow' : 'index, follow',
})

const profile = computed(() => data.value?.profile ?? null)
const reviews = computed(() => data.value?.reviews ?? [])
const notFound = computed(() => data.value?.profile === null)

const hasResume = computed(() => {
  const r = profile.value?.resume
  if (!r) return false
  return r.summary || r.experience.length || r.education.length
})

const canReview = computed(() => {
  if (!currentUser.value) return false
  if (!profile.value) return false
  return currentUser.value.uid !== profile.value.uid
})

const tab = ref<'reviews' | 'resume'>('reviews')

const isMyPage = computed(() =>
  !!currentUser.value && !!profile.value && currentUser.value.uid === profile.value.uid)

const copied = ref(false)
function copyUrl() {
  navigator.clipboard.writeText(window.location.href)
  copied.value = true
  setTimeout(() => copied.value = false, 2000)
}

async function logout() {
  if (!confirm('ログアウトしますか？')) return
  const { getAuth, signOut } = await import('firebase/auth')
  await signOut(getAuth())
  navigateTo('/')
}
</script>
