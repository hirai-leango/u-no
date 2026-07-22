<template>
  <div class="relative py-5 border-b border-line"
    :class="{ 'opacity-60': isFlagged }">

    <!-- 不当フラグ -->
    <div v-if="isFlagged" class="mb-3 text-xs text-warn bg-warn/10 rounded px-3 py-1.5 inline-block">
      ⚠️ 多くの人がこのエピソードを不当と評価しています
    </div>

    <!-- レビュアー情報 -->
    <div class="flex items-start gap-3 mb-3">
      <NuxtLink :to="`/u/${review.fromSlug}/`">
        <img :src="hiResAvatar(review.fromPhotoURL)" class="w-9 h-9 rounded-full object-cover hover:ring-2 ring-brand transition-all" />
      </NuxtLink>
      <div class="min-w-0 flex-1">
        <div class="flex items-center gap-2 flex-wrap">
          <NuxtLink :to="`/u/${review.fromSlug}/`" class="text-sm font-bold text-brand hover:underline">
            {{ review.fromDisplayName }}
          </NuxtLink>
          <span
            v-if="review.relationship"
            class="text-[10px] px-2 py-0.5 rounded-sm bg-surface-card text-ink-soft font-semibold"
          >
            {{ relationshipLabel }}
          </span>
        </div>
        <div v-if="review.fromHeadline" class="text-xs text-ink-soft">{{ review.fromHeadline }}</div>
        <div class="text-xs text-ink-mute">{{ formatDate(review.updatedAt) }}</div>
      </div>
      <NuxtLink
        v-if="currentUser?.uid === review.fromUserId"
        :to="`/u/${profileSlug}/review/`"
        class="ml-auto flex-none whitespace-nowrap text-xs text-ink-mute hover:text-ink-soft transition-colors"
      >
        編集
      </NuxtLink>
      <button
        v-else-if="currentUser"
        class="ml-auto flex-none whitespace-nowrap text-xs text-ink-mute hover:text-warn transition-colors"
        @click="reportReview"
      >
        通報
      </button>
    </div>

    <p class="text-sm text-ink-soft leading-relaxed mb-4 whitespace-pre-wrap">{{ review.comment }}</p>

    <!-- 評価バー -->
    <div class="flex items-center gap-2 mb-3">
      <button
        class="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border transition-colors"
        :class="myVote === 'fair' ? 'bg-good text-white border-good' : 'bg-surface-deep text-ink-soft border-line hover:text-ink'"
        @click="vote('fair')"
      >
        ◯ Good <span v-if="fairCount" class="tabular-nums">{{ fairCount }}</span>
      </button>
      <button
        class="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border transition-colors"
        :class="myVote === 'unfair' ? 'bg-empty text-white border-empty' : 'bg-surface-deep text-ink-soft border-line hover:text-ink'"
        @click="vote('unfair')"
      >
        ✕ Bad <span v-if="unfairCount" class="tabular-nums">{{ unfairCount }}</span>
      </button>

      <!-- 投票者アイコン（重ねて表示） -->
      <div v-if="votes.length" class="flex items-center -space-x-1.5 ml-1">
        <NuxtLink
          v-for="v in votes.slice(0, 6)"
          :key="v.id"
          :to="`/u/${v.voterSlug}/`"
          :title="`${v.voterName}（${v.value === 'fair' ? 'Good' : 'Bad'}）`"
        >
          <img
            :src="v.voterPhoto"
            class="w-5 h-5 rounded-full object-cover ring-2 ring-surface"
            :class="v.value === 'fair' ? 'outline outline-1 outline-good' : 'outline outline-1 outline-empty'"
          />
        </NuxtLink>
        <span v-if="votes.length > 6" class="text-[10px] text-ink-mute pl-2">+{{ votes.length - 6 }}</span>
      </div>

      <button
        class="ml-auto flex items-center gap-1 text-xs text-ink-mute hover:text-ink-soft transition-colors"
        @click="showComments = !showComments"
      >
        コメント <span v-if="comments.length" class="tabular-nums">{{ comments.length }}</span>
      </button>
    </div>

    <!-- コメントツリー -->
    <div v-if="showComments" class="border-t border-surface-border pt-3 mt-3 space-y-3">
      <div v-if="comments.length === 0" class="text-xs text-ink-mute">まだコメントがありません</div>

      <div
        v-for="c in topLevelComments"
        :key="c.id"
        class="space-y-2"
      >
        <ReviewCommentItem
          :comment="c"
          :current-user="currentUser"
          @reply="onReply"
          @delete="onDelete"
        />
        <!-- 返信 -->
        <div class="ml-8 space-y-2">
          <ReviewCommentItem
            v-for="child in childrenOf(c.id)"
            :key="child.id"
            :comment="child"
            :current-user="currentUser"
            @reply="onReply"
            @delete="onDelete"
          />
        </div>
      </div>

      <!-- コメント入力 -->
      <div v-if="currentUser" class="flex gap-2 pt-1">
        <input
          v-model="newComment"
          type="text"
          maxlength="1000"
          :placeholder="replyTo ? '返信を書く…' : 'コメントを書く…'"
          class="flex-1 bg-surface-deep border border-surface-border rounded-lg px-3 py-2 text-xs outline-none focus:border-brand transition-colors text-ink placeholder-ink-mute"
          @keydown.enter.prevent="submitComment"
        />
        <button
          class="px-3 py-2 bg-brand text-white rounded text-xs font-bold hover:bg-brand-hover transition-colors"
          @click="submitComment"
        >送信</button>
      </div>
      <div v-if="replyTo" class="text-xs text-ink-mute ml-1">
        返信中… <button class="text-brand-light" @click="replyTo = null">キャンセル</button>
      </div>
    </div>

    <!-- お返しナッジ（本人閲覧＆未お返しのみ） -->
    <NuxtLink
      v-if="showGiveback"
      :to="`/u/${review.fromSlug}/review/`"
      class="mt-4 flex items-center gap-3 rounded-lg bg-surface-deep px-4 py-3 hover:bg-surface-card transition-colors"
    >
      <img src="/og-yunomi.png" alt="" class="w-6 flex-none" />
      <span class="text-xs text-ink-soft leading-relaxed">
        {{ review.fromDisplayName }}さんも、あなたへエピソードを贈っています。<br>
        <span class="font-bold text-brand">エピソードを贈り返す</span>
      </span>
    </NuxtLink>
  </div>
