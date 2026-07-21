<template>
  <article v-if="a" class="max-w-2xl mx-auto">
    <!-- パンくず -->
    <nav class="flex flex-wrap items-center gap-1.5 text-xs text-ink-mute mb-6">
      <NuxtLink to="/" class="hover:text-ink-soft">ホーム</NuxtLink>
      <span>›</span>
      <NuxtLink to="/media/" class="hover:text-ink-soft">メディア</NuxtLink>
      <span>›</span>
      <NuxtLink :to="`/media/category/${a.categorySlug}/`" class="hover:text-ink-soft">{{ a.category }}</NuxtLink>
    </nav>

    <p class="text-[11px] font-bold text-brand mb-2">{{ a.category }}</p>
    <h1 class="text-2xl md:text-[28px] font-black text-ink leading-tight mb-3">{{ a.title }}</h1>
    <div class="flex items-center gap-3 text-xs text-ink-mute mb-8">
      <time>公開 {{ a.publishedAt }}</time>
      <time v-if="a.updatedAt !== a.publishedAt">更新 {{ a.updatedAt }}</time>
    </div>

    <!-- リード -->
    <p class="text-ink-soft leading-relaxed mb-8">{{ a.lead }}</p>

    <!-- この記事でわかること -->
    <div v-if="a.learn.length" class="bg-surface border border-surface-border rounded-lg p-5 mb-4">
      <p class="text-sm font-bold text-ink mb-2.5">📌 この記事でわかること</p>
      <ul class="space-y-1.5">
        <li v-for="(x, i) in a.learn" :key="i" class="text-[13.5px] text-ink-soft flex gap-2">
          <span class="text-brand flex-none">•</span><span>{{ x }}</span>
        </li>
      </ul>
    </div>

    <!-- ポイント -->
    <div v-if="a.points.length" class="bg-brand/5 border border-brand/15 rounded-lg p-5 mb-8">
      <p class="text-sm font-bold text-ink mb-2.5">✅ この記事のポイント</p>
      <ul class="space-y-1.5">
        <li v-for="(x, i) in a.points" :key="i" class="text-[13.5px] text-ink-soft flex gap-2">
          <span class="text-trust flex-none">✓</span><span>{{ x }}</span>
        </li>
      </ul>
    </div>

    <!-- 目次 -->
    <nav v-if="a.toc.length" class="border border-surface-border rounded-lg p-5 mb-10">
      <p class="text-sm font-bold text-ink mb-3">目次</p>
      <ol class="space-y-1.5">
        <li v-for="item in a.toc" :key="item.id" :class="item.level === 3 ? 'ml-4' : ''">
          <a :href="`#${item.id}`" class="text-[13.5px] text-brand hover:underline">{{ item.text }}</a>
        </li>
      </ol>
    </nav>

    <!-- 本文 -->
    <div class="article-body" v-html="a.bodyHtml" />

    <!-- よくある質問 -->
    <section v-if="a.faq.length" class="mt-12">
      <h2 class="text-xl font-black text-ink mb-4">よくある質問</h2>
      <div class="space-y-3">
        <div v-for="(f, i) in a.faq" :key="i" class="bg-surface border border-surface-border rounded-lg p-5">
          <p class="text-[14.5px] font-bold text-ink mb-1.5">Q. {{ f.q }}</p>
          <p class="text-[13.5px] text-ink-soft leading-relaxed">A. {{ f.a }}</p>
        </div>
      </div>
    </section>

    <!-- CTA -->
    <div class="mt-12 bg-brand rounded-xl p-6 text-center">
      <p class="text-white font-bold text-[15px] leading-relaxed mb-4">
        あなたが信頼できることは、周りの人が教えてくれる。<br>You know me !<br>ユーノーミーで無料のプロフィールをつくる。
      </p>
      <NuxtLink to="/signup/" class="inline-block bg-white text-brand font-bold text-sm px-7 py-3 rounded-lg hover:opacity-90 transition-opacity">
        無料ではじめる →
      </NuxtLink>
    </div>

    <!-- 関連記事 -->
    <section v-if="relatedArticles.length" class="mt-12">
      <h2 class="text-lg font-black text-ink mb-4">関連記事</h2>
      <div class="space-y-3">
        <NuxtLink
          v-for="r in relatedArticles"
          :key="r.slug"
          :to="`/media/${r.slug}/`"
          class="block bg-surface border border-surface-border rounded-lg p-4 hover:border-brand transition-colors"
        >
          <span class="text-[11px] font-bold text-brand">{{ r.category }}</span>
          <p class="text-[14px] font-bold text-ink mt-0.5 leading-snug">{{ r.title }}</p>
        </NuxtLink>
      </div>
    </section>

    <div class="mt-10">
      <NuxtLink to="/media/" class="text-sm text-ink-mute hover:text-ink transition-colors">← 記事一覧へ</NuxtLink>
    </div>
  </article>

  <div v-else class="text-center py-20 text-ink-mute">
    <p class="text-4xl mb-4">🔍</p>
    <p>記事が見つかりませんでした</p>
    <NuxtLink to="/media/" class="text-brand text-sm hover:underline mt-4 inline-block">記事一覧へ</NuxtLink>
  </div>
