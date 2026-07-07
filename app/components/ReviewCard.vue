<template>
  <div class="bg-surface border border-surface-border rounded-2xl p-5 relative overflow-hidden"
    :class="{ 'opacity-60': isFlagged }">
    <div class="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-brand to-brand-dark opacity-60" />

    <!-- 不当フラグ -->
    <div v-if="isFlagged" class="mb-3 text-xs text-orange-400 bg-orange-400/10 rounded-lg px-3 py-1.5 inline-block">
      ⚠️ 多くの人がこのレビューを不当と評価しています
    </div>

    <!-- レビュアー情報 -->
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
      <NuxtLink
        v-if="currentUser?.uid === review.fromUserId"
        :to="`/u/${profileSlug}/review`"
        class="ml-auto text-xs text-gray-500 hover:text-gray-300 transition-colors"
      >
        編集
      </NuxtLink>
      <button
        v-else-if="currentUser"
        class="ml-auto text-xs text-gray-600 hover:text-orange-400 transition-colors"
        @click="reportReview"
      >
        通報
      </button>
    </div>

    <p class="text-sm text-gray-300 leading-relaxed mb-4">{{ review.comment }}</p>

    <!-- 公正さ評価 -->
    <div class="flex items-center gap-2 mb-3">
      <button
        class="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors"
        :class="myVote === 'fair' ? 'bg-brand text-white' : 'bg-surface-deep text-gray-400 hover:text-gray-200'"
        @click="vote('fair')"
      >
        👍 Good <span v-if="fairCount">{{ fairCount }}</span>
      </button>
      <button
        class="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors"
        :class="myVote === 'unfair' ? 'bg-orange-500 text-white' : 'bg-surface-deep text-gray-400 hover:text-gray-200'"
        @click="vote('unfair')"
      >
        👎 Bad <span v-if="unfairCount">{{ unfairCount }}</span>
      </button>
      <button
        class="ml-auto text-xs text-gray-500 hover:text-gray-300 transition-colors"
        @click="showComments = !showComments"
      >
        💬 コメント{{ comments.length ? ` ${comments.length}` : '' }}
      </button>
    </div>

    <!-- 投票者一覧（実名） -->
    <div v-if="votes.length" class="flex flex-wrap items-center gap-1.5 mb-3">
      <NuxtLink
        v-for="v in votes"
        :key="v.id"
        :to="`/u/${v.voterSlug}`"
        :title="`${v.voterName}（${v.value === 'fair' ? 'Good' : 'Bad'}）`"
      >
        <img
          :src="v.voterPhoto"
          class="w-5 h-5 rounded-full object-cover ring-1"
          :class="v.value === 'fair' ? 'ring-brand' : 'ring-orange-500'"
        />
      </NuxtLink>
    </div>

    <!-- コメントツリー -->
    <div v-if="showComments" class="border-t border-surface-border pt-3 mt-3 space-y-3">
      <div v-if="comments.length === 0" class="text-xs text-gray-600">まだコメントがありません</div>

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
          class="flex-1 bg-surface-deep border border-surface-border rounded-lg px-3 py-2 text-xs outline-none focus:border-brand transition-colors text-gray-100 placeholder-gray-600"
          @keydown.enter.prevent="submitComment"
        />
        <button
          class="px-3 py-2 bg-brand rounded-lg text-xs font-semibold hover:opacity-80 transition-opacity"
          @click="submitComment"
        >送信</button>
      </div>
      <div v-if="replyTo" class="text-xs text-gray-500 ml-1">
        返信中… <button class="text-brand-light" @click="replyTo = null">キャンセル</button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Review, Vote, ReviewComment } from '~/types'

const props = defineProps<{
  review: Review
  profileSlug: string
}>()

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