</template>

<script setup lang="ts">
import type { Review, Vote, ReviewComment, Relationship } from '~/types'
import { hiResAvatar } from '~/utils/url'
import { RELATIONSHIP_LABELS } from '~/types'

const props = defineProps<{
  review: Review
  profileSlug: string
  showGiveback?: boolean
}>()

// 格納は「相手（＝◯◯さん）が投稿者にとって何か」。プロフィール上では
// 「投稿者が◯◯さんにとって何者か」を出したいので上司/部下を反転して表示。
const RECEIVED_REL_DISPLAY: Partial<Record<Relationship, string>> = {
  boss: '部下',        // ◯◯さんが投稿者の上司 → 投稿者は◯◯さんの部下
  subordinate: '上司', // ◯◯さんが投稿者の部下 → 投稿者は◯◯さんの上司
}
const relationshipLabel = computed(() => {
  const r = props.review.relationship
  if (!r) return ''
  return RECEIVED_REL_DISPLAY[r] ?? RELATIONSHIP_LABELS[r]
})

const currentUser = useCurrentUser()
const { getVotes, setVote, getComments, addComment, deleteComment } = useReviewInteractions()
const { getProfileByUid } = useUserProfile()
const { reportTarget } = useReports()

const votes = ref<Vote[]>([])
const comments = ref<ReviewComment[]>([])
const showComments = ref(false)
const newComment = ref('')
const replyTo = ref<string | null>(null)
const posting = ref(false)

// クライアント側レート制限: 直近の送信からの最小間隔（ミリ秒）
let lastCommentAt = 0
const COMMENT_INTERVAL = 5000

