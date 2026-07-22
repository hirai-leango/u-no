<template>
  <div class="max-w-2xl mx-auto">
    <div ref="headerRef" class="flex items-center justify-between mb-8">
      <h1 class="text-2xl font-black text-ink">
        プロフィールを編集
      </h1>
      <button
        :disabled="saving"
        class="px-5 py-2.5 bg-brand text-white rounded text-sm font-bold disabled:bg-disabled-bg disabled:text-disabled-text hover:bg-brand-hover transition-colors"
        @click="save"
      >
        {{ saving ? '保存中...' : '保存する' }}
      </button>
    </div>

    <!-- スクロールで上部ボタンが隠れたら出るフローティング保存ボタン -->
    <Transition name="floatsave">
      <div v-if="showFloatingSave" class="fixed top-0 inset-x-0 z-40 bg-surface-deep/95 backdrop-blur border-b border-surface-border">
        <div class="max-w-2xl mx-auto px-4 py-3">
          <button
            :disabled="saving"
            class="w-full px-5 py-3 bg-brand text-white rounded text-sm font-bold shadow-sm disabled:bg-disabled-bg disabled:text-disabled-text hover:bg-brand-hover transition-colors"
            @click="save"
          >
            {{ saving ? '保存中...' : 'プロフィールを保存する' }}
          </button>
        </div>
      </div>
    </Transition>


    <!-- プロフィール画像 -->
    <section class="mb-6">
      <label class="block text-xs font-bold tracking-widest text-ink-mute mb-2">プロフィール画像</label>
      <div class="flex items-center gap-4">
        <img :src="photoURL || '/favicon-192.png'" class="w-20 h-20 rounded-full object-cover bg-surface-card flex-none" alt="" />
        <div>
          <button
            type="button"
            :disabled="uploadingAvatar"
            class="px-4 py-2 rounded border border-surface-border text-sm font-semibold text-ink-soft hover:text-ink disabled:opacity-50 transition-colors"
            @click="avatarInput?.click()"
          >
            {{ uploadingAvatar ? 'アップロード中…' : '画像を変更' }}
          </button>
          <input ref="avatarInput" type="file" accept="image/*" class="hidden" @change="onAvatarChange" />
          <p class="text-[11px] text-ink-mute mt-1.5">正方形で表示されます（自動でトリミング）。変更後は保存してください。</p>
        </div>
      </div>
    </section>

    <!-- 肩書き -->
    <section class="mb-6">
      <label class="block text-xs font-bold tracking-widest text-ink-mute mb-2">肩書き（会社・役職）</label>
      <input
        v-model="headline"
        type="text"
        maxlength="60"
        placeholder="例: 株式会社◯◯ / マーケティング部長"
        class="w-full bg-surface border border-surface-border rounded px-4 py-3 text-sm outline-none focus:border-brand transition-colors text-ink placeholder-ink-mute"
      />
    </section>

    <!-- 自己紹介 -->
    <section class="mb-6">
      <label class="block text-xs font-bold tracking-widest text-ink-mute mb-2">自己紹介</label>
      <textarea
        v-model="bio"
        v-autogrow
        rows="2"
        maxlength="200"
        placeholder="ひとことで自己紹介"
        class="w-full bg-surface border border-surface-border rounded px-4 py-3 text-sm outline-none focus:border-brand transition-colors resize-none min-h-[4.5rem] text-ink placeholder-ink-mute"
      />
    </section>

    <!-- リンク集 -->
    <section class="mb-6">
      <div class="flex items-center justify-between mb-3">
        <label class="text-xs font-bold tracking-widest text-ink-mute">リンク</label>
        <button class="text-xs text-brand hover:underline" @click="addLink">+ 追加</button>
      </div>
      <div class="space-y-2">
        <div v-for="(l, i) in links" :key="i" class="flex gap-2">
          <input v-model="l.label" type="text" placeholder="ラベル（例: LinkedIn）" class="w-1/3 bg-surface border border-surface-border rounded px-3 py-2 text-sm outline-none focus:border-brand transition-colors text-ink placeholder-ink-mute" />
          <input v-model="l.url" type="url" placeholder="https://…" class="flex-1 bg-surface border border-surface-border rounded px-3 py-2 text-sm outline-none focus:border-brand transition-colors text-ink placeholder-ink-mute" />
          <button class="text-xs text-ink-mute hover:text-warn transition-colors px-2" @click="links.splice(i, 1)">×</button>
        </div>
      </div>
    </section>

    <!-- SNS -->
    <section class="mb-6">
      <label class="block text-xs font-bold tracking-widest text-ink-mute mb-2">SNS（任意）</label>
      <div class="space-y-2">
        <div v-for="s in SNS_FIELDS" :key="s.key" class="flex items-center gap-2">
          <span class="w-24 text-xs text-ink-soft flex-none">{{ s.label }}</span>
          <input
            v-model="sns[s.key]"
            type="url"
            :placeholder="s.ph"
            class="flex-1 min-w-0 bg-surface border border-surface-border rounded px-3 py-2 text-sm outline-none focus:border-brand transition-colors text-ink placeholder-ink-mute"
          />
        </div>
      </div>
    </section>

    <!-- 検索設定 -->
    <div class="bg-surface border border-surface-border rounded-none p-6 mb-8 flex flex-wrap items-center justify-between">
      <div>
        <h2 class="text-sm font-bold text-ink-soft mb-1">検索エンジンに表示する</h2>
        <p class="text-xs text-ink-mute">オフにすると Google などの検索結果に出なくなります（URLを知っている人は閲覧可）</p>
      </div>
      <button
        type="button"
        class="relative w-12 h-7 rounded-full transition-colors flex-shrink-0 ml-4"
        :class="isSearchable ? 'bg-brand' : (canIndex ? 'bg-surface-border' : 'bg-disabled-bg cursor-not-allowed')"
        @click="toggleSearchable"
      >
        <span
          class="absolute top-1 left-1 w-5 h-5 bg-white rounded-full transition-transform"
          :class="isSearchable ? 'translate-x-5' : 'translate-x-0'"
        />
      </button>
      <p v-if="!canIndex && !isSearchable" class="w-full text-xs text-warn mt-3 order-last">
        エピソード数が3件未満だとindexをONにすることができません（現在{{ episodeTotal }}件）
      </p>
    </div>

    <!-- 職歴 -->
    <section class="mb-6">
      <div class="flex items-center justify-between mb-3">
        <label class="text-xs font-bold tracking-widest text-ink-mute">職歴</label>
        <button class="text-xs text-brand-light hover:underline" @click="addExperience">+ 追加</button>
      </div>
      <div class="space-y-4">
        <div
          v-for="(exp, i) in form.experience"
          :key="i"
          class="bg-surface border border-surface-border rounded p-4 space-y-3"
        >
          <div class="flex justify-end">
            <button class="text-xs text-ink-mute hover:text-red-400 transition-colors" @click="form.experience.splice(i, 1)">削除</button>
          </div>
          <div class="grid grid-cols-2 gap-3">
            <div>
              <label class="text-xs text-ink-mute mb-1 block">会社名</label>
              <input v-model="exp.company" type="text" class="input-field" placeholder="株式会社○○" />
            </div>
            <div>
              <label class="text-xs text-ink-mute mb-1 block">役職</label>
              <input v-model="exp.title" type="text" class="input-field" placeholder="エンジニア" />
            </div>
            <div>
              <label class="text-xs text-ink-mute mb-1 block">開始</label>
              <input v-model="exp.startDate" type="month" class="input-field" />
            </div>
            <div>
              <label class="text-xs text-ink-mute mb-1 block">終了</label>
              <input v-model="exp.endDate" type="month" class="input-field" placeholder="現在" />
            </div>
          </div>
          <div>
            <label class="text-xs text-ink-mute mb-1 block">業務内容</label>
            <textarea v-model="exp.description" v-autogrow rows="2" class="input-field resize-none min-h-[4.5rem]" placeholder="担当業務の概要" />
          </div>
          <div>
            <label class="text-xs text-ink-mute mb-1 block">URL（任意）</label>
            <input v-model="exp.url" type="url" class="input-field" placeholder="https://…（実績・会社サイトなど）" />
          </div>
        </div>
      </div>
    </section>

    <!-- 学歴 -->
    <section class="mb-10">
      <div class="flex items-center justify-between mb-3">
        <label class="text-xs font-bold tracking-widest text-ink-mute">学歴</label>
        <button class="text-xs text-brand-light hover:underline" @click="addEducation">+ 追加</button>
      </div>
      <div class="space-y-4">
        <div
          v-for="(edu, i) in form.education"
          :key="i"
          class="bg-surface border border-surface-border rounded p-4 space-y-3"
        >
          <div class="flex justify-end">
            <button class="text-xs text-ink-mute hover:text-red-400 transition-colors" @click="form.education.splice(i, 1)">削除</button>
          </div>
          <div class="grid grid-cols-2 gap-3">
            <div class="col-span-2">
              <label class="text-xs text-ink-mute mb-1 block">学校名</label>
              <input v-model="edu.institution" type="text" class="input-field" placeholder="○○大学" />
            </div>
            <div>
              <label class="text-xs text-ink-mute mb-1 block">学位</label>
              <input v-model="edu.degree" type="text" class="input-field" placeholder="学士" />
            </div>
            <div>
              <label class="text-xs text-ink-mute mb-1 block">専攻</label>
              <input v-model="edu.field" type="text" class="input-field" placeholder="情報工学" />
            </div>
            <div>
              <label class="text-xs text-ink-mute mb-1 block">入学</label>
              <input v-model="edu.startDate" type="month" class="input-field" />
            </div>
            <div>
              <label class="text-xs text-ink-mute mb-1 block">卒業</label>
              <input v-model="edu.endDate" type="month" class="input-field" />
            </div>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ middleware: 'auth' })
