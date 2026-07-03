import { GoogleGenerativeAI } from '@google/generative-ai'

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()
  const formData = await readFormData(event)
  const file = formData.get('file') as File
  if (!file) throw createError({ statusCode: 400, message: 'No file provided' })

  const buffer = Buffer.from(await file.arrayBuffer())
  const base64 = buffer.toString('base64')

  const genAI = new GoogleGenerativeAI(config.geminiApiKey)
  const model = genAI.getGenerativeModel({ model: 'gemini-1.5-pro' })

  const prompt = `
以下のPDF履歴書を解析して、JSONで返してください。
住所・電話番号・メールアドレスは含めないでください。

返却フォーマット（JSON only）:
{
  "summary": "自己PR文",
  "skills": ["スキル1", "スキル2"],
  "experience": [
    {
      "company": "会社名",
      "title": "役職",
      "startDate": "YYYY-MM",
      "endDate": "YYYY-MM",
      "description": "業務内容"
    }
  ],
  "education": [
    {
      "institution": "学校名",
      "degree": "学位",
      "field": "専攻",
      "startDate": "YYYY-MM",
      "endDate": "YYYY-MM"
    }
  ]
}
`

  const result = await model.generateContent([
    prompt,
    { inlineData: { mimeType: 'application/pdf', data: base64 } },
  ])

  const text = result.response.text()
  const json = text.replace(/```json\n?|\n?```/g, '').trim()
  return JSON.parse(json)
})
