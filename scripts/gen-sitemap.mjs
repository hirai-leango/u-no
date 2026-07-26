// ビルド時に public/sitemap.xml を生成する
// 対象: トップ / メディア一覧 / カテゴリ / 各記事（noindexページは含めない）
import { readdirSync, readFileSync, writeFileSync, mkdirSync } from 'node:fs'

const SITE = 'https://u-no.me'
const DIR = 'app/content/media'

const files = readdirSync(DIR).filter((f) => f.endsWith('.md'))
const articles = files.map((f) => {
  const raw = readFileSync(`${DIR}/${f}`, 'utf8')
  const fm = raw.match(/^---\r?\n([\s\S]*?)\r?\n---/)?.[1] ?? ''
  const get = (k) => fm.match(new RegExp(`^${k}:\\s*["']?(.+?)["']?\\s*$`, 'm'))?.[1] ?? ''
  return {
    slug: f.replace(/\.md$/, ''),
    categorySlug: get('categorySlug'),
    lastmod: get('updatedAt') || get('publishedAt') || '',
  }
})

const cats = [...new Set(articles.map((a) => a.categorySlug).filter(Boolean))]
const today = new Date().toISOString().slice(0, 10)

// sitemapに載せる公開プロフィールを Firestore REST で取得。
// 条件は「検索ページの実行時noindex判定」と一致させる：
//   isSearchable == true かつ （受け取り＋贈った）エピソードが3件以上。
// これで sitemap に noindex ページを載せない。取得失敗時はビルドを止めずメディアのみで継続。
const PROJECT_ID = 'u-no-11938'
const FS_BASE = `https://firestore.googleapis.com/v1/projects/${PROJECT_ID}/databases/(default)/documents`

async function countReviews(field, uid) {
  try {
    const res = await fetch(`${FS_BASE}:runAggregationQuery`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        structuredAggregationQuery: {
          structuredQuery: {
            from: [{ collectionId: 'reviews' }],
            where: { fieldFilter: { field: { fieldPath: field }, op: 'EQUAL', value: { stringValue: uid } } },
          },
          aggregations: [{ alias: 'c', count: {} }],
        },
      }),
    })
    if (!res.ok) return null
    const j = await res.json()
    return Number(j?.[0]?.result?.aggregateFields?.c?.integerValue ?? 0)
  } catch {
    return null
  }
}

async function fetchPublicProfiles() {
  try {
    const res = await fetch(`${FS_BASE}:runQuery`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        structuredQuery: {
          from: [{ collectionId: 'users' }],
          where: {
            fieldFilter: { field: { fieldPath: 'isSearchable' }, op: 'EQUAL', value: { booleanValue: true } },
          },
        },
      }),
    })
    if (!res.ok) return []
    const rows = await res.json()
    const users = rows
      .filter((r) => r.document?.fields?.slug?.stringValue)
      .map((r) => ({ uid: r.document.name.split('/').pop(), slug: r.document.fields.slug.stringValue }))

    const slugs = []
    for (const u of users) {
      const [recv, given] = await Promise.all([countReviews('toUserId', u.uid), countReviews('fromUserId', u.uid)])
      // カウント取得に失敗した場合は、isSearchable=true を信頼して含める（有効プロフィールの取りこぼしを防ぐ）
      const total = (recv ?? 0) + (given ?? 0)
      const unknown = recv === null || given === null
      if (unknown || total >= 3) slugs.push(u.slug)
    }
    return slugs
  } catch {
    return []
  }
}

const profileSlugs = await fetchPublicProfiles()

const urls = [
  { loc: `${SITE}/`, lastmod: today, priority: '1.0' },
  { loc: `${SITE}/media/`, lastmod: today, priority: '0.8' },
  ...cats.map((c) => ({ loc: `${SITE}/media/category/${c}/`, lastmod: today, priority: '0.6' })),
  ...articles.map((a) => ({ loc: `${SITE}/media/${a.slug}/`, lastmod: a.lastmod || today, priority: '0.7' })),
  ...profileSlugs.map((s) => ({ loc: `${SITE}/u/${s}/`, lastmod: today, priority: '0.8' })),
]

const xml =
  `<?xml version="1.0" encoding="UTF-8"?>\n` +
  `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n` +
  urls
    .map(
      (u) =>
        `  <url>\n    <loc>${u.loc}</loc>\n    <lastmod>${u.lastmod}</lastmod>\n    <priority>${u.priority}</priority>\n  </url>`,
    )
    .join('\n') +
  `\n</urlset>\n`

mkdirSync('public', { recursive: true })
writeFileSync('public/sitemap.xml', xml)
console.log(`sitemap.xml generated: ${urls.length} URLs`)
