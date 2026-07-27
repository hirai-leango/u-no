// エピソードを受け取ったら本人にメール通知（Resend経由）。
// reviews の作成をトリガーに、Adminで宛先のメールアドレスを取得して送信する。
// 前提: Blaze プラン / RESEND_API_KEY シークレット / Resendで u-no.me ドメイン認証済み。
const { onDocumentCreated } = require('firebase-functions/v2/firestore')
const { defineSecret } = require('firebase-functions/params')
const admin = require('firebase-admin')

admin.initializeApp()

const RESEND_API_KEY = defineSecret('RESEND_API_KEY')

const SITE = 'https://u-no.me'
const FROM = 'ユーノーミー <noreply@u-no.me>'

function esc(s) {
  return String(s || '').replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]))
}

function buildHtml({ toName, fromName, comment, profileUrl, settingsUrl }) {
  const excerpt = comment.length > 140 ? comment.slice(0, 140) + '…' : comment
  return `
  <div style="background:#f4f1e8;padding:32px 16px;font-family:'Hiragino Kaku Gothic ProN','Yu Gothic',Meiryo,sans-serif;">
    <div style="max-width:480px;margin:0 auto;background:#ffffff;border-radius:14px;overflow:hidden;border:1px solid #e6e0d3;">
      <div style="background:#1F4B7A;padding:16px 24px;">
        <img src="https://u-no.me/og-yunomi.png" width="22" height="29" alt="" style="vertical-align:middle;margin-right:8px;" />
        <span style="color:#ffffff;font-weight:700;font-size:16px;vertical-align:middle;">ユーノーミー</span>
      </div>
      <div style="padding:24px;">
        <p style="margin:0 0 8px;color:#8a6d1f;font-weight:700;font-size:13px;">${esc(toName)}さんへ</p>
        <p style="margin:0 0 16px;color:#1B2430;font-weight:700;font-size:20px;line-height:1.4;">${esc(fromName)}さんがあなたについて<br>エピソードを書きました</p>
        <div style="background:#f4f1e8;border-radius:10px;padding:14px 16px;color:#43505f;font-size:14px;line-height:1.7;margin:0 0 20px;">「${esc(excerpt)}」</div>
        <a href="${profileUrl}" style="display:block;text-align:center;background:#1F4B7A;color:#fff;text-decoration:none;font-weight:700;font-size:14px;padding:13px;border-radius:8px;">ユーノーミーで見る</a>
      </div>
      <div style="padding:14px 24px;border-top:1px solid #e6e0d3;color:#8593a3;font-size:11px;line-height:1.6;">
        知人があなたを紹介する、ビジネスプロフィールサービスです。<br>
        メール通知を止めるには <a href="${settingsUrl}" style="color:#8593a3;">設定 &gt; メール通知</a> からオフにしてください。
      </div>
    </div>
  </div>`
}

exports.notifyReceivedEpisode = onDocumentCreated(
  { document: 'reviews/{reviewId}', region: 'asia-northeast1', secrets: [RESEND_API_KEY] },
  async (event) => {
    const data = event.data && event.data.data()
    if (!data) return
    const toUserId = data.toUserId
    const fromUserId = data.fromUserId
    if (!toUserId || toUserId === fromUserId) return

    // 宛先の登録ユーザーを取得（未登録=pending宛はここで getUser が失敗し送信されない）
    let userRecord
    try {
      userRecord = await admin.auth().getUser(toUserId)
    } catch (e) {
      return // 未登録の受け取り予定者などは通知対象外
    }
    const email = userRecord.email
    if (!email) return

    // プロフィール（slug・配信停止フラグ）
    let profile = {}
    try {
      const snap = await admin.firestore().doc(`users/${toUserId}`).get()
      profile = snap.data() || {}
    } catch (e) { /* プロフィール取得失敗でも送る */ }
    if (profile.emailNotify === false) return // 配信停止

    const slug = profile.slug || ''
    const profileUrl = slug ? `${SITE}/u/${slug}/` : SITE
    const settingsUrl = `${SITE}/settings/resume/`
    const toName = userRecord.displayName || profile.displayName || 'あなた'
    const fromName = data.fromDisplayName || 'ある方'
    const comment = data.comment || ''

    try {
      const res = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${RESEND_API_KEY.value()}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: FROM,
          to: [email],
          subject: `${fromName}さんがあなたについてエピソードを書きました`,
          html: buildHtml({ toName, fromName, comment, profileUrl, settingsUrl }),
        }),
      })
      if (!res.ok) console.error('Resend送信失敗', res.status, await res.text())
    } catch (e) {
      console.error('メール送信エラー', e)
    }
  },
)
