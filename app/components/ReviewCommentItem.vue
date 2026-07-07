<template>
  <div class="flex items-start gap-2">
    <NuxtLink :to="`/u/${comment.authorSlug}`" class="flex-shrink-0">
      <img :src="comment.authorPhoto" class="w-6 h-6 rounded-full object-cover" />
    </NuxtLink>
    <div class="flex-1 min-w-0">
      <div class="flex items-center gap-2">
        <NuxtLink :to="`/u/${comment.authorSlug}`" class="text-xs font-bold text-brand-light hover:underline">
          {{ comment.authorName }}
        </NuxtLink>
        <span class="text-[10px] text-gray-600">{{ formatDate(comment.createdAt) }}</span>
      </div>
      <p class="text-xs text-gray-300 leading-relaxed mt-0.5 break-words">{{ comment.text }}</p>
      <div class="flex items-center gap-3 mt-1">
        <button
          v-if="currentUser"
          class="text-[10px] text-gray-500 hover:text-gray-300 transition-colors"
          @click="$emit('reply', comment.parentId ?? comment.id)"
        >返信</button>
        <button
          v-if="currentUser?.uid === comment.authorUid"
          class="text-[10px] text-gray-500 hover:text-red-400 transition-colors"
          @click="$emit('delete', comment.id)"
        >削除</button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { ReviewComment } from '~/types'

defineProps<{
  comment: ReviewComment
  currentUser: any
}>()

defineEmits<{
  reply: [commentId: string]
  delete: [commentId: string]
}>()

function formatDate(date: any) {
  if (!date) return ''
  const d = date.toDate ? date.toDate() : new Date(date)
  return d.toLocaleDateString('ja-JP', { month: 'numeric', day: 'numeric' })
}
</script>