useSeoMeta({ robots: 'noindex, nofollow' })

import type { Resume, ProfileLink, SnsLinks } from '~/types'
import { getStorage, ref as storageRef, uploadBytes, getDownloadURL } from 'firebase/storage'

const user = useCurrentUser()
const { getProfileByUid, saveProfile } = useUserProfile()
const saving = ref(false)
// プロフィール画像（クライアントで正方形リサイズ→Firebase Storage）
async function uploadAvatar(uid: string, file: File): Promise<string> {
  const bitmap = await createImageBitmap(file)
  const side = Math.min(bitmap.width, bitmap.height)
  const canvas = document.createElement('canvas')
  canvas.width = 512
  canvas.height = 512
  canvas.getContext('2d')!.drawImage(bitmap, (bitmap.width - side) / 2, (bitmap.height - side) / 2, side, side, 0, 0, 512, 512)
  const blob = await new Promise<Blob>((res, rej) => canvas.toBlob(b => (b ? res(b) : rej(new Error('failed'))), 'image/jpeg', 0.85))
  const r = storageRef(getStorage(), 'avatars/' + uid)
  await uploadBytes(r, blob, { contentType: 'image/jpeg', cacheControl: 'public, max-age=3600' })
  return await getDownloadURL(r)
}
const photoURL = ref('')
const uploadingAvatar = ref(false)
const avatarInput = ref<HTMLInputElement | null>(null)
async function onAvatarChange(e: Event) {
  const file = (e.target as HTMLInputElement).files?.[0]
  if (!file || !user.value) return
  uploadingAvatar.value = true
  try {
    photoURL.value = await uploadAvatar(user.value.uid, file)
    showToast('画像をアップロードしました。保存してください')
  } catch {
    showToast('画像のアップロードに失敗しました', { type: 'error' })
  } finally {
    uploadingAvatar.value = false
  }
}

