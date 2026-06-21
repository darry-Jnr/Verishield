import { createClient } from '@supabase/supabase-js'
import { config } from './config'

function getClient() {
  if (!config.supabaseServiceKey) throw new Error('SUPABASE_SERVICE_KEY not set')
  return createClient(config.supabaseUrl, config.supabaseServiceKey)
}

export interface FileRecord {
  id: number
  name: string
  user_id: string
}

export async function lookupFileByTrackingId(
  trackingId: string,
): Promise<FileRecord | null> {
  const client = getClient()
  const resp = await client
    .from('files')
    .select('id, name, user_id')
    .eq('tracking_id', trackingId)
    .maybeSingle()
  return resp.data as FileRecord | null
}

export interface ScanResultRecord {
  tracking_id: string
  file_id: number
  user_id: string
  matched_url: string
  matched_image_url: string
  page_title: string
  site_email: string | null
  impact_summary: string
  detected_at: string
}

export async function recordMatch(
  fileRecord: FileRecord,
  match: {
    tracking_id: string
    source_url: string
    matched_image_url: string
    page_title: string
    site_email: string | null
    impact_summary: string
  },
): Promise<void> {
  const client = getClient()

  const existing = await client
    .from('scan_results')
    .select('id')
    .eq('tracking_id', match.tracking_id)
    .eq('matched_url', match.source_url)
    .maybeSingle()

  if (existing.data) {
    console.log(
      `Match already recorded for ${match.tracking_id} on ${match.source_url}`,
    )
    return
  }

  const record: ScanResultRecord = {
    tracking_id: match.tracking_id,
    file_id: fileRecord.id,
    user_id: fileRecord.user_id,
    matched_url: match.source_url,
    matched_image_url: match.matched_image_url,
    page_title: match.page_title,
    site_email: match.site_email,
    impact_summary: match.impact_summary,
    detected_at: new Date().toISOString(),
  }

  await client.from('scan_results').insert(record)
  console.log(
    `Recorded match: ${match.tracking_id} on ${match.source_url}`,
  )
}
