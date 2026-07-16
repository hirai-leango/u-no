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

const urls = [
  { loc: `${SITE}/`, lastmod: today, priority: '1.0' },
  { loc: `${SITE}/media/`, lastmod: today, priority: '0.8' },
  ...cats.map((c) => ({ loc: `${SITE}/media/category/${c}/`, lastmod: today, priority: '0.6' })),
  ...articles.map((a) => ({ loc: `${SITE}/media/${a.slug}/`, lastmod: a.lastmod || today, priority: '0.7' })),
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
