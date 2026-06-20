'use client'

import { useState, useMemo } from 'react'
import { Upload, Image, Film, FileText, LayoutGrid, List, MoreHorizontal, ChevronDown, ArrowUpDown } from 'lucide-react'

const assets = [
  { name: 'Summer Collection — Hero Shot', type: 'image', date: '2026-06-18', matches: 4, status: 'active', thumb: 'from-rose-500/20 to-orange-500/20' },
  { name: 'Product Video — 30s Ad', type: 'video', date: '2026-06-17', matches: 2, status: 'active', thumb: 'from-blue-500/20 to-cyan-500/20' },
  { name: 'Lookbook Page 1-5', type: 'document', date: '2026-06-15', matches: 0, status: 'active', thumb: 'from-violet-500/20 to-purple-500/20' },
  { name: 'Holiday Campaign — Banner', type: 'image', date: '2026-06-12', matches: 6, status: 'active', thumb: 'from-emerald-500/20 to-teal-500/20' },
  { name: 'Influencer Collateral Pack', type: 'image', date: '2026-06-10', matches: 1, status: 'active', thumb: 'from-amber-500/20 to-yellow-500/20' },
  { name: 'Spring Line — Detail Shots', type: 'image', date: '2026-06-08', matches: 3, status: 'archived', thumb: 'from-pink-500/20 to-red-500/20' },
]

const typeIcon = { image: Image, video: Film, document: FileText }

const statusPills = ['All', 'Active', 'Archived'] as const
const sortOptions = ['Recent', 'Oldest', 'Most Matches'] as const

