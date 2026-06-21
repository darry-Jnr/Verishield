import { config } from './config'
import { crawl } from './crawler'
import { downloadAndScan } from './scanner'
import { ask } from './ai'
import { lookupFileByTrackingId, recordMatch } from './db'

const IMPACT_PROMPT = `Given the information below, write a concise 2-3 sentence summary describing what was detected and how the asset is being used on the external site. Be factual — state what file was found, what page it appeared on, and what the site seems to be doing with it (e.g. selling a product, promoting a service, hosting content). Write like a reporter telling you what others are using this content for.

Asset: {file_name}
Found at: {source_url}
Page title: {page_title}
Contact email: {site_email}
Tracking ID: {tracking_id}`

async function generateImpactSummary(
  fileName: string,
  sourceUrl: string,
  pageTitle: string,
  siteEmail: string | null,
  trackingId: string,
): Promise<string> {
  try {
    const prompt = IMPACT_PROMPT
      .replace('{file_name}', fileName)
      .replace('{source_url}', sourceUrl)
      .replace('{page_title}', pageTitle || 'N/A')
      .replace('{site_email}', siteEmail || 'N/A')
      .replace('{tracking_id}', trackingId)
    return await ask(prompt)
  } catch (err) {
    console.warn('Failed to generate impact summary:', err)
    return ''
  }
}

export async function detectAll(): Promise<void> {
  const domains = config.preConfiguredDomains
  console.log(`Scanning ${domains.length} pre-configured domains`)

  for (const domain of domains) {
    try {
      const page = await crawl(domain)
      for (const imgUrl of page.images) {
        const trackingId = await downloadAndScan(imgUrl)
        if (!trackingId) continue

        const fileRecord = await lookupFileByTrackingId(trackingId)
        if (!fileRecord) {
          console.log(`No file found for tracking ID ${trackingId} — skipping`)
          continue
        }

        const impactSummary = await generateImpactSummary(
          fileRecord.name,
          domain,
          page.title,
          page.emails[0] || null,
          trackingId,
        )

        await recordMatch(fileRecord, {
          tracking_id: trackingId,
          source_url: domain,
          matched_image_url: imgUrl,
          page_title: page.title,
          site_email: page.emails[0] || null,
          impact_summary: impactSummary,
        })
      }
    } catch (err) {
      console.warn(`Error scanning ${domain}:`, err)
    }
  }

  console.log('Scan complete')
}
