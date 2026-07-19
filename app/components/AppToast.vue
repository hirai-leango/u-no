<template>
  <div class="fixed bottom-6 inset-x-0 z-[60] flex justify-center px-4 pointer-events-none">
    <Transition name="toast">
      <div
        v-if="toast"
        :key="toast.id"
        class="pointer-events-auto text-white text-sm font-semibold px-5 py-3 rounded-lg shadow-lg max-w-[90%] text-center"
        :class="toast.type === 'error' ? 'bg-warn' : 'bg-ink'"
      >
        {{ toast.message }}
      </div>
    </Transition>
  </div>
</template>

<script setup lang="ts">
const { toast } = useToast()
</script>

<style scoped>
.toast-enter-active,
.toast-leave-active {
  transition: opacity 0.25s ease, transform 0.25s ease;
}
.toast-enter-from,
.toast-leave-to {
  opacity: 0;
  transform: translateY(12px);
}
</style>
