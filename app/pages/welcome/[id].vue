<template>
  <div class="max-w-md mx-auto pt-8">
    <div v-if="!pending" class="text-center py-20">
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
        <!-- ログイン済み：自分のアカウントに追加 -->
        <button
          v-if="currentUser"
          :disabled="claiming"
          class="block w-full text-center py-3.5 rounded-lg font-bold text-sm bg-brand text-white hover:bg-brand-hover transition-colors disabled:bg-disabled-bg disabled:text-disabled-text mb-3"
          @click="claimToMyAccount"
        >
          {{ claiming ? '受け取り中…' : '受け取る（あなたのプロフィールに追加）' }}
        </button>
        <!-- 未ログイン：登録して受け取る -->
        <NuxtLink
          v-else
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

const route = useRoute()
const id = computed(() => route.params.id as string)
const { claimPending } = useClaim()
const { getProfileByUid, saveProfile } = useUserProfile()

// SSRで取得（OG画像・リンクプレビュー・初回描画のため）
const { data } = await useFetch(`/api/pending/${id.value}`)
const pending = computed<any>(() => data.value?.pending ?? null)
const reviews = computed<any[]>(() => sortByCredibility((data.value?.reviews ?? []) as any))

const ogName = computed(() => pending.value?.name ?? '')
useSeoMeta({
  robots: 'noindex, nofollow',
  title: () => pending.value ? `${pending.value.name}さんへエピソードが届いています | ユーノーミー` : 'ユーノーミー',
  ogTitle: () => pending.value ? `${pending.value.name}さんへ、エピソードが届いています` : 'ユーノーミー',
  description: () => pending.value ? `知人があなたについて書いた「他己紹介」が届いています。受け取ると、あなたのプロフィールに表示されます。` : '',
  ogDescription: () => pending.value ? `知人があなたについて書いた「他己紹介」が届いています。受け取ると、あなたのプロフィールに表示されます。` : '',
  ogType: 'website',
  ogSiteName: 'ユーノーミー',
  twitterCard: 'summary_large_image',
})
const ogTop = computed(() => reviews.value[0] ?? null)
function ogTruncate(s: string, n: number) {
  const clean = (s ?? '').replace(/\s+/g, ' ').trim()
  return clean.length > n ? clean.slice(0, n) + '…' : clean
}
defineOgImageComponent('Welcome', {
  name: ogName.value,
  count: reviews.value.length,
  comment: ogTruncate(ogTop.value?.comment ?? '', 60),
  fromName: ogTop.value?.fromDisplayName ?? '',
  fromPhoto: ogTop.value?.fromPhotoURL ?? '',
  fromHeadline: ogTruncate(ogTop.value?.fromHeadline ?? '', 28),
}, { width: 1200, height: 630 })
const currentUser = useCurrentUser()
const { track } = useTrack()
const { showToast } = useToast()
const claiming = ref(false)

// ログイン済みユーザーが、届いたエピソードを自分のアカウントに追加
async function claimToMyAccount() {
  if (!currentUser.value || claiming.value) return
  claiming.value = true
  try {
    const ok = await claimPending(id.value, currentUser.value.uid)
    if (!ok) { showToast('受け取れませんでした（既に受け取り済みかもしれません）', { type: 'error' }); return }
    const my = await getProfileByUid(currentUser.value.uid)
    const ids = Array.isArray(my?.claimedPendingIds) ? my!.claimedPendingIds : []
    if (!ids.includes(id.value)) await saveProfile(currentUser.value.uid, { claimedPendingIds: [...ids, id.value] })
    track('claim_converted', { logged_in: true })
    navigateTo(my?.slug ? `/u/${my.slug}/` : '/')
  } catch {
    showToast('受け取りに失敗しました', { type: 'error' })
  } finally {
    claiming.value = false
  }
}

const claimed = computed(() => !!pending.value?.claimedByUid)
const initial = computed(() => (pending.value?.name ?? '?').trim().charAt(0) || '?')
const claimSignupUrl = computed(() => `/signup/?claim=${id.value}&redirect=${encodeURIComponent(`/welcome/${id.value}/`)}`)

const RECEIVED_REL_DISPLAY: Partial<Record<Relationship, string>> = { boss: '部下', subordinate: '上司' }
function relLabel(r: any) {
  const rel = r.relationship as Relationship
  if (!rel) return ''
  return RECEIVED_REL_DISPLAY[rel] ?? RELATIONSHIP_LABELS[rel] ?? ''
}
</script>
