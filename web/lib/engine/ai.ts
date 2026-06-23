import { config } from './config'

const GROQ_API = 'https://api.groq.com/openai/v1/chat/completions'

export async function ask(
  prompt: string,
  _systemInstruction?: string,
): Promise<string> {
  if (!config.groqApiKey) throw new Error('GROQ_API_KEY not set')
  const res = await fetch(GROQ_API, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${config.groqApiKey}`,
    },
    body: JSON.stringify({
      model: 'llama-3.3-70b-versatile',
      messages: [
        ...(_systemInstruction
          ? [{ role: 'system', content: _systemInstruction }]
          : []),
        { role: 'user', content: prompt },
      ],
    }),
  })
  if (!res.ok) {
    const text = await res.text()
    throw new Error(`Groq API ${res.status}: ${text}`)
  }
  const data = await res.json()
  return data.choices?.[0]?.message?.content || ''
}
