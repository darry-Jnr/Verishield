'use client'

import { useState, useEffect, useRef } from 'react'
import { Upload, ArrowRight, Scan, Square, FolderKanban, Image, CheckCircle2, AlertTriangle, Search } from 'lucide-react'
import Link from 'next/link'
import { getFileStats, getFolders, getRecentFiles, getScanResults, type Folder, type FileRecord, type ScanResult } from '@/lib/db'

const DEMO_DOMAINS = [
  'aliexpress.com',
  'dhgate.com',
  'temu.com',
  'shopify-store.com',
  'etsy.com',
]

interface ScanLogEntry {
  domain: string
  status: 'checking' | 'clean' | 'match' | 'done'
}

function randomBlips(count: number, color: string) {
  const durations = ['1.2s', '1.8s', '2.2s', '1.5s', '2.5s', '1.0s', '2.0s', '1.6s']
  const blips = []
  for (let i = 0; i < Math.min(count, 8); i++) {
    blips.push(
      <span
        key={`${color}-${i}`}
        className={`absolute z-10 h-1.5 w-1.5 rounded-full ${color} animate-ping`}
        style={{ top: `${15 + Math.random() * 70}%`, left: `${15 + Math.random() * 70}%`, animationDuration: durations[i % durations.length], animationDelay: `${i * 0.3}s` }}
      />
    )
  }
  return blips
}