const form = reactive<Resume>({
  skills: [],
  experience: [],
  education: [],
})

const headline = ref('')
const bio = ref('')
const links = ref<ProfileLink[]>([])
const isSearchable = ref(true)
// エピソード3件以上でないと検索表示ONにできない（OFFはいつでも可）
const { getReviews, getGivenCount } = useReviews()
const episodeTotal = ref(0)
const canIndex = computed(() => episodeTotal.value >= 3)
function toggleSearchable() {
  if (!isSearchable.value && !canIndex.value) return // 3件未満はONにできない
  isSearchable.value = !isSearchable.value
}
const sns = reactive<SnsLinks>({})
const SNS_FIELDS: { key: keyof SnsLinks; label: string; ph: string }[] = [
  { key: 'x', label: 'X (Twitter)', ph: 'https://x.com/...' },
  { key: 'instagram', label: 'Instagram', ph: 'https://instagram.com/...' },
  { key: 'linkedin', label: 'LinkedIn', ph: 'https://linkedin.com/in/...' },
  { key: 'facebook', label: 'Facebook', ph: 'https://facebook.com/...' },
  { key: 'youtube', label: 'YouTube', ph: 'https://youtube.com/@...' },
  { key: 'note', label: 'note', ph: 'https://note.com/...' },
  { key: 'github', label: 'GitHub', ph: 'https://github.com/...' },
]

