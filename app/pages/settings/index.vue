<script setup lang="ts">
// /settings/ は /settings/resume/ へリダイレクト（ルート解決時に処理＝SSRでも安全）
definePageMeta({ redirect: '/settings/resume/' })
</script>

<template>
  <div class="text-center py-20 text-ink-mute text-sm">リダイレクト中...</div>
</template>
