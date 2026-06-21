import { GoogleGenerativeAI } from '@google/generative-ai'
import { config } from './config'

let model: ReturnType<GoogleGenerativeAI['getGenerativeModel']> | null = null

function getModel() {
  if (!model) {
    if (!config.geminiApiKey) throw new Error('GEMINI_API_KEY not set')
    const genAI = new GoogleGenerativeAI(config.geminiApiKey)
    model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' })
    console.log('Initialized gemini-1.5-flash')
  }
  return model
}

export async function ask(
  prompt: string,
  systemInstruction?: string,
): Promise<string> {
  const m = getModel()
  const result = await m.generateContent({
    contents: [{ role: 'user', parts: [{ text: prompt }] }],
    systemInstruction: systemInstruction
      ? { role: 'user', parts: [{ text: systemInstruction }] }
      : undefined,
  })
  return result.response.text()
}
