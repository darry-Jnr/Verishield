'use client'

import { useState, useEffect, useMemo, useCallback } from 'react'
import Link from 'next/link'
import { LayoutGrid, List, ChevronDown, ArrowUpDown, FolderPlus } from 'lucide-react'
import CreateFolderModal from '@/components/modal/create-folder'
import { getFolders, type Folder } from '@/lib/db'

const statusPills = ['All', 'Active', 'Archived'] as const
const sortOptions = ['Recent', 'Oldest'] as const

export default function AssetsPage() {
  const [view, setView] = useState<'grid' | 'list'>('grid')
  const [statusFilter, setStatusFilter] = useState<'All' | 'Active' | 'Archived'>('All')
  const [sort, setSort] = useState<'Recent' | 'Oldest'>('Recent')
  const [yearFilter, setYearFilter] = useState('All')
  const [showCreate, setShowCreate] = useState(false)
  const [folders, setFolders] = useState<Folder[]>([])

  const load = useCallback(async () => {
    try {
      const data = await getFolders()
      setFolders(data)
    } catch (e) {
      console.error(e)
    }
  }, [])

  useEffect(() => { load() }, [load])

  const filtered = useMemo(() => {
    let result = [...folders]

    if (statusFilter !== 'All') {
      result = result.filter((f) => f.status === statusFilter.toLowerCase())
    }

    if (yearFilter !== 'All') {
      result = result.filter((f) => f.date.startsWith(yearFilter))
    }

    result.sort((a, b) => {
      if (sort === 'Recent') return new Date(b.date).getTime() - new Date(a.date).getTime()
      return new Date(a.date).getTime() - new Date(b.date).getTime()
    })

    return result
  }, [folders, statusFilter, yearFilter, sort])

  return (
    <div className="p-4 sm:p-8">
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-primary text-xl sm:text-2xl font-medium">Assets</h1>
          <p className="text-secondary mt-1 text-sm">Your registered product media.</p>
        </div>
        <button onClick={() => setShowCreate(true)} className="btn-primary self-start text-sm">
          <FolderPlus className="h-4 w-4" />
          Create Folder
        </button>
      </div>

      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap items-center gap-2">
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

      {filtered.length === 0 && (
        <div className="surface flex flex-col items-center justify-center rounded-xl border border-subtle py-20 gap-4">
          {folders.length === 0 ? (
            <>
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-zinc-800/50 border border-subtle">
                <FolderPlus className="h-8 w-8 text-muted" />
              </div>
              <div className="text-center">
                <p className="text-primary text-sm font-medium">No assets yet</p>
                <p className="text-muted text-xs mt-1">Create your first folder to get started.</p>
              </div>
              <button onClick={() => setShowCreate(true)} className="btn-primary text-sm mt-2">
                <FolderPlus className="h-4 w-4" />
                Create Folder
              </button>
            </>
          ) : (
            <>
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-zinc-800/50 border border-subtle">
                <LayoutGrid className="h-6 w-6 text-muted" />
              </div>
              <p className="text-secondary text-sm">No assets match these filters.</p>
            </>
          )}
        </div>
      )}

      {view === 'grid' && filtered.length > 0 && (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {filtered.map((f) => (
            <Link key={f.id} href={`/dashboard/assets/${f.id}`} className="surface group rounded-xl border border-subtle overflow-hidden transition-colors hover:border-zinc-700 block">
              <div className={`flex aspect-[4/3] items-center justify-center bg-gradient-to-br ${f.thumb}`}>
                <div className="elevated flex h-12 w-12 items-center justify-center rounded-xl opacity-80">
                  <svg className="h-6 w-6 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12.75V12A2.25 2.25 0 014.5 9.75h15A2.25 2.25 0 0121.75 12v.75m-8.69-6.44l-2.12-2.12a1.5 1.5 0 00-1.061-.44H4.5A2.25 2.25 0 002.25 6v12a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9a2.25 2.25 0 00-2.25-2.25h-5.379a1.5 1.5 0 01-1.06-.44z" />
                  </svg>
                </div>
              </div>
              <div className="p-3 sm:p-4">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="text-primary text-sm font-medium truncate">{f.name}</p>
                  </div>
                  <span className={`shrink-0 rounded-full px-2 py-0.5 text-[11px] font-medium ${
                    f.status === 'active' ? 'text-emerald-500 bg-emerald-500/10' : 'text-muted bg-zinc-800'
                  }`}>{f.status}</span>
                </div>
                <div className="mt-3 flex items-center justify-between">
                  <span className="text-muted text-xs">{f.date}</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}

      {view === 'list' && filtered.length > 0 && (
        <>
          <div className="space-y-3 sm:hidden">
            {filtered.map((f) => (
              <Link key={f.id} href={`/dashboard/assets/${f.id}`} className="surface rounded-xl border border-subtle p-4 block hover:border-zinc-700 transition-colors">
                <div className="flex items-start gap-3">
                  <div className="elevated flex h-9 w-9 shrink-0 items-center justify-center rounded-lg">
                    <svg className="h-4 w-4 text-secondary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12.75V12A2.25 2.25 0 014.5 9.75h15A2.25 2.25 0 0121.75 12v.75m-8.69-6.44l-2.12-2.12a1.5 1.5 0 00-1.061-.44H4.5A2.25 2.25 0 002.25 6v12a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9a2.25 2.25 0 00-2.25-2.25h-5.379a1.5 1.5 0 01-1.06-.44z" />
                    </svg>
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-primary text-sm truncate">{f.name}</p>
                    <p className="text-muted text-xs mt-0.5">{f.date}</p>
                  </div>
                  <span className={`shrink-0 self-start rounded-full px-2 py-0.5 text-[11px] font-medium ${
                    f.status === 'active' ? 'text-emerald-500 bg-emerald-500/10' : 'text-muted bg-zinc-800'
                  }`}>{f.status}</span>
                </div>
              </Link>
            ))}
          </div>

          <div className="hidden sm:block surface rounded-xl border border-subtle overflow-x-auto">
            <div className="grid grid-cols-[1fr_120px_120px] gap-4 border-b border-subtle px-5 py-3 text-xs text-muted min-w-[500px]">
              <span>Folder</span>
              <span className="text-center">Status</span>
              <span className="text-right">Date</span>
            </div>
            {filtered.map((f) => (
              <Link key={f.id} href={`/dashboard/assets/${f.id}`} className="grid grid-cols-[1fr_120px_120px] gap-4 border-b border-subtle px-5 py-3.5 last:border-0 items-center min-w-[500px] hover:bg-zinc-900/50 transition-colors">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="elevated flex h-9 w-9 shrink-0 items-center justify-center rounded-lg">
                    <svg className="h-4 w-4 text-secondary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12.75V12A2.25 2.25 0 014.5 9.75h15A2.25 2.25 0 0121.75 12v.75m-8.69-6.44l-2.12-2.12a1.5 1.5 0 00-1.061-.44H4.5A2.25 2.25 0 002.25 6v12a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9a2.25 2.25 0 00-2.25-2.25h-5.379a1.5 1.5 0 01-1.06-.44z" />
                    </svg>
                  </div>
                  <p className="text-primary text-sm truncate">{f.name}</p>
                </div>
                <span className={`text-center text-xs font-medium ${
                  f.status === 'active' ? 'text-emerald-500' : 'text-muted'
                }`}>{f.status}</span>
                <span className="text-muted text-xs text-right">{f.date}</span>
              </Link>
            ))}
          </div>
        </>
      )}

      <CreateFolderModal open={showCreate} onClose={() => setShowCreate(false)} onCreate={load} />
    </div>
  )
}
