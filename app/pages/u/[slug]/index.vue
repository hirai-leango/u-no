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
            <img :src="hiResAvatar(profile.photoURL)" :alt="`${profile.displayName}さんのプロフィール画像`" @error="onAvatarError" class="w-24 h-24 rounded-full object-cover flex-none ring-4 ring-white/90 shadow-lg" />
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
              <Icon v-if="s.icon" :name="s.icon" class="text-xl" />
              <svg v-else viewBox="0 0 24 24" fill="currentColor" class="w-5 h-5" v-html="s.svg" />
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
        経歴<span v-if="isMyPage && !hasResume" class="ml-1 inline-block w-1.5 h-1.5 rounded-full bg-brand align-middle" title="未入力"></span>
      </button>
    </div>

    <!-- 経歴 -->
    <section v-show="tab === 'resume'" class="mb-8">
      <div v-if="!hasResume" class="py-10 text-center">
        <div v-if="isMyPage" class="max-w-sm mx-auto rounded-xl bg-surface-deep px-6 py-8">
          <p class="text-sm font-bold text-ink mb-2">職歴を追加しませんか？</p>
          <p class="text-xs text-ink-mute leading-relaxed mb-5 text-left">
            あなたの歩み（会社・役割）が分かると、受け取ったエピソードの説得力が一段と増し、初対面の相手や取引先に「どんな人か」がより伝わります。検索にも載りやすくなります。
          </p>
          <NuxtLink
            to="/settings/resume/"
            class="inline-block px-5 py-2.5 rounded-lg font-bold text-sm bg-brand text-white hover:bg-brand-hover transition-colors"
          >職歴を追加する →</NuxtLink>
        </div>
        <p v-else class="text-sm text-ink-mute">まだ経歴が登録されていません。</p>
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
            :owner-name="profile.displayName"
            :owner-photo="profile.photoURL"
            :is-mutual="mutualUids.has(review.fromUserId)"
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
      <div v-if="visibleGivenReviews.length === 0" class="text-center py-12 text-ink-mute">
        <p class="text-sm">まだ誰にもエピソードを贈っていません。</p>
      </div>
      <div v-else>
        <article v-for="g in visibleGivenReviews" :key="g.id" class="py-5 border-b border-line">
          <div class="flex items-center gap-2 mb-2">
            <!-- 贈った本人（プロフィール主） -->
            <img :src="hiResAvatar(profile.photoURL, 96)" alt="" class="w-9 h-9 rounded-full object-cover flex-none ring-1 ring-line bg-surface-card" />
            <span class="text-ink-mute text-sm flex-none">→</span>
            <!-- 宛先 -->
            <NuxtLink v-if="g.toSlug" :to="`/u/${g.toSlug}/`" class="flex-none">
              <img :src="hiResAvatar(g.toPhotoURL, 96)" alt="" class="w-9 h-9 rounded-full object-cover ring-1 ring-line hover:ring-2 ring-brand transition-all bg-surface-card" />
            </NuxtLink>
            <div v-else class="flex-none">
              <img :src="hiResAvatar(g.toPhotoURL, 96)" alt="" class="w-9 h-9 rounded-full object-cover ring-1 ring-line bg-surface-card" />
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
              <p class="text-xs text-ink-mute">{{ formatDate(g.updatedAt) }}</p>
            </div>
            <div v-if="isMyPage" class="ml-auto flex items-center gap-3 flex-none">
              <button
                class="text-xs font-semibold text-brand hover:underline whitespace-nowrap"
                @click="shareGiven(g)"
              >{{ givenShareCopiedId === g.id ? 'コピー済み！' : 'シェア' }}</button>
              <button
                class="text-xs text-ink-mute hover:text-warn transition-colors whitespace-nowrap"
                @click="deleteGiven(g)"
              >削除</button>
            </div>
          </div>
          <p class="text-sm text-ink-soft leading-relaxed whitespace-pre-wrap">{{ g.comment }}</p>
        </article>
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

  <!-- 相互達成の祝福（マイページ再訪時） -->
  <div v-if="showMutualModal" class="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4" @click.self="showMutualModal = false">
    <div class="pointer-events-none absolute inset-0 overflow-hidden">
      <img
        v-for="c in mutualConfetti"
        :key="c.id"
        src="/og-yunomi.png"
        alt=""
        class="mconfetti"
        :style="{ left: c.left + '%', width: c.size + 'px', opacity: c.opacity, animationDelay: c.delay + 's', animationDuration: c.dur + 's' }"
      />
    </div>
    <div class="mpop relative w-full max-w-sm bg-surface border border-surface-border rounded-2xl p-7 text-center">
      <div class="flex items-center justify-center gap-1 mb-4">
        <img :src="hiResAvatar(profile?.photoURL) || '/favicon-192.png'" class="mav mav-l w-16 h-16 rounded-full object-cover ring-2 ring-white shadow-md" alt="" />
        <img src="/og-yunomi.png" alt="" class="mheart w-6 mx-1" />
        <img :src="hiResAvatar(mutualPartner?.photo) || '/favicon-192.png'" class="mav mav-r w-16 h-16 rounded-full object-cover ring-2 ring-white shadow-md" alt="" />
      </div>
      <h2 class="text-lg font-black text-ink mb-2">エピソードを贈りあいました</h2>
      <p class="text-sm text-ink-soft leading-relaxed mb-6">
        {{ mutualPartner?.name }}さんと、<br>お互いのエピソードを投稿しました。<br>
        あなたのエピソードが信頼を紡ぎます。<br>
        <span class="text-brand font-black">You know me !</span>
      </p>
      <button
        class="w-full py-3 rounded-lg font-bold text-sm bg-brand text-white hover:bg-brand-hover transition-colors"
        @click="showMutualModal = false"
      >閉じる</button>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { UserProfile, Review, Relationship, SnsLinks } from '~/types'
