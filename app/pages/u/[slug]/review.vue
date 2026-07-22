<template>
  <div class="max-w-md mx-auto pt-8">
    <NuxtLink :to="`/u/${slug}/`" class="inline-flex items-center gap-1 text-ink-mute text-sm hover:text-ink-soft mb-6 transition-colors">
      ← {{ profile?.displayName ?? '' }}のページへ戻る
    </NuxtLink>

    <!-- 温かい導入（依頼者の名前・写真） -->
    <div v-if="profile" class="flex items-center gap-3 bg-brand/5 border border-brand/15 rounded-lg px-4 py-3 mb-6">
      <img
        v-if="profile.photoURL"
        :src="profile.photoURL"
        class="w-12 h-12 rounded-full object-cover flex-none"
      />
      <p class="text-sm text-ink leading-snug">
        <span class="font-bold">{{ profile.displayName }}</span> さんが、あなたとのエピソードを待っています。
      </p>
    </div>

    <h1 class="text-2xl font-extrabold mb-1 font-black text-ink">
      エピソードを書く
    </h1>
    <p class="text-ink-mute text-sm mb-8">
      <template v-if="currentUser && profile">{{ currentUser.displayName }}さんが{{ profile.displayName }}さんと働いていた時の、人柄や仕事ぶりを教えてください。</template>
      <template v-else>人柄や仕事ぶりを教えてください。</template>
    </p>

    <div v-if="existing" class="flex items-center justify-between bg-surface border border-surface-border rounded px-4 py-3 mb-6 text-sm">
      <span class="text-ink-mute">以前のエピソードを編集中</span>
      <button class="text-red-400 hover:text-red-300 text-xs transition-colors" @click="confirmDelete">削除</button>
    </div>

    <div class="mb-6">
      <label class="block text-xs font-bold tracking-widest text-ink-mute mb-2">
        {{ profile?.displayName }}さんとの関係
      </label>
      <div class="grid grid-cols-4 gap-2">
        <button
          v-for="(label, key) in SELECT_REL_LABELS"
          :key="key"
          type="button"
          class="px-2 py-2.5 rounded text-xs font-semibold border transition-colors"
          :class="relationship === key
            ? 'bg-brand text-white border-brand'
            : 'bg-surface text-ink-mute border-surface-border hover:text-ink'"
          @click="relationship = key as Relationship"
        >
          {{ label }}
        </button>
      </div>
    </div>

    <div class="mb-6">
      <label class="block text-xs font-bold tracking-widest text-ink-mute mb-2">エピソード</label>
      <div v-if="relHints.length" class="mb-3">
        <p class="text-[11px] text-ink-mute mb-1.5">こういうことを書きませんか？</p>
        <div class="flex flex-wrap gap-1.5 mb-2">
          <span v-for="h in relHints" :key="h" class="text-[11px] px-2 py-0.5 rounded-full bg-surface-card text-ink-soft">{{ h }}</span>
        </div>
        <p v-if="relExample" class="text-xs text-ink-soft leading-relaxed">{{ relExample }}</p>
      </div>
      <textarea
        v-model="comment"
        :maxlength="1000"
        rows="5"
        placeholder="例: 突然の依頼にも即レスで対応してくれた。回答がめちゃくちゃ的確だった。"
        v-autogrow
        class="w-full bg-surface border border-surface-border rounded px-4 py-3 text-sm outline-none focus:border-brand transition-colors resize-none min-h-[6rem] text-ink placeholder-ink-mute"
      />
      <div class="text-right text-xs mt-1" :class="comment.length > 950 ? 'text-warn' : 'text-ink-mute'">
        {{ comment.length }} / 1000
      </div>
    </div>

    <button
      :disabled="!comment.trim() || !relationship || submitting"
      class="w-full py-3 rounded font-bold text-sm bg-brand text-white transition-colors hover:bg-brand-hover disabled:bg-disabled-bg disabled:text-disabled-text"
      @click="goToConfirm"
    >
      {{ buttonLabel }}
    </button>

    <!-- 確認モーダル（プレビュー・長文はスクロール） -->
    <div
      v-if="showConfirmModal"
      class="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4 py-6"
      @click.self="showConfirmModal = false"
    >
      <div class="w-full max-w-sm bg-surface border border-surface-border rounded-lg p-6 flex flex-col max-h-[calc(100dvh-3rem)]">
        <div class="flex-none mb-4">
          <!-- あなた → ◯◯さん -->
          <div class="flex items-center justify-center gap-4 mb-2">
            <img v-if="currentUser?.photoURL" :src="currentUser.photoURL" class="w-14 h-14 rounded-full object-cover" alt="" />
            <div v-else class="w-14 h-14 rounded-full bg-surface-border" />
            <span class="text-brand text-xl">→</span>
            <img v-if="profile?.photoURL" :src="profile.photoURL" class="w-14 h-14 rounded-full object-cover ring-2 ring-brand" alt="" />
            <div v-else class="w-14 h-14 rounded-full bg-surface-border" />
          </div>
          <div class="flex items-center justify-center gap-4 text-[10px] mb-3">
            <span class="w-14 text-center text-ink-mute">あなた</span>
            <span class="w-5"></span>
            <span class="w-14 text-center text-ink-soft font-bold truncate">{{ profile?.displayName }}</span>
          </div>
          <h2 class="text-base font-black text-ink text-center">{{ profile?.displayName }}さんへ、エピソードを贈ります</h2>
          <p class="text-[11px] text-ink-mute text-center mt-1">あなたの実名で、{{ profile?.displayName }}さんのページに公開されます</p>
        </div>

        <!-- スクロール領域 -->
        <div class="bg-surface-deep border border-surface-border rounded p-4 mb-4 overflow-y-auto flex-1 min-h-0">
          <p class="text-[11px] text-ink-mute mb-1">関係性</p>
          <p class="text-sm text-ink mb-3">{{ relationshipLabel }}</p>
          <p class="text-[11px] text-ink-mute mb-1">エピソード</p>
          <p class="text-sm text-ink leading-relaxed whitespace-pre-wrap">{{ comment }}</p>
        </div>

        <p v-if="comment.trim().length <= 100" class="text-xs text-warn mb-4 flex-none">
          ⚠️ 少し短いようです。具体的な出来事があるほど信頼が伝わります。
        </p>

        <div class="flex gap-2 flex-none">
          <button
            class="flex-1 py-3 rounded border border-surface-border text-sm font-semibold text-ink-mute hover:text-ink transition-colors"
            @click="showConfirmModal = false"
          >
            修正する
          </button>
          <button
            :disabled="submitting"
            class="flex-1 py-3 rounded bg-brand text-white text-sm font-bold hover:bg-brand-hover disabled:bg-disabled-bg disabled:text-disabled-text transition-colors"
            @click="publish"
          >
            {{ existing ? '更新する' : '公開する' }}
          </button>
        </div>
      </div>
    </div>

    <PhoneVerifyModal
      v-if="showPhoneModal"
      @close="showPhoneModal = false"
      @verified="onPhoneVerified"
    />

    <!-- 完了：お返し依頼ナッジ -->
    <div v-if="showDoneModal" class="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4">
      <!-- 湯呑みの紙吹雪（相互のときだけ） -->
      <div v-if="reciprocated" class="pointer-events-none absolute inset-0 overflow-hidden">
        <img
          v-for="c in confetti"
          :key="c.id"
          src="/og-yunomi.png"
          alt=""
          class="confetti-piece"
          :style="{ left: c.left + '%', width: c.size + 'px', opacity: c.opacity, animationDelay: c.delay + 's', animationDuration: c.dur + 's' }"
        />
      </div>
      <div class="done-pop relative w-full max-w-sm bg-surface border border-surface-border rounded-2xl p-7 text-center">
        <!-- 相互：二人の顔＋ハートで祝福 -->
        <template v-if="reciprocated">
          <div class="flex items-center justify-center gap-1 mb-4">
            <img :src="currentUser?.photoURL || '/favicon-192.png'" class="done-av done-av-l w-16 h-16 rounded-full object-cover ring-2 ring-white shadow-md" alt="" />
            <img src="/og-yunomi.png" alt="" class="done-heart w-6 mx-1" />
            <img :src="profile?.photoURL || '/favicon-192.png'" class="done-av done-av-r w-16 h-16 rounded-full object-cover ring-2 ring-white shadow-md" alt="" />
          </div>
          <h2 class="text-lg font-black text-ink mb-2">エピソードを贈りあいました</h2>
          <p class="text-sm text-ink-soft leading-relaxed mb-6">
            {{ profile?.displayName }}さんと、<br>お互いのエピソードを投稿しました。<br>
            あなたのエピソードが信頼を紡ぎます。<br>
            <span class="text-brand font-black">You know me !</span>
          </p>
          <button
            class="w-full py-3 rounded-lg font-bold text-sm bg-brand text-white hover:bg-brand-hover transition-colors"
            @click="navigateTo(`/u/${slug}/`)"
          >{{ profile?.displayName }}さんのページへ</button>
        </template>
        <template v-else>
          <img src="/og-yunomi.png" alt="" class="w-10 mx-auto mb-3" />
          <h2 class="text-base font-black text-ink mb-1">{{ profile?.displayName }}さんへ贈りました</h2>
          <p class="text-sm text-ink-soft leading-relaxed mb-5">
            お返しに、{{ profile?.displayName }}さんにも<br>あなたのことを書いてもらいませんか？
          </p>
          <button
            class="w-full py-3 rounded font-bold text-sm bg-brand text-white hover:bg-brand-hover transition-colors mb-2"
            @click="shareMe"
          >{{ doneCopied ? 'URLをコピーしました！' : '自分のプロフィールを送る' }}</button>
          <button
            class="w-full py-2 text-sm text-ink-mute hover:text-ink-soft transition-colors"
            @click="navigateTo(`/u/${slug}/`)"
          >{{ profile?.displayName }}さんのページへ</button>
        </template>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ middleware: 'auth' })

