<template>
  <div class="max-w-2xl mx-auto py-4">
    <NuxtLink to="/" class="inline-flex items-center gap-1 text-gray-500 text-sm hover:text-gray-300 mb-8 transition-colors">
      ← トップへ戻る
    </NuxtLink>

    <h1 class="text-2xl font-extrabold mb-2 bg-gradient-to-br from-white to-brand-light bg-clip-text text-transparent">
      利用規約
    </h1>
    <p class="text-xs text-gray-600 mb-8">最終更新日: 2026年7月10日</p>

    <div class="space-y-6 text-sm text-gray-300 leading-relaxed">
      <section>
        <h2 class="text-base font-bold text-gray-100 mb-2">第1条（適用）</h2>
        <p>本規約は、u-no.me（以下「本サービス」）の利用に関する条件を、本サービスを利用するすべての方（以下「ユーザー」）と運営者との間で定めるものです。ユーザーは本サービスを利用することで本規約に同意したものとみなされます。</p>
      </section>

      <section>
        <h2 class="text-base font-bold text-gray-100 mb-2">第2条（本サービスの内容）</h2>
        <p>本サービスは、ユーザーが自身のプロフィール・経歴を掲載し、第三者からの評価（レビュー）を受けることで、信頼性のある自己紹介ページを作成できるサービスです。</p>
      </section>

      <section>
        <h2 class="text-base font-bold text-gray-100 mb-2">第3条（アカウント登録）</h2>
        <p>ユーザーは、真実かつ正確な情報で登録するものとします。他人になりすます行為、虚偽の情報による登録を禁止します。本サービスは、レビューの投稿・評価等の一部機能について、電話番号による本人確認を求めることがあります。</p>
      </section>

      <section>
        <h2 class="text-base font-bold text-gray-100 mb-2">第4条（レビュー・投稿について）</h2>
        <p>ユーザーが投稿するレビュー・コメント・評価は、ユーザー自身の責任において行うものとします。以下の行為を禁止します。</p>
        <ul class="list-disc pl-5 mt-2 space-y-1 text-gray-400">
          <li>虚偽の内容、事実に反する評価の投稿</li>
          <li>誹謗中傷、名誉毀損、侮辱、差別的表現</li>
          <li>自作自演、報酬を伴うレビューの依頼・投稿</li>
          <li>他者のプライバシーや権利を侵害する内容</li>
          <li>スパム、宣伝、その他本サービスの趣旨に反する投稿</li>
        </ul>
      </section>

      <section>
        <h2 class="text-base font-bold text-gray-100 mb-2">第5条（投稿内容の取扱い）</h2>
        <p>ユーザーが投稿したレビュー・コメントは、原則として投稿者本人のみが編集・削除できます。ただし運営者は、本規約に違反する投稿、通報を受けた投稿について、事前の通知なく削除・非表示にすることができます。</p>
      </section>

      <section>
        <h2 class="text-base font-bold text-gray-100 mb-2">第6条（禁止事項）</h2>
        <p>法令または公序良俗に違反する行為、本サービスの運営を妨害する行為、不正アクセス、他ユーザーへの嫌がらせ等を禁止します。</p>
      </section>

      <section>
        <h2 class="text-base font-bold text-gray-100 mb-2">第7条（免責事項）</h2>
        <p>本サービスに掲載される情報の正確性・信頼性について、運営者は保証しません。ユーザー間、またはユーザーと第三者との間で生じた紛争について、運営者は責任を負いません。</p>
      </section>

      <section>
        <h2 class="text-base font-bold text-gray-100 mb-2">第8条（サービスの変更・停止）</h2>
        <p>運営者は、ユーザーへの事前通知なく、本サービスの内容の変更・追加・停止を行うことができます。</p>
      </section>

      <section>
        <h2 class="text-base font-bold text-gray-100 mb-2">第9条（規約の変更）</h2>
        <p>運営者は、必要に応じて本規約を変更できます。変更後の規約は本ページに掲載した時点で効力を生じます。</p>
      </section>

      <section>
        <h2 class="text-base font-bold text-gray-100 mb-2">第10条（準拠法・管轄）</h2>
        <p>本規約は日本法に準拠し、本サービスに関する紛争は運営者の所在地を管轄する裁判所を専属的合意管轄とします。</p>
      </section>
    </div>
  </div>
</template>

<script setup lang="ts">
useSeoMeta({
  title: '利用規約 | u-no.me',
  robots: 'noindex',
})
</script>
