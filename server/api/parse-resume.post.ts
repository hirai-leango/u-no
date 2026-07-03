import { VertexAI } from '@google-cloud/vertexai'

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()
  const formData = await readFormData(event)
  const file = formData.get('file') as File
  if (!file) throw createError({ statusCode: 400, message: 'No file provided' })

  const buffer = Buffer.from(await file.arrayBuffer())
  const base64 = buffer.toString('base64')

  const vertexAI = new VertexAI({
    project: config.vertexProjectId,
    location: config.vertexLocation,
  })
  const model = vertexAI.getGenerativeModel({ model: 'gemini-1.5-pro' })

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

  const result = await model.generateContent({
    contents: [{
      role: 'user',
      parts: [
        { text: prompt },
        { inlineData: { mimeType: 'application/pdf', data: base64 } },
      ],
    }],
    generationConfig: { responseMimeType: 'application/json' },
  })

  const text = result.response.candidates?.[0]?.content?.parts?.[0]?.text ?? '{}'
  return JSON.parse(text)
})