export default function AssetsPage() {
  const [view, setView] = useState<'grid' | 'list'>('grid')
  const [statusFilter, setStatusFilter] = useState<'All' | 'Active' | 'Archived'>('All')
  const [sort, setSort] = useState<'Recent' | 'Oldest' | 'Most Matches'>('Recent')
  const [yearFilter, setYearFilter] = useState('All')

  const filtered = useMemo(() => {
    let result = [...assets]

    if (statusFilter !== 'All') {
      result = result.filter((a) => a.status === statusFilter.toLowerCase())
    }

    if (yearFilter !== 'All') {
      result = result.filter((a) => a.date.startsWith(yearFilter))
    }

    result.sort((a, b) => {
      if (sort === 'Recent') return new Date(b.date).getTime() - new Date(a.date).getTime()
      if (sort === 'Oldest') return new Date(a.date).getTime() - new Date(b.date).getTime()
      return b.matches - a.matches
    })

    return result
  }, [statusFilter, yearFilter, sort])

  return (
    <div className="p-4 sm:p-8">
      {/* Title + Upload */}
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-primary text-xl sm:text-2xl font-medium">Assets</h1>
          <p className="text-secondary mt-1 text-sm">Your registered product media.</p>
        </div>
        <button className="btn-primary self-start text-sm">
          <Upload className="h-4 w-4" />
          Upload Asset
        </button>
      </div>

      {/* Filters bar */}
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap items-center gap-2">
          {/* Status pills */}
          <div className="elevated flex items-center gap-1 rounded-lg border border-subtle p-1">
            {statusPills.map((p) => (
              <button
                key={p}
                onClick={() => setStatusFilter(p)}
                className={`rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${
                  statusFilter === p ? 'bg-zinc-800 text-primary' : 'text-muted hover:text-secondary'
                }`}
              >
                {p}
              </button>
            ))}
          </div>

          {/* Year filter */}
          <div className="elevated relative flex items-center gap-1.5 rounded-lg border border-subtle px-3 py-1.5 text-xs text-muted cursor-pointer hover:text-secondary transition-colors">
            <select
              value={yearFilter}
              onChange={(e) => setYearFilter(e.target.value)}
              className="appearance-none bg-transparent pr-4 text-xs text-secondary outline-none cursor-pointer"
            >
              <option value="All">All Years</option>
              <option value="2026">2026</option>
              <option value="2025">2025</option>
            </select>
            <ChevronDown className="pointer-events-none absolute right-2 h-3 w-3" />
          </div>

          {/* Sort */}
          <div className="elevated relative flex items-center gap-1.5 rounded-lg border border-subtle px-3 py-1.5 text-xs text-muted cursor-pointer hover:text-secondary transition-colors">
            <ArrowUpDown className="h-3 w-3" />
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value as typeof sort)}
              className="appearance-none bg-transparent pr-4 text-xs text-secondary outline-none cursor-pointer"
            >
              {sortOptions.map((o) => (
                <option key={o} value={o}>{o}</option>
              ))}
            </select>
            <ChevronDown className="pointer-events-none absolute right-2 h-3 w-3" />
          </div>
        </div>

        {/* View toggle */}
        <div className="elevated flex items-center gap-0.5 self-start rounded-lg border border-subtle p-0.5">
          <button
            onClick={() => setView('grid')}
            className={`rounded-md p-1.5 transition-colors ${view === 'grid' ? 'bg-zinc-800 text-primary' : 'text-muted hover:text-secondary'}`}
          >
            <LayoutGrid className="h-4 w-4" />
          </button>
          <button
            onClick={() => setView('list')}
            className={`rounded-md p-1.5 transition-colors ${view === 'list' ? 'bg-zinc-800 text-primary' : 'text-muted hover:text-secondary'}`}
          >
            <List className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Empty state */}
      {filtered.length === 0 && (
        <div className="surface flex flex-col items-center justify-center rounded-xl border border-subtle py-16">
          <p className="text-secondary text-sm">No assets match these filters.</p>
        </div>
      )}

      {/* Grid view */}
      {view === 'grid' && filtered.length > 0 && (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {filtered.map((a) => {
            const Icon = typeIcon[a.type as keyof typeof typeIcon]
            return (
              <div key={a.name} className="surface group rounded-xl border border-subtle overflow-hidden transition-colors hover:border-zinc-700">
                <div className={`flex aspect-[4/3] items-center justify-center bg-gradient-to-br ${a.thumb}`}>
                  <div className="elevated flex h-12 w-12 items-center justify-center rounded-xl opacity-80">
                    <Icon className="h-6 w-6 text-primary" />
                  </div>
                </div>
                <div className="p-3 sm:p-4">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className="text-primary text-sm font-medium truncate">{a.name}</p>
                      <p className="text-muted text-xs mt-0.5 capitalize">{a.type} · {a.matches} matches</p>
                    </div>
                    <span className={`shrink-0 rounded-full px-2 py-0.5 text-[11px] font-medium ${
                      a.status === 'active' ? 'text-emerald-500 bg-emerald-500/10' : 'text-muted bg-zinc-800'
                    }`}>{a.status}</span>
                  </div>
                  <div className="mt-3 flex items-center justify-between">
                    <span className="text-muted text-xs">{a.date}</span>
                    <button className="text-muted hover:text-primary opacity-0 group-hover:opacity-100 transition-all">
                      <MoreHorizontal className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* List view */}
      {view === 'list' && filtered.length > 0 && (
        <>
          <div className="space-y-3 sm:hidden">
            {filtered.map((a) => {
              const Icon = typeIcon[a.type as keyof typeof typeIcon]
              return (
                <div key={a.name} className="surface rounded-xl border border-subtle p-4">
                  <div className="flex items-start gap-3">
                    <div className="elevated flex h-9 w-9 shrink-0 items-center justify-center rounded-lg">
                      <Icon className="h-4 w-4 text-secondary" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-primary text-sm truncate">{a.name}</p>
                      <p className="text-muted text-xs mt-0.5">
                        {a.type} · {a.matches} matches · {a.date}
                      </p>
                    </div>
                    <span className={`shrink-0 self-start rounded-full px-2 py-0.5 text-[11px] font-medium ${
                      a.status === 'active' ? 'text-emerald-500 bg-emerald-500/10' : 'text-muted bg-zinc-800'
                    }`}>{a.status}</span>
                  </div>
                </div>
              )
            })}
          </div>

          <div className="hidden sm:block surface rounded-xl border border-subtle overflow-x-auto">
            <div className="grid grid-cols-[1fr_100px_100px_120px] gap-4 border-b border-subtle px-5 py-3 text-xs text-muted min-w-[500px]">
              <span>Asset</span>
              <span className="text-center">Matches</span>
              <span className="text-center">Status</span>
              <span className="text-right">Date</span>
            </div>
            {filtered.map((a) => {
              const Icon = typeIcon[a.type as keyof typeof typeIcon]
              return (
                <div key={a.name} className="grid grid-cols-[1fr_100px_100px_120px] gap-4 border-b border-subtle px-5 py-3.5 last:border-0 items-center min-w-[500px]">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="elevated flex h-9 w-9 shrink-0 items-center justify-center rounded-lg">
                      <Icon className="h-4 w-4 text-secondary" />
                    </div>
                    <p className="text-primary text-sm truncate">{a.name}</p>
                  </div>
                  <span className="text-secondary text-sm text-center">{a.matches}</span>
                  <span className={`text-center text-xs font-medium ${
                    a.status === 'active' ? 'text-emerald-500' : 'text-muted'
                  }`}>{a.status}</span>
                  <span className="text-muted text-xs text-right">{a.date}</span>
                </div>
              )
            })}
          </div>
        </>
      )}
    </div>
  )
}
