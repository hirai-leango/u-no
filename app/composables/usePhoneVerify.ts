import {
  getAuth, RecaptchaVerifier, linkWithPhoneNumber,
} from 'firebase/auth'

// 現在のユーザーが電話番号認証済みか
export function useIsPhoneVerified() {
  const user = useCurrentUser()
  return computed(() =>
    !!user.value?.providerData?.some(p => p.providerId === 'phone'))
}

export function usePhoneVerify() {
  const auth = getAuth()

  // reCAPTCHA（invisible）を用意
  function makeRecaptcha(containerId: string) {
    return new RecaptchaVerifier(auth, containerId, { size: 'invisible' })
  }

  // SMS送信 → confirmationResult を返す（既存アカウントに電話番号を紐付け）
  async function sendCode(phoneE164: string, verifier: RecaptchaVerifier) {
    if (!auth.currentUser) throw new Error('ログインが必要です')
    return await linkWithPhoneNumber(auth.currentUser, phoneE164, verifier)
  }

  // 認証コードで確定
  async function confirmCode(confirmationResult: any, code: string) {
    await confirmationResult.confirm(code)
  }

  return { makeRecaptcha, sendCode, confirmCode }
}
