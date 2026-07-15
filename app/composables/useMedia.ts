import { load as yamlLoad } from 'js-yaml'
import MarkdownIt from 'markdown-it'

export interface FaqItem { q: string; a: string }
export interface TocItem { level: number; text: string; id: string }
export interface Article {
  slug: string
  title: string
  description: string
  category: string
  categorySlug: string
  keywords: string[]
  publishedAt: string
  updatedAt: string
  lead: string
  learn: string[]
  points: string[]
  faq: FaqItem[]
  related: string[]
  bodyHtml: string
  toc: TocItem[]
}

// ビルド時に content/media/*.md を生テキストで取り込む（Workers でも安全）
const raw = import.meta.glob('../content/media/*.md', {
  query: '?raw',
  import: 'default',
  eager: true,
}) as Record<string, string>

const md = new MarkdownIt({ html: true, linkify: true, typographer: false })

function renderBody(body: string): { html: string; toc: TocItem[] } {
  const tokens = md.parse(body, {})
  const toc: TocItem[] = []
  let n = 0
  for (let i = 0; i < tokens.length; i++) {
    const t = tokens[i]
    if (t.type === 'heading_open' && (t.tag === 'h2' || t.tag === 'h3')) {
      n++
      const id = `sec-${n}`
      t.attrSet('id', id)
      toc.push({ level: t.tag === 'h2' ? 2 : 3, text: tokens[i + 1]?.content ?? '', id })
    }
  }
  return { html: md.renderer.render(tokens, md.options, {} as any), toc }
}

function build(): Article[] {
  const list: Article[] = []
  for (const [path, content] of Object.entries(raw)) {
    const m = content.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n([\s\S]*)$/)
    if (!m) continue
    const fm = (yamlLoad(m[1]) as Record<string, any>) ?? {}
    const { html, toc } = renderBody(m[2])
    list.push({
      slug: fm.slug ?? path.split('/').pop()!.replace(/\.md$/, ''),
      title: fm.title ?? '',
      description: fm.description ?? '',
      category: fm.category ?? '',
      categorySlug: fm.categorySlug ?? '',
      keywords: fm.keywords ?? [],
      publishedAt: fm.publishedAt ?? '',
      updatedAt: fm.updatedAt ?? fm.publishedAt ?? '',
      lead: fm.lead ?? '',
      learn: fm.learn ?? [],
      points: fm.points ?? [],
      faq: fm.faq ?? [],
      related: fm.related ?? [],
      bodyHtml: html,
      toc,
    })
  }
  // 公開日の新しい順
  list.sort((a, b) => (a.publishedAt < b.publishedAt ? 1 : -1))
  return list
}

const articles = build()

export function useMediaList(): Article[] {
  return articles
}
export function useMediaArticle(slug: string): Article | null {
  return articles.find((a) => a.slug === slug) ?? null
}

export interface Category { name: string; slug: string; count: number }

// 記事から出現順にカテゴリを集計
export function useMediaCategories(): Category[] {
  const map = new Map<string, Category>()
  for (const a of articles) {
    if (!a.categorySlug) continue
    const c = map.get(a.categorySlug)
    if (c) c.count++
    else map.set(a.categorySlug, { name: a.category, slug: a.categorySlug, count: 1 })
  }
  return [...map.values()]
}

export function useMediaByCategory(categorySlug: string): Article[] {
  return articles.filter((a) => a.categorySlug === categorySlug)
}