import type { UserProfile, Review, Relationship } from '~/types'
import { RELATIONSHIP_LABELS } from '~/types'

const route = useRoute()
const slug = computed(() => route.params.slug as string)
const currentUser = useCurrentUser()

const profile = ref<UserProfile | null>(null)

useSeoMeta({
  title: () => profile.value ? `${profile.value.displayName}さんへのエピソードを書く | ユーノーミー` : 'エピソードを書く | ユーノーミー',
  robots: 'noindex, nofollow',
})
const existing = ref<Review | null>(null)
const comment = ref('')
const relationship = ref<Relationship | null>(null)
const submitting = ref(false)

const { getProfileBySlug, getProfileByUid } = useUserProfile()
const { getMyReview, upsertReview, deleteReview } = useReviews()
const isPhoneVerified = useIsPhoneVerified()
const showPhoneModal = ref(false)
const showConfirmModal = ref(false)
const showDoneModal = ref(false)
const reciprocated = ref(false)
// 湯呑みの紙吹雪（相互達成の演出）。クライアントで一度だけ生成
const confetti = Array.from({ length: 30 }, (_, i) => ({
  id: i,
  left: Math.round(Math.random() * 100),
  size: Math.round(14 + Math.random() * 22),
  delay: +(Math.random() * 1.4).toFixed(2),
  dur: +(2.4 + Math.random() * 2.4).toFixed(2),
  opacity: +(0.35 + Math.random() * 0.5).toFixed(2),
}))
const mySlug = ref('')
const doneCopied = ref(false)
// 投稿画面用：上司/部下の向きを明示（自分の立場を選ぶ）
const SELECT_REL_LABELS: Record<Relationship, string> = {
  boss: '相手が上司',
  subordinate: '相手が部下',
  colleague: '同僚',
  client: '取引先',
  contractor: '業務委託',
  acquaintance: '知人',
  other: 'その他',
}
// 関係性ごとの「書くヒント」（＝どんな観点で書けるか）
const REL_HINTS: Record<Relationship, string[]> = {
  boss: ['受けた指導・サポート', 'チームへの影響', '学んだこと', '人柄'],
  subordinate: ['任せた仕事ぶり', '期待を超えた場面', '成長した点', '印象的な成果'],
  colleague: ['一緒に取り組んだこと', '協働での強み', '助けられた場面', '人柄'],
  client: ['一緒に進めた案件', '仕事の進め方・誠実さ', '印象的な対応', 'また依頼したい理由'],
  contractor: ['依頼した業務', '成果物の質・スピード', 'コミュニケーション', '安心して任せられた点'],
  acquaintance: ['知り合った場', '人柄・第一印象', '信頼できると感じた場面'],
  other: ['その人との関わり', '印象に残っていること', '強み・人柄'],
}
const relHints = computed(() => relationship.value ? REL_HINTS[relationship.value] : [])
// 関係性ごとの参考例文（◯◯は相手名に差し替え）
const REL_EXAMPLES: Record<Relationship, string> = {
  boss: 'プロジェクトが炎上しかけた時、◯◯さんは冷静に優先順位を整理してチームを立て直してくれました。詰めるのではなく「次どうするか」に集中させてくれるので、部下として本当に動きやすかったです。判断が速く、責任は自分で取る。理想の上司でした。',
  subordinate: '任せた業務はいつも期待以上で返してくれました。特にABテストの設計では、こちらが気づかない改善案を自ら出してくれて驚いたことが何度もあります。指示待ちではなく自分で考えて動ける人で、安心して仕事を任せられる、伸びしろの大きいメンバーです。',
  colleague: '同じチームで新機能の開発を進めた時、◯◯さんは常に全体最適で動いてくれました。自分の担当外でも困っている人がいれば率先して助け、締切前の修羅場でも決して雑にならず細部まで丁寧。一緒に働いていて心から信頼できる同僚です。',
  client: '半年間、施策をご一緒しました。要望の背景まで汲み取った提案をくださり、こちらの想定を超える成果につながりました。レスポンスが早く認識のズレもない。誠実で仕事が速い方で、またぜひご一緒したいと思える取引先です。',
  contractor: 'デザイン制作をお願いしました。要件が曖昧な段階でも意図を的確に汲み取り、期待以上のアウトプットをスピーディに仕上げてくれました。修正の相談にも柔軟で進行のストレスが一切なく、安心して任せられる方です。',
  acquaintance: '勉強会で知り合い、以来何度か情報交換をしています。いつも相手目線で親身に相談に乗ってくれる方で、知識も豊富。話すたびに新しい学びがあり、周囲からの信頼も厚い人だと感じています。',
  other: '◯◯さんとは仕事を通じて関わりました。どんな時も誠実で、周囲への気配りを欠かさない方です。約束は必ず守り、細部まで手を抜かない姿勢に何度も助けられました。信頼できる人だと自信を持って言えます。',
}
const relExample = computed(() => {
  if (!relationship.value) return ''
  const name = profile.value?.displayName ?? '◯◯'
  return REL_EXAMPLES[relationship.value].replaceAll('◯◯', name)
})
const relationshipLabel = computed(() => relationship.value ? SELECT_REL_LABELS[relationship.value] : '')

