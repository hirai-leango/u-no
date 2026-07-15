<template>
  <div class="max-w-3xl mx-auto">
    <header class="mb-10">
      <p class="text-[11px] tracking-[.2em] text-trust font-bold mb-2">u-no.me メディア</p>
      <h1 class="text-2xl md:text-3xl font-black text-ink mb-2">信頼のつくり方</h1>
      <p class="text-ink-soft text-sm">他己紹介・リファレンス・プロフィールで「信頼を示す」ための実践知。</p>
    </header>

    <div class="space-y-4">
      <NuxtLink
        v-for="a in articles"
        :key="a.slug"
        :to="`/media/${a.slug}/`"
        class="block bg-surface border border-surface-border rounded-lg p-5 hover:border-brand transition-colors"
      >
        <span class="text-[11px] font-bold text-brand">{{ a.category }}</span>
        <h2 class="text-base md:text-lg font-bold text-ink mt-1 mb-1.5 leading-snug">{{ a.title }}</h2>
        <p class="text-[13px] text-ink-soft leading-relaxed line-clamp-2">{{ a.description }}</p>
        <time class="text-xs text-ink-mute mt-2 block">{{ a.publishedAt }}</time>
      </NuxtLink>
    </div>
  </div>
</template>

<script setup lang="ts">
const articles = useMediaList()

useSeoMeta({
  title: 'メディア | u-no.me（ユーノーミー）',
  description: '他己紹介・リファレンス・プロフィールで「信頼を示す」ための実践知をまとめたu-no.meのメディア。',
})
</script>
