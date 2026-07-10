<template>
  <div class="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4" @click.self="$emit('close')">
    <div class="w-full max-w-sm bg-surface border border-surface-border rounded-2xl p-6">
      <h2 class="text-lg font-extrabold mb-1 bg-gradient-to-br from-white to-brand-light bg-clip-text text-transparent">
        電話番号で本人確認
      </h2>
      <p class="text-xs text-gray-500 mb-6">
        なりすまし・不正投稿を防ぐため、レビューの投稿・評価には電話番号による本人確認が必要です。番号は公開されません。
      </p>

      <div v-if="step === 'input'">
        <label class="block text-xs font-bold tracking-widest uppercase text-gray-500 mb-2">電話番号</label>
        <input
          v-model="phone"
          type="tel"
          placeholder="090-1234-5678"
          class="w-full bg-surface-deep border border-surface-border rounded-xl px-4 py-3 text-sm outline-none focus:border-brand transition-colors text-gray-100 placeholder-gray-600 mb-2"
        />
        <p class="text-[11px] text-gray-600 mb-4">日本の携帯番号（先頭0）を入力してください</p>
        <button
          :disabled="!phone.trim() || loading"
          class="w-full py-3 rounded-xl font-bold text-sm bg-gradient-to-r from-brand to-brand-dark text-white transition-opacity disabled:opacity-40"
          @click="onSend"
        >
          {{ loading ? '送信中…' : '認証コードを送信' }}
        </button>
      </div>

      <div v-else-if="step === 'code'">
        <label class="block text-xs font-bold tracking-widest uppercase text-gray-500 mb-2">認証コード</label>
        <input
          v-model="code"
          type="text"
          inputmode="numeric"
          placeholder="6桁のコード"
          class="w-full bg-surface-deep border border-surface-border rounded-xl px-4 py-3 text-sm outline-none focus:border-brand transition-colors text-gray-100 placeholder-gray-600 mb-4 tracking-widest text-center"
        />
        <button
          :disabled="!code.trim() || loading"
          class="w-full py-3 rounded-xl font-bold text-sm bg-gradient-to-r from-brand to-brand-dark text-white transition-opacity disabled:opacity-40"
          @click="onConfirm"
        >
          {{ loading ? '確認中…' : '確認する' }}
        </button>
      </div>

      <p v-if="error" class="text-red-400 text-xs mt-3">{{ error }}</p>

      <button class="w-full text-center text-xs text-gray-500 hover:text-gray-300 mt-4 transition-colors" @click="$emit('close')">
        あとにする
      </button>

      <div id="recaptcha-container" />
    </div>
  </div>
</template>

<script setup lang="ts">
const emit = defineEmits<{ close: []; verified: [] }>()

const { makeRecaptcha, sendCode, confirmCode } = usePhoneVerify()

const step = ref<'input' | 'code'>('input')
const phone = ref('')
const code = ref('')
const loading = ref(false)
const error = ref('')
let confirmation: any = null
let verifier: any = null

// 日本の番号を E.164 (+81) に変換
function toE164(input: string): string {
  const digits = input.replace(/[^0-9]/g, '')
  if (digits.startsWith('0')) return '+81' + digits.slice(1)
  if (digits.startsWith('81')) return '+' + digits
  return '+81' + digits
}

async function onSend() {
  error.value = ''
  loading.value = true
  try {
    if (!verifier) verifier = makeRecaptcha('recaptcha-container')
    confirmation = await sendCode(toE164(phone.value), verifier)
    step.value = 'code'
  } catch (e: any) {
    error.value = e?.message?.includes('already')
      ? 'この電話番号は既に使われています'
      : '送信に失敗しました。番号を確認してください。'
  } finally {
    loading.value = false
  }
}

async function onConfirm() {
  error.value = ''
  loading.value = true
  try {
    await confirmCode(confirmation, code.value.trim())
    emit('verified')
  } catch {
    error.value = 'コードが正しくありません'
  } finally {
    loading.value = false
  }
}
</script>
