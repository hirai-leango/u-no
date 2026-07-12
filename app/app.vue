<template>
  <NuxtLayout>
    <NuxtPage />
  </NuxtLayout>
</template>

<script setup lang="ts">
import { withTrailingSlash } from 'ufo'

const route = useRoute()
const SITE = 'https://u-no.me'

// canonical をトレイリングスラッシュ付きの正規URLで出力（クエリは除外）
useHead({
  link: [
    {
      rel: 'canonical',
      href: () => SITE + (route.path === '/' ? '/' : withTrailingSlash(route.path)),
    },
  ],
})
</script>
