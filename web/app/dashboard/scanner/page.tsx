'use client'

import { useState, useEffect } from 'react'
import { Scan, RefreshCw, ExternalLink, Mail, Globe, ShieldAlert, CheckCircle2 } from 'lucide-react'
import { getScanResults, type ScanResult } from '@/lib/db'
import { supabase } from '@/lib/supabase'

export default function ScannerPage() {
  const [results, setResults] = useState<ScanResult[]>([])
  const [scanning, setScanning] = useState(false)
  const [loading, setLoading] = useState(true)

  const load = async () => {
    try {
      setLoading(true)
      const data = await getScanResults()
      setResults(data)
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  const handleScan = async () => {
    setScanning(true)
    try {
      const { error } = await supabase.functions.invoke('scan', {})
      if (error) {
        // If no edge function, just reload results
        console.warn('Scan function not available:', error)
      }
      // Wait a moment then reload
      setTimeout(async () => {
        await load()
        setScanning(false)
      }, 3000)
    } catch {
      setTimeout(async () => {
        await load()
        setScanning(false)
      }, 3000)
    }
  }

  return (
    <div className="p-6">
      <div className="mb-6 flex items-start justify-between gap-4">
        <div>
          <h1 className="text-lg font-medium text-primary">Image Scanner</h1>
          <p className="text-xs text-muted mt-0.5">
            Crawls pre-configured domains to find where your stamped images appear
          </p>
        </div>
        <button
          onClick={handleScan}
          disabled={scanning}
          className="btn-primary text-sm shrink-0 disabled:opacity-40"
        >
          {scanning ? (
            <><RefreshCw className="h-4 w-4 animate-spin" /> Scanning...</>
          ) : (
            <><Scan className="h-4 w-4" /> Scan Now</>
          )}
        </button>
      </div>

      {loading ? (
        <div className="surface flex items-center justify-center rounded-xl border border-subtle py-16">
          <RefreshCw className="h-5 w-5 animate-spin text-muted" />
        </div>
      ) : results.length === 0 ? (
        <div className="surface flex flex-col items-center justify-center rounded-xl border border-subtle py-16 gap-3">
          <ShieldAlert className="h-8 w-8 text-muted" />
          <p className="text-sm text-muted">No scan results yet</p>
          <p className="text-xs text-muted/60">Upload and stamp files, then run a scan to find matches.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {results.map((r) => (
            <div key={r.id} className="surface rounded-xl border border-subtle p-4">
              <div className="flex items-start gap-3">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-emerald-500/10">
                  <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-primary truncate">{r.matched_url}</span>
                    <a href={r.matched_url} target="_blank" rel="noopener noreferrer" className="text-muted hover:text-primary transition-colors shrink-0">
                      <ExternalLink className="h-3.5 w-3.5" />
                    </a>
                  </div>
                  <div className="mt-1 flex flex-wrap gap-x-4 gap-y-1 text-[11px] text-muted">
                    <span className="flex items-center gap-1">
                      <Globe className="h-3 w-3" />
                      {r.page_title || 'No title'}
                    </span>
                    {r.site_email && (
                      <span className="flex items-center gap-1">
                        <Mail className="h-3 w-3" />
                        {r.site_email}
                      </span>
                    )}
                    <span>Tracking: {r.tracking_id}</span>
                    <span>{new Date(r.detected_at).toLocaleDateString()}</span>
                  </div>
                  {r.impact_summary && (
                    <p className="mt-2 text-xs text-secondary leading-relaxed border-t border-subtle pt-2">
                      {r.impact_summary}
                    </p>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
