<template>
  <div class="max-w-2xl mx-auto">
    <div class="flex items-center justify-between mb-8">
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

    <!-- PDFインポート -->
    <div class="bg-surface border border-surface-border rounded-none p-6 mb-8">
      <h2 class="text-sm font-bold text-ink-soft mb-1">PDFからインポート</h2>
      <p class="text-xs text-ink-mute mb-4">履歴書PDFをアップロードすると、AIが自動で項目を入力します</p>
      <div
        class="border-2 border-dashed border-surface-border rounded p-8 text-center cursor-pointer hover:border-brand transition-colors"
        :class="{ 'border-brand': isDragging }"
        @dragover.prevent="isDragging = true"
        @dragleave="isDragging = false"
        @drop.prevent="handleDrop"
        @click="fileInput?.click()"
      >
        <input ref="fileInput" type="file" accept=".pdf" class="hidden" @change="handleFile" />
        <p v-if="parsing" class="text-sm text-brand-light animate-pulse">AIが解析中...</p>
        <div v-else>
          <p class="text-2xl mb-2">📄</p>
          <p class="text-sm text-ink-mute">PDFをドラッグ＆ドロップ、またはクリック</p>
          <p class="text-xs text-ink-mute mt-1">住所・電話番号は自動的に除外されます</p>
        </div>
      </div>
    </div>

    <!-- 肩書き -->
    <section class="mb-6">
      <label class="block text-xs font-bold tracking-widest uppercase text-ink-mute mb-2">肩書き（会社・役職）</label>
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
      <label class="block text-xs font-bold tracking-widest uppercase text-ink-mute mb-2">自己紹介</label>
      <textarea
        v-model="bio"
        rows="2"
        maxlength="200"
        placeholder="ひとことで自己紹介"
        class="w-full bg-surface border border-surface-border rounded px-4 py-3 text-sm outline-none focus:border-brand transition-colors resize-none text-ink placeholder-ink-mute"
      />
    </section>

    <!-- リンク集 -->
    <section class="mb-6">
      <div class="flex items-center justify-between mb-3">
        <label class="text-xs font-bold tracking-widest uppercase text-ink-mute">リンク</label>
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

    <!-- 検索設定 -->
    <div class="bg-surface border border-surface-border rounded-none p-6 mb-8 flex items-center justify-between">
      <div>
        <h2 class="text-sm font-bold text-ink-soft mb-1">検索エンジンに表示する</h2>
        <p class="text-xs text-ink-mute">オフにすると Google などの検索結果に出なくなります（URLを知っている人は閲覧可）</p>
      </div>
      <button
        type="button"
        class="relative w-12 h-7 rounded-full transition-colors flex-shrink-0 ml-4"
        :class="isSearchable ? 'bg-brand' : 'bg-surface-border'"
        @click="isSearchable = !isSearchable"
      >
        <span
          class="absolute top-1 left-1 w-5 h-5 bg-white rounded-full transition-transform"
          :class="isSearchable ? 'translate-x-5' : 'translate-x-0'"
        />
      </button>
    </div>

    <!-- 自己PR -->
    <section class="mb-6">
      <label class="block text-xs font-bold tracking-widest uppercase text-ink-mute mb-2">自己PR</label>
      <textarea
        v-model="form.summary"
        rows="4"
        placeholder="自己PRを入力してください"
        class="w-full bg-surface border border-surface-border rounded px-4 py-3 text-sm outline-none focus:border-brand transition-colors resize-none text-ink placeholder-ink-mute"
      />
    </section>

    <!-- 職歴 -->
    <section class="mb-6">
      <div class="flex items-center justify-between mb-3">
        <label class="text-xs font-bold tracking-widest uppercase text-ink-mute">職歴</label>
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
            <textarea v-model="exp.description" rows="2" class="input-field resize-none" placeholder="担当業務の概要" />
          </div>
        </div>
      </div>
    </section>

    <!-- 学歴 -->
    <section class="mb-10">
      <div class="flex items-center justify-between mb-3">
        <label class="text-xs font-bold tracking-widest uppercase text-ink-mute">学歴</label>
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

import type { Resume, ProfileLink } from '~/types'

const user = useCurrentUser()
const { getProfileByUid, saveProfile } = useUserProfile()
const fileInput = ref<HTMLInputElement>()
const isDragging = ref(false)
const parsing = ref(false)
const saving = ref(false)

const form = reactive<Resume>({
  summary: '',
  skills: [],
  experience: [],
  education: [],
})

const headline = ref('')
const bio = ref('')
const links = ref<ProfileLink[]>([])
const isSearchable = ref(true)

onMounted(async () => {
  if (!user.value) return
  const profile = await getProfileByUid(user.value.uid)
  if (profile?.resume) Object.assign(form, profile.resume)
  headline.value = profile?.headline ?? ''
  bio.value = profile?.bio ?? ''
  links.value = profile?.links ?? []
  isSearchable.value = profile?.isSearchable ?? true
})

function addLink() {
  links.value.push({ label: '', url: '' })
}

function addExperience() {
  form.experience.push({ company: '', title: '', startDate: '', endDate: '', description: '' })
}

function addEducation() {
  form.education.push({ institution: '', degree: '', field: '', startDate: '', endDate: '' })
}

function handleDrop(e: DragEvent) {
  isDragging.value = false
  const file = e.dataTransfer?.files[0]
  if (file?.type === 'application/pdf') parseResume(file)
}

function handleFile(e: Event) {
  const file = (e.target as HTMLInputElement).files?.[0]
  if (file) parseResume(file)
}

async function parseResume(file: File) {
  parsing.value = true
  try {
    const formData = new FormData()
    formData.append('file', file)
    const res = await $fetch<Partial<Resume>>('/api/parse-resume', { method: 'POST', body: formData })
    if (res.summary) form.summary = res.summary
    if (res.experience?.length) form.experience = res.experience
    if (res.education?.length) form.education = res.education
  } catch (e) {
    console.error('PDF解析に失敗しました', e)
  } finally {
    parsing.value = false
  }
}

async function save() {
  if (!user.value) return
  saving.value = true
  await saveProfile(user.value.uid, {
    headline: headline.value,
    bio: bio.value,
    links: links.value.filter(l => l.label && l.url),
    resume: { ...form },
    isSearchable: isSearchable.value,
  })
  saving.value = false
}
</script>

<style>
.input-field {
  @apply w-full bg-surface-deep border border-surface-border rounded-lg px-3 py-2 text-sm outline-none focus:border-brand transition-colors text-ink placeholder-ink-mute;
}
</style>
