<template>
  <div class="max-w-2xl mx-auto py-4">
    <NuxtLink to="/" class="inline-flex items-center gap-1 text-ink-mute text-sm hover:text-ink-soft mb-8 transition-colors">
      ← トップへ戻る
    </NuxtLink>

    <h1 class="text-2xl font-extrabold mb-2 bg-gradient-to-br from-ink to-brand-light bg-clip-text text-transparent">
      プライバシーポリシー
    </h1>
    <p class="text-xs text-ink-mute mb-8">最終更新日: 2026年7月10日</p>

    <div class="space-y-6 text-sm text-ink-soft leading-relaxed">
      <section>
        <h2 class="text-base font-bold text-ink mb-2">1. 取得する情報</h2>
        <p>本サービス（u-no.me）は、以下の情報を取得します。</p>
        <ul class="list-disc pl-5 mt-2 space-y-1 text-ink-mute">
          <li>ソーシャルログイン（Google等）から取得する氏名・プロフィール画像・メールアドレス</li>
          <li>ユーザーが入力するプロフィール、経歴（職歴・学歴・自己PR）</li>
          <li>ユーザーが投稿するレビュー・コメント・評価</li>
          <li>本人確認のために取得する電話番号</li>
          <li>アクセスログ等の技術的情報</li>
        </ul>
      </section>

      <section>
        <h2 class="text-base font-bold text-ink mb-2">2. 利用目的</h2>
        <ul class="list-disc pl-5 space-y-1 text-ink-mute">
          <li>本サービスの提供・運営・本人確認</li>
          <li>なりすまし・不正利用・スパムの防止</li>
          <li>お問い合わせ対応、通報への対応</li>
          <li>サービスの改善・新機能の開発</li>
        </ul>
      </section>

      <section>
        <h2 class="text-base font-bold text-ink mb-2">3. 公開される情報</h2>
        <p>プロフィール、経歴、および受け取ったレビューは、ユーザーの設定に応じてインターネット上に公開されます。電話番号・メールアドレスは公開されません。ユーザーは設定画面から検索エンジンへの表示可否を選択できます。</p>
      </section>

      <section>
        <h2 class="text-base font-bold text-ink mb-2">4. 第三者提供</h2>
        <p>運営者は、法令に基づく場合を除き、ユーザーの同意なく個人情報を第三者に提供しません。</p>
      </section>

      <section>
        <h2 class="text-base font-bold text-ink mb-2">5. 外部サービスの利用</h2>
        <p>本サービスは、認証・データベース基盤として Google Firebase を、ホスティングに Cloudflare を利用しています。これらの取得情報の取扱いは各社のプライバシーポリシーに従います。</p>
      </section>

      <section>
        <h2 class="text-base font-bold text-ink mb-2">6. 情報の削除</h2>
        <p>ユーザーは、自身のアカウント・プロフィール・投稿を削除できます。アカウント削除の希望はお問い合わせ窓口までご連絡ください。</p>
      </section>

      <section>
        <h2 class="text-base font-bold text-ink mb-2">7. お問い合わせ</h2>
        <p>本ポリシーに関するお問い合わせは、運営者の連絡先までご連絡ください。</p>
      </section>

      <section>
        <h2 class="text-base font-bold text-ink mb-2">8. 改定</h2>
        <p>本ポリシーは、必要に応じて改定されることがあります。改定後の内容は本ページに掲載した時点で効力を生じます。</p>
      </section>
    </div>
  </div>
</template>

<script setup lang="ts">
useSeoMeta({
  title: 'プライバシーポリシー | u-no.me',
  robots: 'noindex',
})
</script>
