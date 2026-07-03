<template>
  <div class="max-w-2xl mx-auto">
    <div class="flex items-center justify-between mb-8">
      <h1 class="text-2xl font-extrabold bg-gradient-to-br from-white to-brand-light bg-clip-text text-transparent">
        履歴書を編集
      </h1>
      <button
        :disabled="saving"
        class="px-5 py-2.5 bg-gradient-to-r from-brand to-brand-dark rounded-xl text-sm font-bold disabled:opacity-40 hover:opacity-80 transition-opacity"
        @click="save"
      >
        {{ saving ? '保存中...' : '保存する' }}
      </button>
    </div>

    <!-- PDFインポート -->
    <div class="bg-surface border border-surface-border rounded-2xl p-6 mb-8">
      <h2 class="text-sm font-bold text-gray-300 mb-1">PDFからインポート</h2>
      <p class="text-xs text-gray-500 mb-4">履歴書PDFをアップロードすると、AIが自動で項目を入力します</p>
      <div
        class="border-2 border-dashed border-surface-border rounded-xl p-8 text-center cursor-pointer hover:border-brand transition-colors"
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
          <p class="text-sm text-gray-400">PDFをドラッグ＆ドロップ、またはクリック</p>
          <p class="text-xs text-gray-600 mt-1">住所・電話番号は自動的に除外されます</p>
        </div>
      </div>
    </div>

    <!-- 自己PR -->
    <section class="mb-6">
      <label class="block text-xs font-bold tracking-widest uppercase text-gray-500 mb-2">自己PR</label>
      <textarea
        v-model="form.summary"
        rows="4"
        placeholder="自己PRを入力してください"
        class="w-full bg-surface border border-surface-border rounded-xl px-4 py-3 text-sm outline-none focus:border-brand transition-colors resize-none text-gray-100 placeholder-gray-600"
      />
    </section>

    <!-- スキル -->
    <section class="mb-6">
      <label class="block text-xs font-bold tracking-widest uppercase text-gray-500 mb-2">スキル</label>
      <div class="flex flex-wrap gap-2 mb-2">
        <span
          v-for="(skill, i) in form.skills"
          :key="skill"
          class="flex items-center gap-1 px-3 py-1 bg-surface-deep border border-surface-border rounded-full text-xs text-brand-light"
        >
          {{ skill }}
          <button class="text-gray-500 hover:text-red-400 transition-colors" @click="form.skills.splice(i, 1)">×</button>
        </span>
      </div>
      <div class="flex gap-2">
        <input
          v-model="newSkill"
          type="text"
          placeholder="スキルを追加（例: TypeScript）"
          class="flex-1 bg-surface border border-surface-border rounded-xl px-4 py-2.5 text-sm outline-none focus:border-brand transition-colors text-gray-100 placeholder-gray-600"
          @keydown.enter.prevent="addSkill"
        />
        <button
          class="px-4 py-2.5 bg-surface border border-surface-border rounded-xl text-sm text-gray-400 hover:text-gray-200 transition-colors"
          @click="addSkill"
        >追加</button>
      </div>
    </section>

    <!-- 職歴 -->
    <section class="mb-6">
      <div class="flex items-center justify-between mb-3">
        <label class="text-xs font-bold tracking-widest uppercase text-gray-500">職歴</label>
        <button class="text-xs text-brand-light hover:underline" @click="addExperience">+ 追加</button>
      </div>
      <div class="space-y-4">
        <div
          v-for="(exp, i) in form.experience"
          :key="i"
          class="bg-surface border border-surface-border rounded-xl p-4 space-y-3"
        >
          <div class="flex justify-end">
            <button class="text-xs text-gray-500 hover:text-red-400 transition-colors" @click="form.experience.splice(i, 1)">削除</button>
          </div>
          <div class="grid grid-cols-2 gap-3">
            <div>
              <label class="text-xs text-gray-500 mb-1 block">会社名</label>
              <input v-model="exp.company" type="text" class="input-field" placeholder="株式会社○○" />
            </div>
            <div>
              <label class="text-xs text-gray-500 mb-1 block">役職</label>
              <input v-model="exp.title" type="text" class="input-field" placeholder="エンジニア" />
            </div>
            <div>
              <label class="text-xs text-gray-500 mb-1 block">開始</label>
              <input v-model="exp.startDate" type="month" class="input-field" />
            </div>
            <div>
              <label class="text-xs text-gray-500 mb-1 block">終了</label>
              <input v-model="exp.endDate" type="month" class="input-field" placeholder="現在" />
            </div>
          </div>
          <div>
            <label class="text-xs text-gray-500 mb-1 block">業務内容</label>
            <textarea v-model="exp.description" rows="2" class="input-field resize-none" placeholder="担当業務の概要" />
          </div>
        </div>
      </div>
    </section>

    <!-- 学歴 -->
    <section class="mb-10">
      <div class="flex items-center justify-between mb-3">
        <label class="text-xs font-bold tracking-widest uppercase text-gray-500">学歴</label>
        <button class="text-xs text-brand-light hover:underline" @click="addEducation">+ 追加</button>
      </div>
      <div class="space-y-4">
        <div
          v-for="(edu, i) in form.education"
          :key="i"
          class="bg-surface border border-surface-border rounded-xl p-4 space-y-3"
        >
          <div class="flex justify-end">
            <button class="text-xs text-gray-500 hover:text-red-400 transition-colors" @click="form.education.splice(i, 1)">削除</button>
          </div>
          <div class="grid grid-cols-2 gap-3">
            <div class="col-span-2">
              <label class="text-xs text-gray-500 mb-1 block">学校名</label>
              <input v-model="edu.institution" type="text" class="input-field" placeholder="○○大学" />
            </div>
            <div>
              <label class="text-xs text-gray-500 mb-1 block">学位</label>
              <input v-model="edu.degree" type="text" class="input-field" placeholder="学士" />
            </div>
            <div>
              <label class="text-xs text-gray-500 mb-1 block">専攻</label>
              <input v-model="edu.field" type="text" class="input-field" placeholder="情報工学" />
            </div>
            <div>
              <label class="text-xs text-gray-500 mb-1 block">入学</label>
              <input v-model="edu.startDate" type="month" class="input-field" />
            </div>
            <div>
              <label class="text-xs text-gray-500 mb-1 block">卒業</label>
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

import type { Resume } from '~/types'

const user = useCurrentUser()
const { getProfileByUid, saveProfile } = useUserProfile()
const fileInput = ref<HTMLInputElement>()
const isDragging = ref(false)
const parsing = ref(false)
const saving = ref(false)
const newSkill = ref('')

const form = reactive<Resume>({
  summary: '',
  skills: [],
  experience: [],
  education: [],
})

onMounted(async () => {
  if (!user.value) return
  const profile = await getProfileByUid(user.value.uid)
  if (profile?.resume) Object.assign(form, profile.resume)
})

function addSkill() {
  const s = newSkill.value.trim()
  if (s && !form.skills.includes(s)) form.skills.push(s)
  newSkill.value = ''
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
    if (res.skills?.length) form.skills = [...new Set([...form.skills, ...res.skills])]
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
  await saveProfile(user.value.uid, { resume: { ...form } })
  saving.value = false
}
</script>

<style>
.input-field {
  @apply w-full bg-surface-deep border border-surface-border rounded-lg px-3 py-2 text-sm outline-none focus:border-brand transition-colors text-gray-100 placeholder-gray-600;
}
</style>