onMounted(async () => {
  if (!user.value) return
  const profile = await getProfileByUid(user.value.uid)
  if (profile?.resume) Object.assign(form, profile.resume)
  photoURL.value = profile?.photoURL ?? user.value?.photoURL ?? ''
  headline.value = profile?.headline ?? ''
  bio.value = profile?.bio ?? ''
  links.value = profile?.links ?? []
  isSearchable.value = profile?.isSearchable ?? true
  Object.assign(sns, profile?.sns ?? {})
  const [recv, given] = await Promise.all([
    getReviews(user.value.uid),
    getGivenCount(user.value.uid),
  ])
  episodeTotal.value = (recv?.length ?? 0) + (given ?? 0)
})

function addLink() {
  links.value.push({ label: '', url: '' })
}

function addExperience() {
  form.experience.push({ company: '', title: '', startDate: '', endDate: '', description: '', url: '' })
}

function addEducation() {
  form.education.push({ institution: '', degree: '', field: '', startDate: '', endDate: '' })
}

const { showToast } = useToast()

// 上部の保存ボタンが画面外に出たらフローティング保存を表示
const headerRef = ref<HTMLElement | null>(null)
const showFloatingSave = ref(false)
onMounted(() => {
  if (!headerRef.value) return
  const io = new IntersectionObserver(
    ([e]) => { showFloatingSave.value = !e.isIntersecting },
    { threshold: 0 },
  )
  io.observe(headerRef.value)
  onBeforeUnmount(() => io.disconnect())
})

async function save() {
  if (!user.value) return
  saving.value = true
  try {
    await saveProfile(user.value.uid, {
      photoURL: photoURL.value,
      headline: headline.value,
      bio: bio.value,
      links: links.value.filter(l => l.label && isHttpUrl(l.url)),
      resume: { ...form },
      isSearchable: isSearchable.value,
      sns: Object.fromEntries(
        SNS_FIELDS.map(s => [s.key, (sns[s.key] ?? '').trim()])
          .filter(([, v]) => isHttpUrl(v as string)),
      ),
    })
    showToast('プロフィールを保存しました')
  } catch (e) {
    showToast('保存に失敗しました。時間をおいて再度お試しください', { type: 'error' })
  } finally {
    saving.value = false
  }
}
</script>

<style>
.input-field {
  @apply w-full bg-surface-deep border border-surface-border rounded-lg px-3 py-2 text-sm outline-none focus:border-brand transition-colors text-ink placeholder-ink-mute;
}
</style>
