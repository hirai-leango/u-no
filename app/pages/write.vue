<template>
  <div class="max-w-md mx-auto pt-8">
    <!-- 完了：受け取りリンクを共有 -->
    <div v-if="done" class="text-center">
      <p class="text-2xl mb-2">✍️</p>
      <h1 class="text-xl font-bold text-ink mb-2">エピソードを書きました</h1>
      <p class="text-sm text-ink-soft leading-relaxed mb-6">
        {{ savedName }}さんに下記のリンクを送ってください。<br>
        受け取る（無料登録する）と、あなたのエピソードが{{ savedName }}さんのプロフィールに表示されます。
      </p>
      <div class="relative mb-4">
        <input
          :value="claimUrl"
          readonly
          class="w-full bg-surface border border-surface-border rounded px-3 py-3 pr-20 text-sm outline-none text-ink-soft"
          @focus="($event.target as HTMLInputElement).select()"
        />
        <button class="absolute top-1.5 right-1.5 text-xs font-bold px-3 py-2 rounded bg-brand text-white hover:bg-brand-hover transition-colors" @click="copyLink">
          {{ copied ? 'コピー済み' : 'コピー' }}
        </button>
      </div>
      <button class="w-full py-3 rounded-lg font-bold text-sm bg-brand text-white hover:bg-brand-hover transition-colors mb-3" @click="shareLink">
        {{ savedName }}さんに送る
      </button>
      <button class="text-sm text-ink-mute hover:text-ink transition-colors" @click="reset">続けて別の人に書く</button>
    </div>

    <!-- 入力フォーム -->
    <div v-else>
      <h1 class="text-2xl font-black text-ink mb-2">知人について書く</h1>
      <p class="text-sm text-ink-mute mb-6 leading-relaxed">
        まだユーノーミーに登録していない人にも、先にエピソードを書いて贈れます。相手は受け取るために登録します。
      </p>

      <label class="block text-xs font-bold tracking-widest text-ink-mute mb-2">相手のお名前</label>
      <input
        v-model="name"
        type="text"
        placeholder="山田 太郎"
        class="w-full bg-surface border border-surface-border rounded px-4 py-3 text-sm outline-none focus:border-brand transition-colors text-ink placeholder-ink-mute mb-5"
      />

      <label class="block text-xs font-bold tracking-widest text-ink-mute mb-2">あなたから見た関係</label>
      <div class="flex flex-wrap gap-2 mb-5">
        <button
          v-for="(label, key) in SELECT_REL_LABELS"
          :key="key"
          class="text-sm px-3 py-1.5 rounded border transition-colors"
          :class="relationship === key ? 'bg-brand text-white border-brand' : 'bg-surface border-line text-ink-soft hover:text-ink'"
          @click="relationship = key as Relationship"
        >{{ label }}</button>
      </div>

      <label class="block text-xs font-bold tracking-widest text-ink-mute mb-2">エピソード</label>
      <textarea
        v-model="comment"
        v-autogrow
        rows="5"
        maxlength="1000"
        placeholder="その人の人柄や仕事ぶり、印象に残っていることを書いてください。"
        class="w-full bg-surface border border-surface-border rounded px-4 py-3 text-sm outline-none focus:border-brand transition-colors resize-none min-h-[8rem] text-ink placeholder-ink-mute mb-6"
      />

      <button
        :disabled="!canSubmit || submitting"
        class="w-full py-3 rounded-lg font-bold text-sm bg-brand text-white transition-colors hover:bg-brand-hover disabled:bg-disabled-bg disabled:text-disabled-text"
        @click="submit"
      >
        {{ submitting ? '保存中…' : 'エピソードを書いて贈る' }}
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Relationship } from '~/types'

definePageMeta({ middleware: 'auth' })
useSeoMeta({ robots: 'noindex, nofollow', title: '知人について書く | ユーノーミー' })

const SELECT_REL_LABELS: Record<Relationship, string> = {
  boss: '相手が上司',
  subordinate: '相手が部下',
  colleague: '同僚',
  client: '取引先',
  contractor: '業務委託',
  acquaintance: '知人',
  other: 'その他',
}

const currentUser = useCurrentUser()
const { getProfileByUid } = useUserProfile()
const { createPending } = useClaim()
const { upsertReview } = useReviews()
const { track } = useTrack()
const { showToast } = useToast()

const name = ref('')
const relationship = ref<Relationship | ''>('')
const comment = ref('')
const submitting = ref(false)

const done = ref(false)
const savedName = ref('')
const claimUrl = ref('')
const copied = ref(false)

const canSubmit = computed(() => !!name.value.trim() && !!relationship.value && comment.value.trim().length > 0)

async function submit() {
  if (!currentUser.value || !canSubmit.value || submitting.value) return
  submitting.value = true
  try {
    const my = await getProfileByUid(currentUser.value.uid)
    const nm = name.value.trim()
    const pendingId = await createPending(nm, currentUser.value.uid)
    await upsertReview(pendingId, {
      uid: currentUser.value.uid,
      displayName: currentUser.value.displayName ?? '',
      photoURL: currentUser.value.photoURL ?? '',
      slug: my?.slug ?? '',
      headline: my?.headline ?? '',
    }, comment.value.trim(), relationship.value as Relationship, { displayName: nm })
    savedName.value = nm
    claimUrl.value = `${window.location.origin}/claim/${pendingId}/`
    track('episode_written', { relationship: relationship.value, to_pending: true })
    track('invite_sent', { source: 'write_nonuser' })
    done.value = true
  } catch (e) {
    showToast('保存に失敗しました。時間をおいて再度お試しください', { type: 'error' })
  } finally {
    submitting.value = false
  }
}

async function copyLink() {
  try {
    await navigator.clipboard.writeText(claimUrl.value)
    copied.value = true
    setTimeout(() => (copied.value = false), 2000)
  } catch {
    showToast('コピーに失敗しました', { type: 'error' })
  }
}

async function shareLink() {
  const text = `${savedName.value}さんへエピソードを書きました。受け取ってください。`
  if (navigator.share) {
    try { await navigator.share({ title: 'ユーノーミー', text, url: claimUrl.value }) } catch { /* キャンセル */ }
  } else {
    await copyLink()
    showToast('リンクをコピーしました')
  }
}

function reset() {
  name.value = ''
  relationship.value = ''
  comment.value = ''
  done.value = false
  claimUrl.value = ''
  savedName.value = ''
}
</script>
