// SSR用: Firestore REST APIでプロフィールとレビューを取得
// Cloudflare WorkersではFirestoreクライアントSDKが動かないためREST経由

const PROJECT_ID = 'u-no-11938'
const BASE = `https://firestore.googleapis.com/v1/projects/${PROJECT_ID}/databases/(default)/documents`

function parseFields(fields: any): any {
  if (!fields) return null
  const result: any = {}
  for (const [key, val] of Object.entries<any>(fields)) {
    result[key] = parseValue(val)
  }
  return result
}

function parseValue(val: any): any {
  if ('stringValue' in val) return val.stringValue
  if ('integerValue' in val) return Number(val.integerValue)
  if ('doubleValue' in val) return val.doubleValue
  if ('booleanValue' in val) return val.booleanValue
  if ('timestampValue' in val) return val.timestampValue
  if ('nullValue' in val) return null
  if ('arrayValue' in val) return (val.arrayValue.values ?? []).map(parseValue)
  if ('mapValue' in val) return parseFields(val.mapValue.fields)
  return null
}

export default defineEventHandler(async (event) => {
  const slug = getRouterParam(event, 'slug')

  // slugでユーザー検索（structured query）
  const queryRes = await $fetch<any>(`${BASE}:runQuery`, {
    method: 'POST',
    body: {
      structuredQuery: {
        from: [{ collectionId: 'users' }],
        where: {
          fieldFilter: {
            field: { fieldPath: 'slug' },
            op: 'EQUAL',
            value: { stringValue: slug },
          },
        },
        limit: 1,
      },
    },
  })

  const userDoc = queryRes.find((r: any) => r.document)?.document
  if (!userDoc) return { profile: null, reviews: [] }

  const uid = userDoc.name.split('/').pop()
  const profile = { uid, ...parseFields(userDoc.fields) }

  // レビュー取得
  const reviewRes = await $fetch<any>(`${BASE}:runQuery`, {
    method: 'POST',
    body: {
      structuredQuery: {
        from: [{ collectionId: 'reviews' }],
        where: {
          fieldFilter: {
            field: { fieldPath: 'toUserId' },
            op: 'EQUAL',
            value: { stringValue: uid },
          },
        },
      },
    },
  })

  const reviews = reviewRes
    .filter((r: any) => r.document)
    .map((r: any) => ({
      id: r.document.name.split('/').pop(),
      ...parseFields(r.document.fields),
    }))
    // インデックス不要にするためサーバー側で新しい順にソート
    .sort((a: any, b: any) => {
      const ta = a.createdAt ? new Date(a.createdAt).getTime() : 0
      const tb = b.createdAt ? new Date(b.createdAt).getTime() : 0
      return tb - ta
    })

  return { profile, reviews }
})
