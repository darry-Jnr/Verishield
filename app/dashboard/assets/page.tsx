import { Upload, Image, Film, FileText } from 'lucide-react'
import Link from 'next/link'

const assets = [
  { name: 'Summer Collection — Hero Shot', type: 'image', date: '2026-06-18', matches: 4, status: 'active' },
  { name: 'Product Video — 30s Ad', type: 'video', date: '2026-06-17', matches: 2, status: 'active' },
  { name: 'Lookbook Page 1-5', type: 'document', date: '2026-06-15', matches: 0, status: 'active' },
  { name: 'Holiday Campaign — Banner', type: 'image', date: '2026-06-12', matches: 6, status: 'active' },
  { name: 'Influencer Collateral Pack', type: 'image', date: '2026-06-10', matches: 1, status: 'active' },
  { name: 'Spring Line — Detail Shots', type: 'image', date: '2026-06-08', matches: 3, status: 'archived' },
]

const typeIcon = { image: Image, video: Film, document: FileText }

export default function AssetsPage() {
  return (
    <div className="p-4 sm:p-8">
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

      {/* Mobile cards */}
      <div className="space-y-3 sm:hidden">
        {assets.map((a) => {
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

      {/* Desktop table */}
      <div className="hidden sm:block surface rounded-xl border border-subtle overflow-x-auto">
        <div className="grid grid-cols-[1fr_100px_100px_120px] gap-4 border-b border-subtle px-5 py-3 text-xs text-muted min-w-[500px]">
          <span>Asset</span>
          <span className="text-center">Matches</span>
          <span className="text-center">Status</span>
          <span className="text-right">Date</span>
        </div>
        {assets.map((a) => {
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
    </div>
  )
}