// 入力状態に応じたボタンのラベル
const buttonLabel = computed(() => {
  const hasRel = !!relationship.value
  const hasText = !!comment.value.trim()
  if (!hasRel && !hasText) return '関係性を選択してください'
  if (!hasRel && hasText) return '関係性が未選択です'
  if (hasRel && !hasText) return 'エピソードを入力してください'
  return '確認画面へ進む'
})

async function load() {
  const p = await getProfileBySlug(slug.value)
  if (!p || !currentUser.value) return
  // 自分自身にはエピソードできない
  if (p.uid === currentUser.value.uid) return navigateTo(`/u/${slug.value}/`)
  profile.value = p
  existing.value = await getMyReview(p.uid, currentUser.value.uid)
  if (existing.value) {
    comment.value = existing.value.comment
    relationship.value = existing.value.relationship ?? null
  }
}

onMounted(() => {
  if (currentUser.value) load()
  watch(currentUser, (u) => {
    if (u) load()
  })
})

// 確認画面（モーダル）を開く
function goToConfirm() {
  if (!profile.value || !currentUser.value || !comment.value.trim() || !relationship.value) return
  showConfirmModal.value = true
}

// 確認画面で「公開する」を押したとき
async function publish() {
  showConfirmModal.value = false
  // 【一時バイパス】reCAPTCHA/電話認証の設定が整うまで、本人確認をスキップして投稿を開通させる。
  // 復活させるときは下のブロックのコメントを外す。
  // if (!isPhoneVerified.value) {
  //   showPhoneModal.value = true
  //   return
  // }
  await doSubmit()
}

