'use client'

import { useState, useMemo } from 'react'
import { ExternalLink, Image, ChevronDown, ArrowUpDown, Folder, Film, FileText } from 'lucide-react'
import Link from 'next/link'
import { alerts, type AlertData } from '@/lib/alerts-data'

const typeIcon: Record<string, typeof Image> = { image: Image, video: Film, document: FileText }

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

  const severityBadge = (s: AlertData['severity']) => {
    const styles = {
      critical: 'bg-red-500/10 text-red-500 border-red-500/20',
      warning: 'bg-orange-500/10 text-orange-500 border-orange-500/20',
      safe: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20',
    }
    return (
      <span className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[11px] font-medium ${styles[s]}`}>
        <span className={`h-1.5 w-1.5 rounded-full ${
          s === 'critical' ? 'bg-red-500' : s === 'warning' ? 'bg-orange-500' : 'bg-emerald-500'
        }`} />
        {s.charAt(0).toUpperCase() + s.slice(1)}
      </span>
    )
  }

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
              <th className="text-left font-medium px-4 sm:px-6 py-3 w-[32%]">File</th>
              <th className="text-left font-medium px-3 py-3 w-[13%]">Domain</th>
              <th className="text-left font-medium px-3 py-3 w-[25%]">Impact</th>
              <th className="text-left font-medium px-3 py-3 w-[12%]">Date</th>
              <th className="text-center font-medium px-3 py-3 w-[10%]">Status</th>
              <th className="text-right font-medium px-3 py-3 w-[90px]"></th>
            </tr>
          </thead>
          <tbody>
            {sorted.map((a, i) => {
              const Icon = typeIcon[a.type] || Image
              return (
                <tr key={i} className="border-b border-subtle hover:bg-zinc-900/50 transition-colors">
                  <td className="px-4 sm:px-6 py-3">
                    <div className="flex items-center gap-3">
                      <div className={`h-9 w-9 shrink-0 rounded-lg bg-gradient-to-br ${a.thumb} flex items-center justify-center`}>
                        <Icon className="h-4 w-4 text-white/60" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm text-primary font-medium truncate leading-tight">{a.asset}</p>
                        <Link
                          href={`/dashboard/assets/${a.folderId}`}
                          className="inline-flex items-center gap-1 text-[11px] text-muted hover:text-primary transition-colors mt-0.5"
                        >
                          <Folder className="h-3 w-3" />
                          {a.folderName}
                        </Link>
                      </div>
                    </div>
                  </td>
                  <td className="px-3 py-3">
                    <a href={`https://${a.domain}`} target="_blank" rel="noreferrer" className="text-secondary hover:text-primary transition-colors inline-flex items-center gap-1">
                      {a.domain} <ExternalLink className="h-3 w-3 shrink-0" />
                    </a>
                  </td>
                  <td className="px-3 py-3">
                    <p className="text-sm text-body truncate max-w-[280px]">{a.impact}</p>
                  </td>
                  <td className="px-3 py-3">
                    <span className="text-sm text-muted">{a.date}</span>
                  </td>
                  <td className="px-3 py-3 text-center">
                    {severityBadge(a.severity)}
                  </td>
                  <td className="px-3 py-3 text-right">
                    <Link
                      href={`/dashboard/alerts/${i}`}
                      className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium bg-white/10 text-primary rounded-md hover:bg-white/20 cursor-pointer transition-colors"
                    >
                      View
                    </Link>
                  </td>
                </tr>
              )
            })}
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
        {sorted.map((a, i) => {
          const Icon = typeIcon[a.type] || Image
          return (
            <div key={i} className="w-full text-left bg-elevated border border-subtle rounded-xl p-4 hover:bg-zinc-900/50 transition-colors">
              <div className="flex items-start gap-3 mb-3">
                <div className={`h-10 w-10 shrink-0 rounded-lg bg-gradient-to-br ${a.thumb} flex items-center justify-center`}>
                  <Icon className="h-5 w-5 text-white/60" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-primary truncate">{a.asset}</p>
                  <Link
                    href={`/dashboard/assets/${a.folderId}`}
                    className="inline-flex items-center gap-1 text-xs text-muted hover:text-primary transition-colors mt-0.5"
                  >
                    <Folder className="h-3 w-3" />
                    {a.folderName}
                  </Link>
                </div>
              </div>
              <div className="mb-3">
                <a href={`https://${a.domain}`} target="_blank" rel="noreferrer" className="text-secondary hover:text-primary transition-colors inline-flex items-center gap-1 text-xs">
                  {a.domain} <ExternalLink className="h-3 w-3" />
                </a>
              </div>
              <div className="text-xs mb-3">
                <span className="text-muted">Impact</span>
                <p className="text-body truncate mt-0.5">{a.impact}</p>
              </div>
              <div className="flex items-center justify-between mb-3">
                <span className="text-muted text-xs">{a.date}</span>
                {severityBadge(a.severity)}
              </div>
              <Link href={`/dashboard/alerts/${i}`} className="block w-full text-center px-3 py-2 text-xs font-medium bg-white/10 text-primary rounded-md hover:bg-white/20 cursor-pointer transition-colors">
                View Details
              </Link>
            </div>
          )
        })}
        {sorted.length === 0 && (
          <div className="flex items-center justify-center py-12">
            <p className="text-secondary text-sm">No alerts match these filters.</p>
          </div>
        )}
      </div>
    </div>
  )
}