import { RELATIONSHIP_LABELS } from '~/types'

const route = useRoute()
const slug = computed(() => route.params.slug as string)
const currentUser = useCurrentUser()
const { track } = useTrack()

const { data } = await useFetch(`/api/profile/${slug.value}`)

const profileData = computed(() => data.value?.profile ?? null)

// SEO: 氏名＋社名/役職をtitleに入れて「名前＋会社」検索・同姓同名の区別・CTRを改善
const seoTrunc = (s: string, n: number) => { const c = (s ?? '').replace(/\s+/g, ' ').trim(); return c.length > n ? c.slice(0, n) + '…' : c }
const seoTitle = () => {
  const p = profileData.value
  if (!p) return 'ユーノーミー'
  const h = seoTrunc(p.headline ?? '', 28)
  return h ? `${p.displayName}（${h}）| ユーノーミー` : `${p.displayName} | ユーノーミー`
}
const seoDesc = () => {
  const p = profileData.value
  if (!p) return ''
  const role = seoTrunc(p.headline ?? '', 30)
  const lead = role ? `${p.displayName}（${role}）` : `${p.displayName}さん`
  const body = (p.bio ?? '').trim() || '知人・同僚が書いたエピソードで、人柄や仕事ぶり・信頼がわかります。'
  return seoTrunc(`${lead}の他己紹介。${body}`, 120)
}
useSeoMeta({
  title: seoTitle,
  ogTitle: seoTitle,
  description: seoDesc,
  ogDescription: seoDesc,
  // 検索設定OFF、または エピソード（受け取り＋贈り）が3件未満なら noindex（薄いページを出さない）
  robots: () => {
    const p = profileData.value
    if (!p || p.isSearchable === false) return 'noindex, nofollow'
    const total = (data.value?.reviews?.length ?? 0) + (data.value?.givenCount ?? 0)
    return total >= 3 ? 'index, follow' : 'noindex, nofollow'
  },
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

// 構造化データ（ProfilePage > Person + BreadcrumbList）
// ProfilePage はGoogle公式サポート型（人物プロフィール向け）。
// 注意: Person に Review を埋め込むと、Googleが人物レビュー（非対応）と判定してエラーに
// なるため埋め込まない。エピソード数は interactionStatistic（ProfilePage対応）で表す。
useHead(() => {
  const p = profileData.value
  if (!p) return {}
  const SITE = 'https://u-no.me'
  const url = `${SITE}/u/${p.slug}/`
  const sameAs = Object.values(p.sns ?? {}).filter(u => isHttpUrl(u ?? '')) as string[]

  const person: Record<string, any> = {
    '@type': 'Person',
    '@id': `${url}#person`,
    name: p.displayName,
    url,
  }
  if (p.photoURL) person.image = p.photoURL
  if (p.headline) person.jobTitle = p.headline
  if (p.bio) person.description = p.bio
  if (sameAs.length) person.sameAs = sameAs
  // 勤務先・学歴（人物を企業/学校エンティティに接続＝Knowledge Graph向け）
  const exp = (p.resume?.experience ?? []).find(e => (e.company ?? '').trim())
  if (exp?.company) person.worksFor = { '@type': 'Organization', name: exp.company }
  const edu = (p.resume?.education ?? []).find(e => (e.institution ?? '').trim())
  if (edu?.institution) person.alumniOf = { '@type': 'EducationalOrganization', name: edu.institution }

  // 受け取ったエピソード数（ProfilePageが公式サポートする指標）
  const reviewCount = data.value?.reviews?.length ?? 0
  if (reviewCount > 0) {
    person.interactionStatistic = {
      '@type': 'InteractionCounter',
      interactionType: 'https://schema.org/WriteAction',
      userInteractionCount: reviewCount,
    }
  }

  const profilePage = {
    '@type': 'ProfilePage',
    '@id': url,
    url,
    mainEntity: person,
  }
  const breadcrumb = {
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'ホーム', item: `${SITE}/` },
      { '@type': 'ListItem', position: 2, name: `${p.displayName}さん` },
    ],
  }
  return {
    script: [{
      type: 'application/ld+json',
      innerHTML: JSON.stringify({ '@context': 'https://schema.org', '@graph': [profilePage, breadcrumb] }),
    }],
  }
})

