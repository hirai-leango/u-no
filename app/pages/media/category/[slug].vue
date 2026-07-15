<template>
  <div class="max-w-3xl mx-auto">
    <template v-if="articles.length">
      <nav class="flex flex-wrap items-center gap-1.5 text-xs text-ink-mute mb-6">
        <NuxtLink to="/" class="hover:text-ink-soft">ホーム</NuxtLink>
        <span>›</span>
        <NuxtLink to="/media/" class="hover:text-ink-soft">メディア</NuxtLink>
        <span>›</span>
        <span class="text-ink-soft">{{ categoryName }}</span>
      </nav>

      <header class="mb-8">
        <p class="text-[11px] tracking-[.2em] text-trust font-bold mb-2">カテゴリ</p>
        <h1 class="text-2xl md:text-3xl font-black text-ink">{{ categoryName }}</h1>
        <p class="text-ink-mute text-sm mt-1">{{ articles.length }}件の記事</p>
      </header>

      <div class="space-y-4">
        <NuxtLink
          v-for="a in articles"
          :key="a.slug"
          :to="`/media/${a.slug}/`"
          class="block bg-surface border border-surface-border rounded-lg p-5 hover:border-brand transition-colors"
        >
          <h2 class="text-base md:text-lg font-bold text-ink mb-1.5 leading-snug">{{ a.title }}</h2>
          <p class="text-[13px] text-ink-soft leading-relaxed line-clamp-2">{{ a.description }}</p>
          <time class="text-xs text-ink-mute mt-2 block">{{ a.publishedAt }}</time>
        </NuxtLink>
      </div>

      <div class="mt-10">
        <NuxtLink to="/media/" class="text-sm text-ink-mute hover:text-ink transition-colors">← 記事一覧へ</NuxtLink>
      </div>
    </template>

    <div v-else class="text-center py-20 text-ink-mute">
      <p class="text-4xl mb-4">🔍</p>
      <p>カテゴリが見つかりませんでした</p>
      <NuxtLink to="/media/" class="text-brand text-sm hover:underline mt-4 inline-block">記事一覧へ</NuxtLink>
    </div>
  </div>
</template>

<script setup lang="ts">
const route = useRoute()
const slug = computed(() => route.params.slug as string)
const articles = useMediaByCategory(slug.value)
const categoryName = computed(() => articles[0]?.category ?? '')

if (articles.length) {
  useSeoMeta({
    title: `${categoryName.value}の記事一覧 | u-no.me`,
    description: `${categoryName.value}に関する記事一覧。他己紹介・リファレンス・プロフィールで「信頼を示す」ための実践知。`,
  })
} else {
  useSeoMeta({ title: 'カテゴリが見つかりません | u-no.me', robots: 'noindex' })
}
</script>