export default function DashboardPage() {
  const [folders, setFolders] = useState<Folder[]>([])
  const [stats, setStats] = useState({ total: 0, processing: 0, secured: 0, failed: 0, threatCount: 0 })
  const [recentFiles, setRecentFiles] = useState<FileRecord[]>([])
  const [scanning, setScanning] = useState(false)
  const [scanLog, setScanLog] = useState<ScanLogEntry[]>([])
  const [scanResults, setScanResults] = useState<ScanResult[]>([])
  const [scanMessage, setScanMessage] = useState('')
  const [mounted, setMounted] = useState(false)
  const [loading, setLoading] = useState(true)
  const abortRef = useRef(false)

  useEffect(() => { setMounted(true) }, [])

  const load = async () => {
    try {
      const [folderData, statsData, filesData] = await Promise.all([
        getFolders(),
        getFileStats(),
        getRecentFiles(5),
      ])
      setFolders(folderData)
      setStats(statsData)
      setRecentFiles(filesData)
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  const startScan = async () => {
    if (scanning) return
    if (stats.secured === 0) {
      setScanMessage('No secured assets to scan. Upload and stamp media first.')
      setTimeout(() => setScanMessage(''), 4000)
      return
    }

    abortRef.current = false
    setScanning(true)
    setScanLog([])
    setScanResults([])
    setScanMessage('')

    const log: ScanLogEntry[] = []

    for (const domain of DEMO_DOMAINS) {
      if (abortRef.current) break

      log.push({ domain, status: 'checking' })
      setScanLog([...log])

      await new Promise(r => setTimeout(r, 1200 + Math.random() * 800))

      if (abortRef.current) break

      let isMatch = false
      try {
        const results = await getScanResults()
        for (const r of results) {
          try {
            if (r.matched_url && new URL(r.matched_url).hostname.replace('www.', '') === domain) {
              isMatch = true
              break
            }
          } catch {}
        }
      } catch {}

      log[log.length - 1].status = isMatch ? 'match' : 'clean'
      setScanLog([...log])
    }

    const latestResults = await getScanResults().catch(() => [])
    const threatMatchCount = latestResults.filter(r => {
      try { return DEMO_DOMAINS.includes(new URL(r.matched_url).hostname.replace('www.', '')) }
      catch { return false }
    }).length

    log.push({
      domain: threatMatchCount > 0
        ? `${threatMatchCount} match${threatMatchCount > 1 ? 'es' : ''} found`
        : 'Nothing found',
      status: 'done',
    })
    setScanLog([...log])

    setScanResults(latestResults)
    await load()
    setScanning(false)
  }

  const stopScan = () => {
    abortRef.current = true
    setScanning(false)
  }

  const radarColor = stats.failed > 0 ? 'bg-red-500' : stats.processing > 0 ? 'bg-orange-500' : 'bg-emerald-500'
  const sweepColor = stats.failed > 0 ? 'from-red-500/40' : stats.processing > 0 ? 'from-orange-500/40' : 'from-emerald-500/40'
  const scanLabel = stats.failed > 0 ? 'Threats detected' : stats.processing > 0 ? 'Processing files' : 'All clear'
  const lastScan = mounted ? new Date().toLocaleTimeString() : '...'

  const noAssets = folders.length === 0 && stats.total === 0

  if (loading) {
    return (
      <div className="p-4 sm:p-8 animate-pulse">
        <div className="mb-6 sm:mb-8 flex items-start justify-between">
          <div>
            <div className="h-7 w-40 rounded bg-zinc-800" />
            <div className="h-4 w-56 rounded bg-zinc-800/50 mt-2" />
          </div>
          <div className="h-9 w-28 rounded-lg bg-zinc-800" />
        </div>
        <div className="mb-6 grid gap-4 grid-cols-2 lg:grid-cols-4">
          {[1,2,3,4].map(i => (
            <div key={i} className="rounded-xl border border-subtle p-4 sm:p-5 bg-surface">
              <div className="h-4 w-20 rounded bg-zinc-800 mb-3" />
              <div className="h-7 w-12 rounded bg-zinc-800" />
            </div>
          ))}
        </div>
        <div className="rounded-xl border border-subtle overflow-hidden mb-6">
          <div className="flex flex-col sm:flex-row">
            <div className="w-full sm:w-32 aspect-square bg-zinc-900/50" />
            <div className="flex-1 p-4 sm:p-5">
              <div className="h-5 w-36 rounded bg-zinc-800 mb-2" />
              <div className="h-4 w-48 rounded bg-zinc-800/50" />
            </div>
          </div>
        </div>
        <div className="rounded-xl border border-subtle mb-6 p-4 sm:p-5">
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 shrink-0 rounded-xl bg-zinc-800" />
            <div className="flex-1">
              <div className="h-4 w-40 rounded bg-zinc-800 mb-2" />
              <div className="h-3 w-56 rounded bg-zinc-800/50" />
            </div>
          </div>
        </div>
        <div className="rounded-xl border border-subtle">
          <div className="border-b border-subtle px-4 sm:px-5 py-3">
            <div className="h-4 w-28 rounded bg-zinc-800" />
          </div>
          {[1,2,3].map(i => (
            <div key={i} className="border-b border-subtle px-4 sm:px-5 py-3.5 last:border-0">
              <div className="flex items-center gap-3">
                <div className="h-2 w-2 shrink-0 rounded-full bg-zinc-800" />
                <div className="flex-1">
                  <div className="h-4 w-44 rounded bg-zinc-800 mb-1" />
                  <div className="h-3 w-20 rounded bg-zinc-800/50" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  if (noAssets) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center p-4 sm:p-8">
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-zinc-800 mb-6">
          <Upload className="h-8 w-8 text-zinc-400" />
        </div>
        <h2 className="text-primary text-lg font-medium mb-2">No assets yet</h2>
        <p className="text-muted text-sm mb-6 max-w-sm text-center">Add your first product media to start tracking.</p>
        <Link
          href="/dashboard/assets"
          className="inline-flex items-center gap-2 rounded-lg bg-white px-5 py-2.5 text-sm font-medium text-black transition-opacity hover:opacity-90"
        >
          <Upload className="h-4 w-4" />
          Add your first asset
        </Link>
      </div>
    )
  }

  return (
    <div className="p-4 sm:p-8">
      <div className="mb-6 sm:mb-8 flex items-start justify-between gap-4">
        <div>
          <h1 className="text-primary text-xl sm:text-2xl font-medium">Dashboard</h1>
          <p className="text-secondary mt-1 text-sm">Brand intelligence overview</p>
        </div>
        <Link
          href="/dashboard/assets"
          className="shrink-0 inline-flex items-center gap-2 rounded-lg bg-white px-4 py-2 text-sm font-medium text-black transition-opacity hover:opacity-90"
        >
          <Upload className="h-4 w-4" />
          Add asset
        </Link>
      </div>

      <div className="mb-6 grid gap-4 grid-cols-2 lg:grid-cols-4">
        {[
          { label: 'Total Folders', value: String(folders.length), icon: FolderKanban },
          { label: 'Total Files', value: String(stats.total), icon: Image },
          { label: 'Secured', value: String(stats.secured), icon: CheckCircle2, color: 'text-emerald-500' },
          { label: 'Failed', value: String(stats.failed), icon: AlertTriangle, color: stats.failed > 0 ? 'text-red-500' : 'text-muted' },
        ].map((s) => (
          <div key={s.label} className="surface rounded-xl border border-subtle p-4 sm:p-5">
            <div className="flex items-center gap-2">
              <s.icon className={`h-4 w-4 ${s.color || 'text-muted'}`} />
              <p className="text-secondary text-xs">{s.label}</p>
            </div>
            <p className="text-primary mt-1.5 text-xl sm:text-2xl font-medium">{s.value}</p>
          </div>
        ))}
      </div>

      <div className="surface mb-6 rounded-xl border border-subtle overflow-hidden">
        <div className="flex flex-col sm:flex-row">
          <div className="flex aspect-square w-full sm:w-32 items-center justify-center bg-zinc-900/50 p-6 sm:p-0">
            <div className="relative flex h-20 w-20 items-center justify-center">
              <div className="absolute inset-0 rounded-full border border-zinc-700" />
              <div className="absolute inset-2 rounded-full border border-zinc-700" />
              <div className="absolute inset-4 rounded-full border border-zinc-700" />
              <div className="absolute inset-0 overflow-hidden rounded-full">
                <div className="h-full w-full animate-spin" style={{ animationDuration: '3s' }}>
                  <div className={`mx-auto h-1/2 w-1/2 origin-bottom rounded-tl-full bg-gradient-to-r ${sweepColor} to-transparent`} />
                </div>
              </div>
              <div className={`relative z-10 h-2.5 w-2.5 rounded-full ${radarColor} ${scanning ? 'animate-pulse' : ''}`} />
              {stats.failed > 0 && randomBlips(stats.failed, 'bg-red-500')}
              {stats.processing > 0 && randomBlips(stats.processing, 'bg-orange-500')}
              {stats.secured > 0 && stats.failed === 0 && stats.processing === 0 && randomBlips(Math.min(stats.secured, 3), 'bg-emerald-500')}
            </div>
          </div>

          <div className="flex flex-1 items-center gap-3 px-4 sm:px-5 py-4">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <p className="text-primary text-sm font-medium">
                  {scanning ? 'Scanning marketplaces...' : 'Asset Monitoring'}
                </p>
                <span className={`h-1.5 w-1.5 rounded-full ${radarColor} ${scanning ? 'animate-pulse' : ''}`} />
              </div>
              <p className="text-xs text-muted mt-1">
                {scanMessage || (scanning
                  ? `Checking ${DEMO_DOMAINS.length} domains for stolen assets`
                  : `${scanLabel} · ${stats.total} files · Last scan ${lastScan}`
                )}
              </p>
            </div>
            <button
              onClick={scanning ? stopScan : startScan}
              className={`flex items-center gap-1.5 rounded-lg px-3.5 py-2 text-xs font-medium transition-all shrink-0 ${
                scanning
                  ? 'bg-red-500/10 text-red-500 hover:bg-red-500/20 border border-red-500/20'
                  : stats.failed > 0
                  ? 'bg-orange-500/10 text-orange-500 hover:bg-orange-500/20 border border-orange-500/20'
                  : 'bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500/20 border border-emerald-500/20'
              }`}
            >
              {scanning ? (
                <><Square className="h-3 w-3" /> Stop</>
              ) : (
                <><Scan className="h-3 w-3" /> Scan Now</>
              )}
            </button>
          </div>
        </div>

        {scanLog.length > 0 && (
          <div className="border-t border-subtle px-4 sm:px-5 py-3">
            <style>{`@keyframes scanIn { from { opacity: 0; transform: translateY(-6px); } to { opacity: 1; transform: translateY(0); } }`}</style>
            <div className="flex items-center justify-between text-xs font-mono">
              <div className="flex items-center gap-2 min-w-0">
                <div key={scanLog.length} style={{ animation: 'scanIn 0.35s ease-out' }} className="flex items-center gap-2">
                  {(() => {
                    const e = scanLog[scanLog.length - 1]
                    if (e.status === 'done') {
                      const hasMatch = e.domain.includes('match')
                      return (
                        <span className={`flex items-center gap-1.5 ${hasMatch ? 'text-amber-500' : 'text-emerald-500'}`}>
                          {hasMatch ? <Search className="h-3.5 w-3.5" /> : <CheckCircle2 className="h-3.5 w-3.5" />}
                          <span className="font-medium">{e.domain}</span>
                        </span>
                      )
                    }
                    return (
                      <>
                        {e.status === 'checking' && <span className="h-2 w-2 shrink-0 rounded-full bg-amber-500 animate-pulse" />}
                        {e.status === 'clean' && <span className="text-emerald-500 shrink-0 transition-opacity">&#10003;</span>}
                        {e.status === 'match' && <span className="text-red-500 shrink-0 transition-opacity">&#9888;</span>}
                        <span className={e.status === 'checking' ? 'text-amber-400' : e.status === 'match' ? 'text-red-400' : 'text-secondary'}>{e.domain}</span>
                        {e.status === 'checking' && <span className="text-muted animate-pulse">checking...</span>}
                        {e.status === 'clean' && <span className="text-muted">No matches</span>}
                        {e.status === 'match' && <span className="text-red-500">Match found</span>}
                      </>
                    )
                  })()}
                </div>
              </div>
              <Link href="/dashboard/scan-logs" className="ml-auto text-muted hover:text-primary transition-colors shrink-0 pl-3">View all &rarr;</Link>
            </div>
          </div>
        )}
      </div>

      {scanResults.length > 0 && !scanning && (
        <div className="surface mb-6 rounded-xl border border-subtle">
          <div className="flex items-center justify-between border-b border-subtle px-4 sm:px-5 py-3">
            <div className="flex items-center gap-2">
              <Search className="h-4 w-4 text-amber-500" />
              <h2 className="text-primary text-sm font-medium">Scan Results</h2>
              <span className="flex h-5 items-center rounded-full bg-amber-500/10 px-2 text-[11px] font-medium text-amber-500">
                {scanResults.length} {scanResults.length === 1 ? 'match' : 'matches'}
              </span>
            </div>
          </div>
          {scanResults.map((r) => (
            <div key={r.id} className="border-b border-subtle px-4 sm:px-5 py-3.5 last:border-0">
              <div className="flex items-start gap-3">
                <div className="min-w-0 flex-1">
                  <p className="text-primary text-sm truncate">
                    {r.matched_url ? new URL(r.matched_url).hostname : 'Unknown'}
                  </p>
                  <p className="text-muted text-xs truncate mt-0.5">{r.matched_url}</p>
                </div>
                <span className="text-muted text-xs shrink-0">
                  {new Date(r.detected_at).toLocaleDateString()}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="surface rounded-xl border border-subtle">
        <div className="flex items-center justify-between border-b border-subtle px-4 sm:px-5 py-3">
          <div className="flex items-center gap-2">
            <h2 className="text-primary text-sm font-medium">Recent Activity</h2>
            <span className={`flex h-5 items-center rounded-full px-2 text-[11px] font-medium ${
              stats.failed > 0 ? 'bg-red-500/10 text-red-500' : stats.processing > 0 ? 'bg-orange-500/10 text-orange-500' : 'bg-emerald-500/10 text-emerald-500'
            }`}>
              {stats.failed > 0 ? `${stats.failed} issues` : stats.processing > 0 ? `${stats.processing} pending` : 'All clear'}
            </span>
          </div>
        </div>
        {recentFiles.length === 0 && folders.length === 0 ? (
          <div className="px-4 sm:px-5 py-8 text-center">
            <p className="text-muted text-xs">No activity yet. Upload your first asset.</p>
          </div>
        ) : (
          <>
            {recentFiles.map((f) => (
              <div key={f.id} className="flex items-center justify-between border-b border-subtle px-4 sm:px-5 py-3.5 last:border-0">
                <div className="flex items-center gap-3 min-w-0">
                  <span className={`h-2 w-2 shrink-0 rounded-full ${
                    f.status === 'failed' ? 'bg-red-500' : f.status === 'processing' ? 'bg-orange-500' : 'bg-emerald-500'
                  }`} />
                  <div className="min-w-0">
                    <p className="text-primary text-sm truncate">{f.name}</p>
                    <p className="text-muted text-xs">
                      {f.status}
                      {f.status === 'processing' && <span className="ml-1.5 inline-block h-1.5 w-1.5 rounded-full bg-orange-500 animate-pulse align-middle" />}
                    </p>
                  </div>
                </div>
                <span className="text-muted text-xs shrink-0">
                  {new Date(f.created_at).toLocaleDateString()}
                </span>
              </div>
            ))}
          </>
        )}
      </div>
    </div>
  )
}
