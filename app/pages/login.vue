<template>
  <div class="flex flex-col items-center justify-center min-h-[70vh] text-center">
    <img src="/yunomi-chabashira-transparent.gif" alt="ユーノーミー" class="w-28 h-28 object-contain mb-6" style="image-rendering: pixelated;" />
    <h1 class="text-2xl md:text-3xl mb-2 font-black text-ink">ログイン</h1>
    <p class="text-ink-soft text-sm mb-8">おかえりなさい。</p>
    <SocialLoginButtons />
    <p class="text-ink-mute text-xs mt-8">
      はじめての方は
      <NuxtLink to="/signup" class="text-brand hover:underline">会員登録</NuxtLink>
    </p>
  </div>
</template>

<script setup lang="ts">
useSeoMeta({ title: 'ログイン | u-no.me（ユーノーミー）', robots: 'noindex' })
</script>
