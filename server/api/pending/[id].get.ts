// SSR用: 未登録の受け取り予定者（pendingRecipients）と、その仮ID宛のエピソードを
// Firestore REST で取得（Cloudflare WorkersではクライアントSDKが使えないため）
const PROJECT_ID = 'u-no-11938'
const BASE = `https://firestore.googleapis.com/v1/projects/${PROJECT_ID}/databases/(default)/documents`

function parseFields(fields: any): any {
  if (!fields) return null
  const result: any = {}
  for (const [key, val] of Object.entries<any>(fields)) result[key] = parseValue(val)
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
  const id = getRouterParam(event, 'id')

  const doc = await $fetch<any>(`${BASE}/pendingRecipients/${id}`).catch(() => null)
  if (!doc?.fields) return { pending: null, reviews: [] }
  const pending = { id, ...parseFields(doc.fields) }

  const reviewRes = await $fetch<any>(`${BASE}:runQuery`, {
    method: 'POST',
    body: {
      structuredQuery: {
        from: [{ collectionId: 'reviews' }],
        where: {
          fieldFilter: { field: { fieldPath: 'toUserId' }, op: 'EQUAL', value: { stringValue: id } },
        },
      },
    },
  }).catch(() => [])

  const reviews = reviewRes
    .filter((r: any) => r.document)
    .map((r: any) => ({ id: r.document.name.split('/').pop(), ...parseFields(r.document.fields) }))
    .sort((a: any, b: any) => {
      const ta = a.createdAt ? new Date(a.createdAt).getTime() : 0
      const tb = b.createdAt ? new Date(b.createdAt).getTime() : 0
      return tb - ta
    })

  return { pending, reviews }
})
