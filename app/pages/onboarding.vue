<template>
  <div class="max-w-sm mx-auto pt-16">
    <h1 class="text-2xl font-extrabold mb-2 bg-gradient-to-br from-white to-brand-light bg-clip-text text-transparent">
      プロフィールを設定
    </h1>
    <p class="text-gray-400 text-sm mb-8">URLに使うスラッグを決めてください</p>

    <div class="mb-2">
      <label class="block text-xs font-bold tracking-widest uppercase text-gray-500 mb-2">スラッグ</label>
      <div class="flex items-center bg-surface border border-surface-border rounded-xl overflow-hidden focus-within:border-brand transition-colors">
        <span class="pl-4 text-gray-500 text-sm whitespace-nowrap">yuuno.app/u/</span>
        <input
          v-model="slug"
          type="text"
          placeholder="your-name"
          class="bg-transparent flex-1 px-2 py-3 text-sm outline-none text-gray-100"
          @input="checkSlug"
        />
      </div>
    </div>

    <p v-if="slugStatus === 'taken'" class="text-red-400 text-xs mb-4">このスラッグはすでに使われています</p>
    <p v-else-if="slugStatus === 'ok'" class="text-green-400 text-xs mb-4">使用できます</p>
    <p v-else class="text-transparent text-xs mb-4">_</p>

    <div class="mb-6">
      <label class="block text-xs font-bold tracking-widest uppercase text-gray-500 mb-2">自己紹介（任意）</label>
      <textarea
        v-model="bio"
        placeholder="簡単な自己紹介を書いてください"
        rows="3"
        class="w-full bg-surface border border-surface-border rounded-xl px-4 py-3 text-sm outline-none focus:border-brand transition-colors resize-none text-gray-100 placeholder-gray-600"
      />
    </div>

    <button
      :disabled="!canSubmit"
      class="w-full py-3 rounded-xl font-bold text-sm bg-gradient-to-r from-brand to-brand-dark text-white transition-opacity disabled:opacity-40"
      @click="submit"
    >
      はじめる
    </button>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ middleware: 'auth' })

const user = useCurrentUser()
const { isSlugAvailable, saveProfile } = useUserProfile()

const slug = ref('')
const bio = ref('')
const slugStatus = ref<'idle' | 'ok' | 'taken'>('idle')
let debounceTimer: ReturnType<typeof setTimeout>

const canSubmit = computed(() => slug.value.length >= 2 && slugStatus.value === 'ok')

function checkSlug() {
  slug.value = slug.value.toLowerCase().replace(/[^a-z0-9-]/g, '')
  slugStatus.value = 'idle'
  clearTimeout(debounceTimer)
  if (slug.value.length < 2) return
  debounceTimer = setTimeout(async () => {
    const available = await isSlugAvailable(slug.value)
    slugStatus.value = available ? 'ok' : 'taken'
  }, 400)
}

async function submit() {
  if (!user.value || !canSubmit.value) return
  await saveProfile(user.value.uid, {
    uid: user.value.uid,
    displayName: user.value.displayName ?? '',
    photoURL: user.value.photoURL ?? '',
    slug: slug.value,
    bio: bio.value,
    resume: { summary: '', skills: [], experience: [], education: [] },
    createdAt: new Date(),
  })
  navigateTo(`/u/${slug.value}`)
}
</script>