async function doSubmit() {
  if (!profile.value || !currentUser.value || !relationship.value) return
  submitting.value = true
  const myProfile = await getProfileByUid(currentUser.value.uid)
  await upsertReview(profile.value.uid, {
    uid: currentUser.value.uid,
    displayName: currentUser.value.displayName ?? '',
    photoURL: currentUser.value.photoURL ?? '',
    slug: myProfile?.slug ?? '',
    headline: myProfile?.headline ?? '',
  }, comment.value.trim(), relationship.value, {
    displayName: profile.value.displayName,
    photoURL: profile.value.photoURL,
    slug: slug.value,
  })
  mySlug.value = myProfile?.slug ?? ''
  // 相手が既に自分にエピソードを書いているか（＝相互）
  reciprocated.value = !!(await getMyReview(currentUser.value.uid, profile.value.uid))
  submitting.value = false
  showDoneModal.value = true
}

// 完了後：お返し依頼のため自分のプロフィールを共有
async function shareMe() {
  if (!mySlug.value) return
  const url = `${window.location.origin}/u/${mySlug.value}/`
  const myName = currentUser.value?.displayName ?? ''
  if (navigator.share) {
    try {
      await navigator.share({ title: `${myName}さんへのエピソードをお願いします`, text: `${myName}さんへエピソードを書いてください`, url })
    } catch { /* キャンセル */ }
  } else {
    await navigator.clipboard.writeText(url)
    doneCopied.value = true
    setTimeout(() => (doneCopied.value = false), 2000)
  }
}

