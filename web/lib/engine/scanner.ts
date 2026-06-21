import exifReader from 'exifreader'

const TRACKING_RE = /AURAGUARD_TRACKING_ID=([\w-]+)/
const IMAGE_EXTS = ['.jpg', '.jpeg', '.png', '.webp', '.gif']

function hasImageExt(url: string): boolean {
  const lower = url.toLowerCase()
  return IMAGE_EXTS.some(e => lower.includes(e))
}

function parseTrackingId(text: string): string | null {
  const match = TRACKING_RE.exec(text)
  return match ? match[1] : null
}

export async function scanBuffer(buffer: ArrayBuffer): Promise<string | null> {
  try {
    const tags = exifReader.load(buffer)
    const userComment = (tags as any)['UserComment']?.value
    if (!userComment) return null
    return parseTrackingId(String(userComment))
  } catch {
    return null
  }
}

export async function downloadAndScan(imgUrl: string): Promise<string | null> {
  if (!hasImageExt(imgUrl)) return null
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), 10_000)
  try {
    const resp = await fetch(imgUrl, { signal: controller.signal })
    if (!resp.ok) return null
    const buffer = await resp.arrayBuffer()
    return scanBuffer(buffer)
  } catch {
    return null
  } finally {
    clearTimeout(timer)
  }
}
