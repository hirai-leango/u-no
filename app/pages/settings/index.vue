<script setup lang="ts">
definePageMeta({ middleware: 'auth' })
navigateTo('/settings/resume', { redirectCode: 301 })
</script>

<template>
  <div class="text-center py-20 text-gray-600 text-sm">リダイレクト中...</div>
</template>
