'use client'

import { useState, useEffect } from 'react'
import { ExternalLink, Search, ChevronDown, ArrowUpDown } from 'lucide-react'
import Link from 'next/link'
import { getScanResults } from '@/lib/db'
import { useQuery } from '@tanstack/react-query'

function hostname(url: string) {
  try { return new URL(url).hostname.replace('www.', '') }
  catch { return url }
}

export default function AlertsPage() {
  const [sort, setSort] = useState<'newest' | 'oldest'>('newest')
  const [showSort, setShowSort] = useState(false)

  const { data: results = [], isLoading } = useQuery({
    queryKey: ['scan-results'],
    queryFn: getScanResults,
  })

  useEffect(() => {
    if (results.length > 0) {
      const maxId = Math.max(...results.map((r) => r.id))
      localStorage.setItem('lastSeenAlertId', String(maxId))
    }
  }, [results])

  const sorted = sort === 'newest'
    ? results
    : [...results].sort((a, b) => a.detected_at.localeCompare(b.detected_at))

  return (
    <div className="flex-1 min-h-0 flex flex-col">
      <div className="flex items-center justify-between px-4 sm:px-6 py-4 border-b border-subtle">
        <h1 className="text-lg font-semibold text-primary">Alerts</h1>
        <div className="relative">
          <button onClick={() => setShowSort(!showSort)} className="flex items-center gap-1.5 px-3 py-1.5 text-sm border border-subtle rounded-lg text-secondary hover:text-primary hover:border-border-grid transition-colors">
            <ArrowUpDown className="h-3.5 w-3.5" />
            {sort === 'newest' ? 'Newest' : 'Oldest'}
            <ChevronDown className="h-3 w-3" />
          </button>
          {showSort && (
            <>
              <div className="fixed inset-0 z-10" onClick={() => setShowSort(false)} />
              <div className="absolute right-0 mt-1.5 z-20 w-36 bg-elevated border border-subtle rounded-lg shadow-xl overflow-hidden">
                {(['newest', 'oldest'] as const).map((s) => (
                  <button key={s} onClick={() => { setSort(s); setShowSort(false) }} className={`w-full text-left px-3.5 py-2 text-sm transition-colors hover:bg-zinc-800 ${
                    sort === s ? 'text-primary' : 'text-secondary'
                  }`}>
                    {s === 'newest' ? 'Newest' : 'Oldest'}
                  </button>
                ))}
              </div>
            </>
          )}
        </div>
      </div>

      {isLoading ? (
        <div className="flex-1 overflow-auto p-4 sm:p-6">
          <div className="animate-pulse space-y-3">
            {[1,2,3,4].map(i => (
              <div key={i} className="flex items-center gap-3 border-b border-subtle py-3.5">
                <div className="h-4 w-4 rounded bg-zinc-800" />
                <div className="flex-1 space-y-1.5">
                  <div className="h-4 w-48 rounded bg-zinc-800" />
                  <div className="h-3 w-64 rounded bg-zinc-800/50" />
                </div>
                <div className="h-3 w-20 rounded bg-zinc-800/50" />
              </div>
            ))}
          </div>
        </div>
      ) : sorted.length === 0 ? (
        <div className="flex-1 flex items-center justify-center">
          <p className="text-secondary text-sm">No alerts yet. Run a scan from the dashboard.</p>
        </div>
      ) : (
        <>
          {/* Desktop table */}
          <div className="hidden sm:block flex-1 overflow-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-subtle text-muted text-xs uppercase tracking-wider">
                  <th className="text-left font-medium px-4 sm:px-6 py-3 w-[32%]">Page</th>
                  <th className="text-left font-medium px-3 py-3 w-[13%]">Domain</th>
                  <th className="text-left font-medium px-3 py-3 w-[30%]">Impact</th>
                  <th className="text-left font-medium px-3 py-3 w-[12%]">Date</th>
                  <th className="text-right font-medium px-3 py-3 w-[90px]"></th>
                </tr>
              </thead>
              <tbody>
                {sorted.map((r) => (
                  <tr key={r.id} className="border-b border-subtle hover:bg-zinc-900/50 transition-colors">
                    <td className="px-4 sm:px-6 py-3">
                      <div className="flex items-center gap-3">
                        <div className="h-9 w-9 shrink-0 rounded-lg bg-zinc-800 flex items-center justify-center">
                          <Search className="h-4 w-4 text-amber-500" />
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm text-primary font-medium truncate leading-tight">
                            {r.page_title || `Match on ${hostname(r.matched_url)}`}
                          </p>
                          <p className="text-[11px] text-muted mt-0.5">
                            Tracking: <code className="text-amber-400">{r.tracking_id}</code>
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-3 py-3">
                      <a href={r.matched_url} target="_blank" rel="noreferrer" className="text-secondary hover:text-primary transition-colors inline-flex items-center gap-1">
                        {hostname(r.matched_url)} <ExternalLink className="h-3 w-3 shrink-0" />
                      </a>
                    </td>
                    <td className="px-3 py-3">
                      <p className="text-sm text-body truncate max-w-[320px]">
                        {r.impact_summary || 'No summary available'}
                      </p>
                    </td>
                    <td className="px-3 py-3">
                      <span className="text-sm text-muted">{new Date(r.detected_at).toLocaleDateString()}</span>
                    </td>
                    <td className="px-3 py-3 text-right">
                      <Link
                        href={`/dashboard/alerts/${r.id}`}
                        className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium bg-white/10 text-primary rounded-md hover:bg-white/20 cursor-pointer transition-colors"
                      >
                        View
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile cards */}
          <div className="sm:hidden flex-1 overflow-auto space-y-2 px-4 py-3">
            {sorted.map((r) => (
              <div key={r.id} className="w-full text-left bg-elevated border border-subtle rounded-xl p-4 hover:bg-zinc-900/50 transition-colors">
                <div className="flex items-start gap-3 mb-3">
                  <div className="h-10 w-10 shrink-0 rounded-lg bg-zinc-800 flex items-center justify-center">
                    <Search className="h-5 w-5 text-amber-500" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-primary truncate">
                      {r.page_title || `Match on ${hostname(r.matched_url)}`}
                    </p>
                    <p className="text-xs text-muted mt-0.5">Tracking: <code className="text-amber-400">{r.tracking_id}</code></p>
                  </div>
                </div>
                <div className="mb-3">
                  <a href={r.matched_url} target="_blank" rel="noreferrer" className="text-secondary hover:text-primary transition-colors inline-flex items-center gap-1 text-xs">
                    {hostname(r.matched_url)} <ExternalLink className="h-3 w-3" />
                  </a>
                </div>
                <div className="text-xs mb-3">
                  <span className="text-muted">Impact</span>
                  <p className="text-body truncate mt-0.5">{r.impact_summary || 'No summary available'}</p>
                </div>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-muted text-xs">{new Date(r.detected_at).toLocaleDateString()}</span>
                </div>
                <Link href={`/dashboard/alerts/${r.id}`} className="block w-full text-center px-3 py-2 text-xs font-medium bg-white/10 text-primary rounded-md hover:bg-white/20 cursor-pointer transition-colors">
                  View Details
                </Link>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  )
}