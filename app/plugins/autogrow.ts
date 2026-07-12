// textarea を入力量に応じて自動で縦に伸ばすディレクティブ v-autogrow
export default defineNuxtPlugin((nuxtApp) => {
  const fit = (ta: HTMLTextAreaElement) => {
    ta.style.height = 'auto'
    ta.style.height = ta.scrollHeight + 'px'
  }
  const getTa = (el: HTMLElement): HTMLTextAreaElement | null =>
    (el.tagName === 'TEXTAREA' ? el : el.querySelector('textarea')) as HTMLTextAreaElement | null

  nuxtApp.vueApp.directive('autogrow', {
    // SSR時に呼ばれる（DOMは無いので何も付与しない）
    getSSRProps() {
      return {}
    },
    mounted(el: HTMLElement) {
      const ta = getTa(el)
      if (!ta) return
      ta.style.overflowY = 'hidden'
      const handler = () => fit(ta)
      ;(ta as any).__autogrow = handler
      ta.addEventListener('input', handler)
      nextTick(() => fit(ta))
    },
    // v-model が非同期で埋まった後などに再フィット
    updated(el: HTMLElement) {
      const ta = getTa(el)
      if (ta) nextTick(() => fit(ta))
    },
    unmounted(el: HTMLElement) {
      const ta = getTa(el)
      const handler = ta && (ta as any).__autogrow
      if (ta && handler) ta.removeEventListener('input', handler)
    },
  })
})
