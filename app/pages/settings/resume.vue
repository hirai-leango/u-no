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

import type { Resume, ProfileLink } from '~/types'

const user = useCurrentUser()
const { getProfileByUid, saveProfile } = useUserProfile()
const saving = ref(false)

const form = reactive<Resume>({
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
      headline: headline.value,
      bio: bio.value,
      links: links.value.filter(l => l.label && isHttpUrl(l.url)),
      resume: { ...form },
      isSearchable: isSearchable.value,
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
