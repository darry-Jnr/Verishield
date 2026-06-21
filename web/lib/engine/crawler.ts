import * as cheerio from 'cheerio'

const EMAIL_RE = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g
const TIMEOUT_MS = 15_000

export interface CrawlResult {
  images: string[]
  emails: string[]
  title: string
  description: string
}

function resolveUrl(src: string, baseUrl: string): string | null {
  if (!src || src.startsWith('data:')) return null
  try {
    return new URL(src, baseUrl).href
  } catch {
    return null
  }
}

export async function crawl(url: string): Promise<CrawlResult> {
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS)
  try {
    const resp = await fetch(url, {
      signal: controller.signal,
      headers: { 'User-Agent': 'AuraGuard/1.0' },
    })
    if (!resp.ok) {
      console.warn(`Failed to fetch ${url}: ${resp.status}`)
      return { images: [], emails: [], title: '', description: '' }
    }
    const html = await resp.text()
    const $ = cheerio.load(html)

    const images: string[] = []
    $('img').each((_, el) => {
      const src = $(el).attr('src') || $(el).attr('data-src') || ''
      if (src) {
        const resolved = resolveUrl(src, url)
        if (resolved) images.push(resolved)
      }
    })

    const emails = new Set<string>()
    $('a[href]').each((_, el) => {
      const href = $(el).attr('href') || ''
      if (href.startsWith('mailto:')) {
        emails.add(href.slice(7).split('?')[0])
      }
    })
    for (const match of html.matchAll(EMAIL_RE)) {
      emails.add(match[0].toLowerCase())
    }

    const title = $('title').first().text().trim()
    const desc = $('meta[name="description"]').attr('content')
      || $('meta[property="og:description"]').attr('content')
      || ''

    console.log(`Crawled ${url} — ${images.length} images, ${emails.size} emails`)
    return { images, emails: [...emails], title, description: desc }
  } catch (err: any) {
    console.warn(`Failed to fetch ${url}: ${err.message}`)
    return { images: [], emails: [], title: '', description: '' }
  } finally {
    clearTimeout(timer)
  }
}
