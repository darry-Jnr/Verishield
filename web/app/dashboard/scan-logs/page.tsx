'use client'

import { Search } from 'lucide-react'
import Link from 'next/link'
import { getScanResults } from '@/lib/db'
import { useQuery } from '@tanstack/react-query'

export default function ScanLogsPage() {
  const { data: results = [], isLoading: loading } = useQuery({
    queryKey: ['scan-results'],
    queryFn: getScanResults,
  })

  return (
    <div className="p-4 sm:p-8">
      <div className="mb-6 sm:mb-8 flex items-center gap-3">
        <Link href="/dashboard" className="text-muted hover:text-primary transition-colors text-sm">&larr; Dashboard</Link>
        <h1 className="text-primary text-xl sm:text-2xl font-medium">Scan Logs</h1>
      </div>

      <div className="surface rounded-xl border border-subtle">
        <div className="flex items-center justify-between border-b border-subtle px-4 sm:px-5 py-3">
          <div className="flex items-center gap-2">
            <h2 className="text-primary text-sm font-medium">All Scans</h2>
            {results.length > 0 && (
              <span className="flex h-5 items-center rounded-full bg-amber-500/10 px-2 text-[11px] font-medium text-amber-500">
                {results.length} {results.length === 1 ? 'match' : 'matches'}
              </span>
            )}
          </div>
        </div>

        {loading ? (
          <div className="animate-pulse">
            {[1,2,3,4].map(i => (
              <div key={i} className="flex items-start gap-3 border-b border-subtle px-4 sm:px-5 py-3.5 last:border-0">
                <div className="h-4 w-4 shrink-0 mt-0.5 rounded bg-zinc-800" />
                <div className="min-w-0 flex-1 space-y-1.5">
                  <div className="h-4 w-48 rounded bg-zinc-800" />
                  <div className="h-3 w-64 rounded bg-zinc-800/50" />
                  <div className="h-3 w-36 rounded bg-zinc-800/50" />
                </div>
                <div className="h-3 w-20 rounded bg-zinc-800/50 shrink-0" />
              </div>
            ))}
          </div>
        ) : results.length === 0 ? (
          <div className="px-4 sm:px-5 py-8 text-center">
            <p className="text-muted text-xs">No scan results yet. Run a scan from the dashboard.</p>
          </div>
        ) : (
          results.map((r) => (
            <div key={r.id} className="border-b border-subtle px-4 sm:px-5 py-3.5 last:border-0">
              <div className="flex items-start gap-3">
                <Search className="h-4 w-4 text-amber-500 shrink-0 mt-0.5" />
                <div className="min-w-0 flex-1">
                  <p className="text-primary text-sm truncate">
                    {r.matched_url ? new URL(r.matched_url).hostname : 'Unknown'}
                  </p>
                  <p className="text-muted text-xs truncate mt-0.5">{r.matched_url}</p>
                  {r.tracking_id && (
                    <p className="text-muted text-xs mt-0.5">Tracking: <code className="text-amber-400">{r.tracking_id}</code></p>
                  )}
                </div>
                <span className="text-muted text-xs shrink-0">
                  {new Date(r.detected_at).toLocaleString()}
                </span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
