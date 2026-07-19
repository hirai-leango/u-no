export interface ToastState {
  message: string
  id: number
  type: 'success' | 'error'
}

export function useToast() {
  const toast = useState<ToastState | null>('app-toast', () => null)

  function showToast(message: string, opts?: { type?: 'success' | 'error'; duration?: number }) {
    const id = Date.now() + Math.random()
    toast.value = { message, id, type: opts?.type ?? 'success' }
    const duration = opts?.duration ?? 2500
    setTimeout(() => {
      if (toast.value?.id === id) toast.value = null
    }, duration)
  }

  return { toast, showToast }
}