</template>

<script setup lang="ts">
const route = useRoute()
const slug = computed(() => route.params.slug as string)
const a = useMediaArticle(slug.value)

const SITE = 'https://u-no.me'

const relatedArticles = computed(() =>
  (a?.related ?? []).map((s) => useMediaArticle(s)).filter((x): x is NonNullable<typeof x> => !!x),
)

if (a) {
  const url = `${SITE}/media/${a.slug}/`
  useSeoMeta({
    title: `${a.title} | ユーノーミー（u-no.me）`,
    ogTitle: a.title,
    description: a.description,
    ogDescription: a.description,
    ogType: 'article',
  })

  // 構造化データ（BreadcrumbList + Article + FAQPage）
  const graph: any[] = [
    {
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'ホーム', item: `${SITE}/` },
        { '@type': 'ListItem', position: 2, name: 'メディア', item: `${SITE}/media/` },
        { '@type': 'ListItem', position: 3, name: a.category, item: `${SITE}/media/category/${a.categorySlug}/` },
        { '@type': 'ListItem', position: 4, name: a.title },
      ],
    },
    {
      '@type': 'Article',
      headline: a.title,
      description: a.description,
      image: `${SITE}/ogp.png`,
      datePublished: `${a.publishedAt}T09:00:00+09:00`,
      dateModified: `${a.updatedAt}T09:00:00+09:00`,
      author: { '@type': 'Organization', name: 'ユーノーミー編集部', url: `${SITE}/` },
      publisher: {
        '@type': 'Organization',
        name: 'ユーノーミー（u-no.me）',
        logo: { '@type': 'ImageObject', url: `${SITE}/favicon-192.png` },
      },
      mainEntityOfPage: { '@type': 'WebPage', '@id': url },
    },
  ]
  if (a.faq.length) {
    graph.push({
      '@type': 'FAQPage',
      mainEntity: a.faq.map((f) => ({
        '@type': 'Question',
        name: f.q,
        acceptedAnswer: { '@type': 'Answer', text: f.a },
      })),
    })
  }

  useHead({
    script: [
      {
        type: 'application/ld+json',
        innerHTML: JSON.stringify({ '@context': 'https://schema.org', '@graph': graph }),
      },
    ],
  })
} else {
  useSeoMeta({ title: '記事が見つかりません | u-no.me', robots: 'noindex' })
}
</script>

<style scoped>
.article-body :deep(h2) {
  font-size: 20px;
  font-weight: 900;
  color: var(--tw-prose-ink, #26211B);
  margin: 40px 0 14px;
  line-height: 1.4;
  scroll-margin-top: 20px;
}
.article-body :deep(h3) {
  font-size: 16.5px;
  font-weight: 800;
  margin: 28px 0 10px;
  scroll-margin-top: 20px;
}
.article-body :deep(p) {
  line-height: 1.9;
  margin: 0 0 18px;
  font-size: 15px;
}
.article-body :deep(strong) { font-weight: 800; }
.article-body :deep(ul),
.article-body :deep(ol) { margin: 0 0 18px; padding-left: 1.4em; }
.article-body :deep(li) { line-height: 1.85; margin-bottom: 6px; }
.article-body :deep(a) { color: #1F4B7A; text-decoration: underline; }
.article-body :deep(table) {
  width: 100%;
  border-collapse: collapse;
  margin: 8px 0 22px;
  font-size: 13.5px;
  display: block;
  overflow-x: auto;
}
.article-body :deep(th),
.article-body :deep(td) {
  border: 1px solid var(--tw-line, #E5DBC8);
  padding: 8px 12px;
  text-align: left;
}
.article-body :deep(th) { background: rgba(31, 75, 122, .06); font-weight: 700; }
</style>
