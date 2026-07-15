<template>
  <div class="max-w-2xl mx-auto py-4">
    <NuxtLink to="/" class="inline-flex items-center gap-1 text-ink-mute text-sm hover:text-ink-soft mb-8 transition-colors">
      ← トップへ戻る
    </NuxtLink>

    <h1 class="text-2xl font-extrabold mb-2 font-black text-ink">
      プライバシーポリシー
    </h1>
    <p class="text-xs text-ink-mute mb-8">最終更新日: 2026年7月12日</p>

    <div class="space-y-6 text-sm text-ink-soft leading-relaxed">
      <section>
        <h2 class="text-base font-bold text-ink mb-2">1. 取得する情報</h2>
        <p>本サービス（u-no.me）は、以下の情報を取得します。</p>
        <ul class="list-disc pl-5 mt-2 space-y-1 text-ink-mute">
          <li>ソーシャルログイン（Google等）から取得する氏名・プロフィール画像・メールアドレス</li>
          <li>ユーザーが入力するプロフィール、経歴（職歴・学歴・自己PR）</li>
          <li>ユーザーが投稿するエピソード・コメント・評価</li>
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
        <p>プロフィール、経歴、および受け取ったエピソードは、ユーザーの設定に応じてインターネット上に公開されます。電話番号・メールアドレスは公開されません。ユーザーは設定画面から検索エンジンへの表示可否を選択できます。</p>
      </section>

      <section>
        <h2 class="text-base font-bold text-ink mb-2">4. ユーザーによる投稿情報の取扱い</h2>
        <p>ユーザーが投稿するエピソード・コメント等には、第三者に関する情報が含まれる場合があります。これらの投稿情報の内容および適法性についての責任は投稿したユーザーに帰属し、運営者はその内容について責任を負いません。投稿情報に起因してユーザー間または第三者との間で生じた紛争は、<NuxtLink to="/terms/" class="text-brand hover:underline">利用規約</NuxtLink>の定めに従い、当事者間で解決されるものとします。</p>
      </section>

      <section>
        <h2 class="text-base font-bold text-ink mb-2">5. 第三者提供</h2>
        <p>運営者は、法令に基づく場合を除き、ユーザーの同意なく個人情報を第三者に提供しません。ユーザー間の紛争等に関して、運営者が当事者情報を開示する義務を負うものではありません（法令に基づく場合を除きます）。</p>
      </section>

      <section>
        <h2 class="text-base font-bold text-ink mb-2">6. 外部サービスの利用・アクセス解析</h2>
        <p>本サービスは、認証・データベース基盤として Google Firebase を、ホスティングに Cloudflare を利用しています。また、利用状況の把握・改善のため、Google LLC が提供するアクセス解析ツール「Google アナリティクス」を利用しています。Google アナリティクスは Cookie を用いて匿名のトラフィックデータを収集します（個人を特定する情報は含みません）。これらの取得情報の取扱いは各社のプライバシーポリシーに従います。Cookie の無効化により収集を拒否することも可能です。</p>
      </section>

      <section>
        <h2 class="text-base font-bold text-ink mb-2">7. 情報の削除</h2>
        <p>ユーザーは、自身のアカウント・プロフィール・投稿を削除できます。アカウント削除の希望はお問い合わせ窓口までご連絡ください。</p>
      </section>

      <section>
        <h2 class="text-base font-bold text-ink mb-2">8. お問い合わせ</h2>
        <p>本サービスの個人情報取扱事業者は株式会社LeanGoです。本ポリシーに関するお問い合わせ、および個人情報の開示・訂正・削除等のご請求は、次の窓口までご連絡ください。</p>
        <p class="mt-2">運営者: 株式会社LeanGo<br>メール: <a href="mailto:support@u-no.me" class="text-brand hover:underline">support@u-no.me</a></p>
      </section>

      <section>
        <h2 class="text-base font-bold text-ink mb-2">9. 改定</h2>
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