async function onPhoneVerified() {
  showPhoneModal.value = false
  await doSubmit()
}

async function confirmDelete() {
  if (!profile.value || !currentUser.value) return
  if (!confirm('エピソードを削除しますか？')) return
  await deleteReview(profile.value.uid, currentUser.value.uid)
  navigateTo(`/u/${slug.value}/`)
}
</script>

<style scoped>
.done-pop { animation: donePop .38s cubic-bezier(.2, .8, .2, 1); }
@keyframes donePop { from { opacity: 0; transform: scale(.92) translateY(10px); } to { opacity: 1; transform: none; } }
.done-av { animation: avIn .5s .08s backwards cubic-bezier(.2, .9, .3, 1.4); }
.done-av-r { animation-delay: .18s; }
.done-heart { display: inline-block; animation: heart .9s .34s both ease; }
@keyframes avIn { from { opacity: 0; transform: scale(.4); } to { opacity: 1; transform: none; } }
@keyframes heart { 0% { transform: scale(0); } 55% { transform: scale(1.35); } 75% { transform: scale(.9); } 100% { transform: scale(1); } }
.confetti-piece {
  position: absolute;
  bottom: -8%;
  animation-name: floatUp;
  animation-timing-function: ease-out;
  animation-iteration-count: 1;
  animation-fill-mode: forwards;
  will-change: transform, opacity;
}
@keyframes floatUp {
  0% { transform: translateY(0) rotate(0deg); opacity: 0; }
  15% { opacity: .7; }
  85% { opacity: .7; }
  100% { transform: translateY(-118vh) rotate(300deg); opacity: 0; }
}
@media (prefers-reduced-motion: reduce) { .done-pop, .done-av, .done-heart, .confetti-piece { animation: none; } .confetti-piece { display: none; } }
</style>
