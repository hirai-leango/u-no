<template>
  <NuxtLayout>
    <NuxtPage />
  </NuxtLayout>
</template>

<script setup lang="ts">
import { withTrailingSlash } from 'ufo'

const route = useRoute()
const SITE = 'https://u-no.me'

const canonicalUrl = () => SITE + (route.path === '/' ? '/' : withTrailingSlash(route.path))

// canonical をトレイリングスラッシュ付きの正規URLで出力（クエリは除外）
useHead({
  link: [
    { rel: 'canonical', href: canonicalUrl },
  ],
})

// OGP / Twitter カードの共通デフォルト（各ページで title/description/image は上書き可）
useSeoMeta({
  ogSiteName: 'ユーノーミー',
  ogType: 'website',
  ogUrl: canonicalUrl,
  ogImage: `${SITE}/ogp.png`,
  ogImageWidth: 1200,
  ogImageHeight: 630,
  twitterCard: 'summary_large_image',
  twitterImage: `${SITE}/ogp.png`,
})
</script>
