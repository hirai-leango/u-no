<template>
  <div class="flex flex-col items-center justify-center min-h-[70vh] text-center">
    <img src="/yunomi-chabashira-transparent.gif" alt="ユーノーミー" class="w-28 h-28 object-contain mb-6" style="image-rendering: pixelated;" />
    <h1 class="text-2xl md:text-3xl mb-2 font-black text-ink">会員登録</h1>
    <p class="text-ink-soft text-sm mb-8">数秒で、あなたの信頼プロフィールを。</p>
    <SocialLoginButtons />
    <p class="text-ink-mute text-xs mt-8">
      すでにアカウントをお持ちの方は
      <NuxtLink to="/login" class="text-brand hover:underline">ログイン</NuxtLink>
    </p>
  </div>
</template>

<script setup lang="ts">
useSeoMeta({ title: '会員登録 | u-no.me（ユーノーミー）', robots: 'noindex' })
</script>
