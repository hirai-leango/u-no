<template>
  <div class="w-full max-w-sm mx-auto">
    <img src="/yunomi-chabashira-transparent.gif" alt="ユーノーミー" class="w-24 h-24 object-contain mb-6 mx-auto" style="image-rendering: pixelated;" />

    <!-- タブ -->
    <div class="grid grid-cols-2 border border-line rounded-lg overflow-hidden mb-8">
      <NuxtLink
        to="/login"
        class="py-3 text-sm font-bold text-center transition-colors"
        :class="mode === 'login' ? 'bg-brand text-white' : 'bg-white text-ink-soft hover:bg-brand/5'"
      >
        ログイン
      </NuxtLink>
      <NuxtLink
        to="/signup"
        class="py-3 text-sm font-bold text-center transition-colors"
        :class="mode === 'signup' ? 'bg-brand text-white' : 'bg-white text-ink-soft hover:bg-brand/5'"
      >
        会員登録
      </NuxtLink>
    </div>

    <div class="text-center mb-6">
      <h1 class="text-xl md:text-2xl font-black text-ink mb-1.5">
        {{ mode === 'login' ? 'おかえりなさい' : 'はじめまして' }}
      </h1>
      <p class="text-ink-soft text-[13px]">
        {{ mode === 'login' ? 'アカウントにログインします。' : '会員登録して、あなたの信頼を可視化しよう。' }}
      </p>
    </div>

    <SocialLoginButtons />

    <p class="text-ink-mute text-xs mt-8 text-center">
      <template v-if="mode === 'login'">
        はじめての方は
        <NuxtLink to="/signup" class="text-brand hover:underline">会員登録</NuxtLink>
      </template>
      <template v-else>
        すでにアカウントをお持ちの方は
        <NuxtLink to="/login" class="text-brand hover:underline">ログイン</NuxtLink>
      </template>
    </p>
  </div>
</template>

<script setup lang="ts">
defineProps<{ mode: 'login' | 'signup' }>()
</script>
