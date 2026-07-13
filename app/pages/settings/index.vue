<script setup lang="ts">
definePageMeta({ middleware: 'auth' })
useSeoMeta({ robots: 'noindex, nofollow' })
navigateTo('/settings/resume/', { redirectCode: 301 })
</script>

<template>
  <div class="text-center py-20 text-ink-mute text-sm">リダイレクト中...</div>
</template>
