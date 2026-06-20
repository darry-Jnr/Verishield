'use client'

import { useState, useMemo } from 'react'
import { ExternalLink, Image, ChevronDown, ArrowUpDown } from 'lucide-react'
import Link from 'next/link'
import { alerts } from '@/lib/alerts-data'

export default function AlertsPage() {
  const [sort, setSort] = useState<'newest' | 'oldest' | 'severe'>('newest')
  const [showSort, setShowSort] = useState(false)

  const sorted = useMemo(() => {
    const copy = [...alerts]
    if (sort === 'newest') return copy.sort((a, b) => b.date.localeCompare(a.date))
    if (sort === 'oldest') return copy.sort((a, b) => a.date.localeCompare(b.date))
    const order = { critical: 0, warning: 1, safe: 2 }
    return copy.sort((a, b) => order[a.severity] - order[b.severity])
  }, [sort])

  return (
    <div className="flex-1 min-h-0 flex flex-col">
      <div className="flex items-center justify-between px-4 sm:px-6 py-4 border-b border-subtle">
        <h1 className="text-lg font-semibold text-primary">Alerts</h1>
        <div className="relative">
          <button onClick={() => setShowSort(!showSort)} className="flex items-center gap-1.5 px-3 py-1.5 text-sm border border-subtle rounded-lg text-secondary hover:text-primary hover:border-border-grid transition-colors">
            <ArrowUpDown className="h-3.5 w-3.5" />
            {sort === 'newest' ? 'Newest' : sort === 'oldest' ? 'Oldest' : 'Most Severe'}
            <ChevronDown className="h-3 w-3" />
          </button>
          {showSort && (
            <>
              <div className="fixed inset-0 z-10" onClick={() => setShowSort(false)} />
              <div className="absolute right-0 mt-1.5 z-20 w-36 bg-elevated border border-subtle rounded-lg shadow-xl overflow-hidden">
                {(['newest', 'oldest', 'severe'] as const).map((s) => (
                  <button key={s} onClick={() => { setSort(s); setShowSort(false) }} className={`w-full text-left px-3.5 py-2 text-sm transition-colors hover:bg-zinc-800 ${
                    sort === s ? 'text-primary' : 'text-secondary'
                  }`}>
                    {s === 'newest' ? 'Newest' : s === 'oldest' ? 'Oldest' : 'Most Severe'}
                  </button>
                ))}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Desktop table */}
      <div className="hidden sm:block flex-1 overflow-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-subtle text-muted text-xs uppercase tracking-wider">
              <th className="text-left font-medium px-4 sm:px-6 py-3 w-[35%]">Asset</th>
              <th className="text-right font-medium px-3 py-3 w-[13%]">Domain</th>
              <th className="text-center font-medium px-3 py-3 w-[22%]">Impact</th>
              <th className="text-center font-medium px-3 py-3 w-[15%]">Reach</th>
              <th className="text-left font-medium px-3 py-3 w-auto">Date</th>
              <th className="text-right font-medium px-3 py-3 w-[100px]"></th>
            </tr>
          </thead>
          <tbody>
            {sorted.map((a, i) => (
              <tr key={i} className="border-b border-subtle hover:bg-zinc-900/50 transition-colors">
                <td className="px-4 sm:px-6 py-3.5">
                  <div className="flex items-center gap-3">
                    <div className={`h-9 w-9 rounded-lg bg-gradient-to-br ${a.thumb} flex items-center justify-center shrink-0`}>
                      <Image className="h-4 w-4 text-white/60" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm text-primary font-medium truncate">{a.asset}</p>
                      <p className="text-xs text-muted capitalize">{a.type} · {a.status.replace('-', ' ')}</p>
                    </div>
                  </div>
                </td>
                <td className="px-3 py-3.5 text-right">
                  <a href={`https://${a.domain}`} target="_blank" rel="noreferrer" className="text-secondary hover:text-primary transition-colors inline-flex items-center gap-1 justify-end">
                    {a.domain} <ExternalLink className="h-3 w-3" />
                  </a>
                </td>
                <td className="px-3 py-3.5 text-center text-sm text-body">{a.impact}</td>
                <td className="px-3 py-3.5 text-center text-sm text-secondary">{a.impressions}</td>
                <td className="px-3 py-3.5 text-left text-sm text-muted">{a.date}</td>
                <td className="px-3 py-3.5 text-right">
                  <Link href={`/dashboard/alerts/${i}`} className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium bg-white/10 text-primary rounded-md hover:bg-white/20 cursor-pointer transition-colors">
                    View Details
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {sorted.length === 0 && (
          <div className="flex items-center justify-center py-12">
            <p className="text-secondary text-sm">No alerts match these filters.</p>
          </div>
        )}
      </div>

      {/* Mobile cards */}
      <div className="sm:hidden flex-1 overflow-auto space-y-2 px-4 py-3">
        {sorted.map((a, i) => (
          <div key={i} className="w-full text-left bg-elevated border border-subtle rounded-xl p-4 hover:bg-zinc-900/50 transition-colors">
            <div className="flex items-start gap-3 mb-3">
              <div className={`h-10 w-10 rounded-lg bg-gradient-to-br ${a.thumb} flex items-center justify-center shrink-0`}>
                <Image className="h-5 w-5 text-white/60" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-primary truncate">{a.asset}</p>
                <p className="text-xs text-muted">{a.domain}</p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2 text-xs mb-3">
              <div>
                <span className="text-muted">Impact</span>
                <p className="text-body truncate">{a.impact}</p>
              </div>
              <div>
                <span className="text-muted">Reach</span>
                <p className="text-secondary">{a.impressions}</p>
              </div>
            </div>
            <div className="text-xs mb-3">
              <span className="text-muted">Date</span>
              <p className="text-secondary mt-0.5">{a.date}</p>
            </div>
            <Link href={`/dashboard/alerts/${i}`} className="block w-full text-center px-3 py-2 text-xs font-medium bg-white/10 text-primary rounded-md hover:bg-white/20 cursor-pointer transition-colors">
              View Details
            </Link>
          </div>
        ))}
        {sorted.length === 0 && (
          <div className="flex items-center justify-center py-12">
            <p className="text-secondary text-sm">No alerts match these filters.</p>
          </div>
        )}
      </div>


    </div>
  )
}