const fairCount = computed(() => votes.value.filter(v => v.value === 'fair').length)
const unfairCount = computed(() => votes.value.filter(v => v.value === 'unfair').length)
const myVote = computed(() => votes.value.find(v => v.voterUid === currentUser.value?.uid)?.value ?? null)

// 不当が2以上かつフェアの2倍以上で「不当フラグ」
const isFlagged = computed(() => unfairCount.value >= 2 && unfairCount.value >= fairCount.value * 2)

const topLevelComments = computed(() => comments.value.filter(c => !c.parentId))
function childrenOf(id: string) {
  return comments.value.filter(c => c.parentId === id)
}

function formatDate(date: any) {
  if (!date) return ''
  const d = date.toDate ? date.toDate() : new Date(date)
  return d.toLocaleDateString('ja-JP', { year: 'numeric', month: 'long', day: 'numeric' })
}

async function loadInteractions() {
  votes.value = await getVotes(props.review.id)
  comments.value = await getComments(props.review.id)
  // 投票者アイコンを最新プロフィール写真に反映（画像変更後の食い違いを防ぐ）
  await Promise.all(votes.value.map(async (v) => {
    try {
      const p = await getProfileByUid(v.voterUid)
      if (p?.photoURL) v.voterPhoto = p.photoURL
      if (p?.displayName) v.voterName = p.displayName
    } catch { /* この1件はスキップ */ }
  }))
  votes.value = [...votes.value]
  // コメント投稿者アイコンも最新プロフィール写真に反映
  await Promise.all(comments.value.map(async (c) => {
    try {
      const p = await getProfileByUid(c.authorUid)
      if (p?.photoURL) c.authorPhoto = p.photoURL
      if (p?.displayName) c.authorName = p.displayName
    } catch { /* この1件はスキップ */ }
  }))
  comments.value = [...comments.value]
}

async function vote(value: 'fair' | 'unfair') {
  if (!currentUser.value) return alert('投票するにはログインが必要です')
  const myProfile = await getProfileByUid(currentUser.value.uid)
  await setVote(props.review.id, {
    uid: currentUser.value.uid,
    displayName: currentUser.value.displayName ?? '',
    photoURL: currentUser.value.photoURL ?? '',
    slug: myProfile?.slug ?? '',
  }, value)
  votes.value = await getVotes(props.review.id)
}

function onReply(commentId: string) {
  replyTo.value = commentId
  showComments.value = true
}

async function onDelete(commentId: string) {
  if (!confirm('コメントを削除しますか？')) return
  await deleteComment(commentId)
  comments.value = await getComments(props.review.id)
}

async function submitComment() {
  if (!currentUser.value || !newComment.value.trim() || posting.value) return
  // レート制限: 5秒以内の連投を拒否
  const now = Date.now()
  if (now - lastCommentAt < COMMENT_INTERVAL) {
    alert('コメントの間隔が短すぎます。少し待ってください。')
    return
  }
  posting.value = true
  try {
    const myProfile = await getProfileByUid(currentUser.value.uid)
    const created = await addComment(props.review.id, replyTo.value, {
      uid: currentUser.value.uid,
      displayName: currentUser.value.displayName ?? '',
      photoURL: currentUser.value.photoURL ?? '',
      slug: myProfile?.slug ?? '',
    }, newComment.value.trim())
    lastCommentAt = Date.now()
    newComment.value = ''
    replyTo.value = null
    // 即時反映（サーバー再取得を待たずローカルに追加）
    comments.value = [...comments.value, created]
  } finally {
    posting.value = false
  }
}

async function reportReview() {
  if (!currentUser.value) return alert('通報するにはログインが必要です')
  const reason = prompt('通報理由を入力してください（誹謗中傷・スパム・なりすまし など）')
  if (!reason?.trim()) return
  await reportTarget('review', props.review.id, currentUser.value.uid, reason.trim())
  alert('通報を受け付けました。運営が確認します。')
}

onMounted(loadInteractions)
</script>