const profile = computed(() => data.value?.profile ?? null)
// リンクは http(s) のみ許可（javascript: 等のXSSを排除）
const safeLinks = computed(() => (profile.value?.links ?? []).filter(l => isHttpUrl(l.url)))

// SNSアイコン（入力済みのみ・http(s)のみ）
// icon: @nuxt/icon 名 / svg: brandアイコンが無い場合のインラインSVG（Chatworkはどのセットにも無いため）
const CHATWORK_SVG = '<path d="M12 2C6.477 2 2 6.03 2 11c0 2.79 1.4 5.28 3.6 6.92V22l3.9-2.16c.8.2 1.63.31 2.5.31 5.523 0 10-4.03 10-9S17.523 2 12 2z"/>'
const SNS_META: { key: keyof SnsLinks; icon: string; label: string; svg?: string }[] = [
  { key: 'x', icon: 'simple-icons:x', label: 'X' },
  { key: 'instagram', icon: 'simple-icons:instagram', label: 'Instagram' },
  { key: 'linkedin', icon: 'simple-icons:linkedin', label: 'LinkedIn' },
  { key: 'facebook', icon: 'simple-icons:facebook', label: 'Facebook' },
  { key: 'youtube', icon: 'simple-icons:youtube', label: 'YouTube' },
  { key: 'note', icon: 'simple-icons:note', label: 'note' },
  { key: 'github', icon: 'simple-icons:github', label: 'GitHub' },
  { key: 'chatwork', icon: '', label: 'Chatwork', svg: CHATWORK_SVG },
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
const filteredReviews = computed(() => {
  const base = relFilter.value === 'all'
    ? reviews.value
    : reviews.value.filter(r => r.relationship === relFilter.value)
  // S0-2: 信頼できる順に並べる（非対称推薦を上・相互を下、同点は新しい順）。数値は非表示
  return sortByCredibility(base, mutualUids.value)
})

// エピソードは10件ずつ表示（フィルター切替でリセット）
const visibleCount = ref(10)
watch(relFilter, () => { visibleCount.value = 10 })
const visibleReviews = computed(() => filteredReviews.value.slice(0, visibleCount.value))

// Facepile用：他己紹介をくれた人のアイコン（先頭6人）
const facepile = computed(() => reviews.value.slice(0, 6))

const isMyPage = computed(() =>
  !!currentUser.value && !!profile.value && currentUser.value.uid === profile.value.uid)

// composableのdestructureはwatchより前に宣言（immediate watchでのTDZを回避）
const { deleteReview } = useReviews()
const { getProfileByUid, saveProfile } = useUserProfile()
const { getPending } = useClaim()

// 受け取り通知（ヘッダー赤ドット）を、本人がマイページを見たらクリア（最終閲覧件数を更新）
const hasNewReceived = useState('hasNewReceived', () => false)
watch(isMyPage, (mine) => {
  if (!import.meta.client || !mine || !currentUser.value || !profile.value) return
  hasNewReceived.value = false
  const directReceived = (data.value?.reviews ?? []).filter((r: any) => r.toUserId === profile.value!.uid).length
  saveProfile(currentUser.value.uid, { lastSeenReceivedCount: directReceived }).catch(() => {})
}, { immediate: true })

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
// SSRで返ってきた贈ったエピソードで初期化（クローラに見せる）。クライアントで再解決して最新化
const givenReviews = ref<Review[]>((data.value?.given ?? []) as Review[])
// プライバシー: 未登録の相手への贈ったエピソードは、相手が受け取るまで本人以外に見せない。
// （未登録/未受け取りは toSlug が解決されず空。登録済み相手のみ toSlug を持つ）
const visibleGivenReviews = computed(() =>
  isMyPage.value ? givenReviews.value : givenReviews.value.filter(g => !!g.toSlug))
const givenCount = computed(() => visibleGivenReviews.value.length)
// 日付表示（ReviewCardと同じ書式で揃える）
function formatDate(date: any) {
  if (!date) return ''
  const d = date.toDate ? date.toDate() : new Date(date)
  return d.toLocaleDateString('ja-JP', { year: 'numeric', month: 'long', day: 'numeric' })
}
// 贈ったエピソードを本人がシェア（相手について書いたことを拡散）
// 贈ったエピソードを削除（本人のみ・自分が書いたもの）
async function deleteGiven(g: Review) {
  if (!currentUser.value) return
  const label = g.toDisplayName ? `${g.toDisplayName}さんへの` : ''
  if (!confirm(`この${label}エピソードを削除しますか？この操作は取り消せません。`)) return
  try {
    await deleteReview(g.toUserId, currentUser.value.uid)
    givenReviews.value = givenReviews.value.filter(x => x.id !== g.id)
  } catch {
    alert('削除に失敗しました。時間をおいて再度お試しください。')
  }
}
const givenShareCopiedId = ref('')
async function shareGiven(g: Review) {
  if (!g.toSlug) return
  track('episode_shared', { kind: 'given' })
  const url = `${window.location.origin}/u/${g.toSlug}/e/${g.id}/`
  if (navigator.share) {
    try {
      await navigator.share({ title: 'ユーノーミー', text: `${g.toDisplayName || 'この方'}さんについて、エピソードを書きました。`, url })
    } catch { /* キャンセル */ }
  } else {
    await navigator.clipboard.writeText(url)
    givenShareCopiedId.value = g.id
    setTimeout(() => (givenShareCopiedId.value = ''), 2000)
  }
}
// 相互達成の祝福（マイページ再訪時に、未祝福の相互があれば表示）
const showMutualModal = ref(false)
const mutualPartner = ref<{ name: string; photo: string; slug: string } | null>(null)
const mutualConfetti = Array.from({ length: 30 }, (_, i) => ({
  id: i,
  left: Math.round(Math.random() * 100),
  size: Math.round(14 + Math.random() * 22),
  delay: +(Math.random() * 1.4).toFixed(2),
  dur: +(2.4 + Math.random() * 2.4).toFixed(2),
  opacity: +(0.35 + Math.random() * 0.5).toFixed(2),
}))
// お返しナッジ用：自分が既にエピソードを贈った相手のuid集合
const givenToUserIds = computed(() => new Set(givenReviews.value.map(g => g.toUserId)))
// S0-3 相互ペア検出：このプロフィールが「受け取った相手」かつ「贈った相手」＝相互称賛
// （信用スコアではこれを減点する土台。表示は控えめな「相互」タグのみ）
const mutualUids = computed(() => {
  const given = givenToUserIds.value
  return new Set(reviews.value.map(r => r.fromUserId).filter(uid => given.has(uid)))
})
watch(profile, async (p) => {
  if (import.meta.client && p?.uid) {
    try {
      // SSRで取得済みの「贈った」を使う（再取得しない＝重複クエリを削減）
      const list = givenReviews.value
      // 未登録(pending)宛で未解決(toSlug空)のものだけ、受け取り済みなら本人で解決（claim補完）。
      // 登録済み相手は保存済みの氏名・写真をそのまま使い、N+1のプロフィール再取得を避ける。
      await Promise.all(list.filter(g => !g.toSlug).map(async (g) => {
        try {
          const pend = await getPending(g.toUserId)
          if (pend?.claimedByUid) {
            const rp = await getProfileByUid(pend.claimedByUid)
            if (rp) {
              g.toDisplayName = rp.displayName
              g.toPhotoURL = rp.photoURL
              g.toSlug = rp.slug
              g.toHeadline = rp.headline
            }
          }
        } catch { /* この1件はスキップ */ }
      }))
      givenReviews.value = [...list] // 補完後に反映
      // 自分のマイページ：未祝福の相互があれば祝福モーダルを表示
      if (isMyPage.value) {
        const givenUids = new Set(list.map(g => g.toUserId))
        const celebrated = new Set(((p as any).celebratedMutuals ?? []) as string[])
        const partner = reviews.value.find(r => givenUids.has(r.fromUserId) && !celebrated.has(r.fromUserId))
        if (partner) {
          mutualPartner.value = { name: partner.fromDisplayName, photo: partner.fromPhotoURL, slug: partner.fromSlug }
          showMutualModal.value = true
          try {
            await saveProfile(p.uid, { celebratedMutuals: [...((p as any).celebratedMutuals ?? []), partner.fromUserId] })
          } catch { /* noop */ }
        }
      }
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
  // 計測(S0-1): 自分のプロフィール共有＝招待。?ref={自分uid}でK測定
  const isInvite = isMyPage.value && !!profile.value?.uid
  const url = isInvite
    ? `${window.location.origin}/u/${slug.value}/?ref=${profile.value!.uid}`
    : window.location.href
  track(isInvite ? 'invite_sent' : 'profile_shared', { source: 'profile_cta' })
  const name = profile.value?.displayName ?? ''
  // スマホ等はネイティブ共有シート、非対応環境はURLコピーにフォールバック
  if (navigator.share) {
    try {
      await navigator.share({
        title: `${name}さんのプロフィール`,
        text: `${name}さんとのエピソードを書いていただけませんか？`,
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

<style scoped>
.mpop { animation: mpop .38s cubic-bezier(.2, .8, .2, 1); }
@keyframes mpop { from { opacity: 0; transform: scale(.92) translateY(10px); } to { opacity: 1; transform: none; } }
.mav { animation: mav .5s .08s backwards cubic-bezier(.2, .9, .3, 1.4); }
.mav-r { animation-delay: .18s; }
.mheart { display: inline-block; animation: mheart .9s .34s both ease; }
@keyframes mav { from { opacity: 0; transform: scale(.4); } to { opacity: 1; transform: none; } }
@keyframes mheart { 0% { transform: scale(0); } 55% { transform: scale(1.35); } 75% { transform: scale(.9); } 100% { transform: scale(1); } }
.mconfetti { position: absolute; bottom: -8%; animation-name: mfloat; animation-timing-function: ease-out; animation-iteration-count: 1; animation-fill-mode: forwards; will-change: transform, opacity; }
@keyframes mfloat { 0% { transform: translateY(0) rotate(0deg); opacity: 0; } 15% { opacity: .7; } 85% { opacity: .7; } 100% { transform: translateY(-118vh) rotate(300deg); opacity: 0; } }
@media (prefers-reduced-motion: reduce) { .mpop, .mav, .mheart, .mconfetti { animation: none; } .mconfetti { display: none; } }
</style>
