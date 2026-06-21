'use client'

import { useState, useEffect, useRef } from 'react'
import { Upload, ArrowRight, Scan, Square, FolderKanban, Image, CheckCircle2, AlertTriangle } from 'lucide-react'
import Link from 'next/link'
import { getFileStats, getFolders, getRecentFiles, type Folder, type FileRecord } from '@/lib/db'

function randomBlips(count: number, color: string) {
  const positions = [
    'top-1 left-1/3', 'top-1/4 right-2', 'top-1/2 left-1', 'bottom-1/3 right-1/4',
    'bottom-1 left-1/2', 'top-2 right-1/3', 'left-1/2 bottom-2', 'right-1 top-1/3',
    'top-1/3 left-2', 'bottom-2 right-1/2', 'right-2 bottom-1/3', 'left-1/3 top-1',
  ]
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
  const [scanCount, setScanCount] = useState(0)
  const [mounted, setMounted] = useState(false)
  const intervalRef = useRef<number | null>(null)

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
    }
  }

  useEffect(() => { load() }, [])

  const startScan = () => {
    if (scanning) return
    setScanning(true)
    setScanCount(0)
    let count = 0
    intervalRef.current = window.setInterval(async () => {
      count++
      setScanCount(count)
      await load()
      if (count >= 6) {
        if (intervalRef.current) clearInterval(intervalRef.current)
        setScanning(false)
      }
    }, 3000)
  }

  const stopScan = () => {
    if (intervalRef.current) clearInterval(intervalRef.current)
    setScanning(false)
  }

  useEffect(() => {
    return () => { if (intervalRef.current) clearInterval(intervalRef.current) }
  }, [])

  const radarColor = stats.failed > 0 ? 'bg-red-500' : stats.processing > 0 ? 'bg-orange-500' : 'bg-emerald-500'
  const sweepColor = stats.failed > 0 ? 'from-red-500/40' : stats.processing > 0 ? 'from-orange-500/40' : 'from-emerald-500/40'
  const scanLabel = stats.failed > 0 ? 'Threats detected' : stats.processing > 0 ? 'Processing files' : 'All clear'
  const lastScan = mounted ? new Date().toLocaleTimeString() : '...'

  return (
    <div className="p-4 sm:p-8">
      <div className="mb-6 sm:mb-8">
        <h1 className="text-primary text-xl sm:text-2xl font-medium">Dashboard</h1>
        <p className="text-secondary mt-1 text-sm">Brand intelligence overview</p>
      </div>

      {/* Stats */}
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

      {/* Scan card with radar */}
      <div className="surface mb-6 rounded-xl border border-subtle overflow-hidden">
        <div className="flex flex-col sm:flex-row">
          {/* Radar visual */}
          <div className="flex aspect-square w-full sm:w-32 items-center justify-center bg-zinc-900/50 p-6 sm:p-0">
            <div className="relative flex h-20 w-20 items-center justify-center">
              {/* Rings */}
              <div className="absolute inset-0 rounded-full border border-zinc-700" />
              <div className="absolute inset-2 rounded-full border border-zinc-700" />
              <div className="absolute inset-4 rounded-full border border-zinc-700" />
              {/* Sweep */}
              <div className="absolute inset-0 overflow-hidden rounded-full">
                <div className="h-full w-full animate-spin" style={{ animationDuration: '3s' }}>
                  <div className={`mx-auto h-1/2 w-1/2 origin-bottom rounded-tl-full bg-gradient-to-r ${sweepColor} to-transparent`} />
                </div>
              </div>
              {/* Center dot */}
              <div className={`relative z-10 h-2.5 w-2.5 rounded-full ${radarColor} ${scanning ? 'animate-pulse' : ''}`} />
              {/* Blips based on real data */}
              {stats.failed > 0 && randomBlips(stats.failed, 'bg-red-500')}
              {stats.processing > 0 && randomBlips(stats.processing, 'bg-orange-500')}
              {stats.secured > 0 && stats.failed === 0 && stats.processing === 0 && randomBlips(Math.min(stats.secured, 3), 'bg-emerald-500')}
            </div>
          </div>

          {/* Content */}
          <div className="flex flex-1 items-center gap-3 px-4 sm:px-5 py-4">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <p className="text-primary text-sm font-medium">
                  {scanning ? `Scanning... (${scanCount}/6)` : 'Asset Monitoring'}
                </p>
                <span className={`h-1.5 w-1.5 rounded-full ${radarColor} ${scanning ? 'animate-pulse' : ''}`} />
              </div>
              <p className="text-xs text-muted mt-1">
                {scanning
                  ? `${stats.total} files scanned · ${stats.failed} threats found`
                  : `${scanLabel} · ${stats.total} files · Last scan ${lastScan}`
                }
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
      </div>

      {/* Upload CTA */}
      <Link
        href="/dashboard/assets"
        className="elevated mb-6 sm:mb-8 flex items-center gap-4 rounded-xl border border-subtle p-4 sm:p-5 transition-colors hover:border-zinc-700 group"
      >
        <div className="flex h-10 w-10 sm:h-12 sm:w-12 shrink-0 items-center justify-center rounded-xl border border-dashed border-zinc-600 group-hover:border-zinc-500 transition-colors">
          <Upload className="h-4 w-4 sm:h-5 sm:w-5 text-secondary" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-primary text-sm font-medium">Register a new asset</p>
          <p className="text-muted text-xs">Upload product media to start monitoring.</p>
        </div>
        <ArrowRight className="h-4 w-4 text-muted group-hover:text-primary transition-colors" />
      </Link>

      {/* Recent Activity */}
      <div className="surface rounded-xl border border-subtle">
        <div className="flex items-center justify-between border-b border-subtle px-4 sm:px-5 py-3">
          <div className="flex items-center gap-2">
            <h2 className="text-primary text-sm font-medium">Recent Activity</h2>
            <span className={`flex h-5 items-center rounded-full px-2 text-[11px] font-medium ${
              stats.failed > 0 ? 'bg-red-500/10 text-red-500' : stats.processing > 0 ? 'bg-orange-500/10 text-orange-500' : 'bg-emerald-500/10 text-emerald-500'
            }`}>
              {stats.failed > 0 ? `${stats.failed} threats` : stats.processing > 0 ? `${stats.processing} pending` : 'All clear'}
            </span>
          </div>
        </div>
        {recentFiles.length === 0 && folders.length === 0 ? (
          <div className="px-4 sm:px-5 py-8 text-center">
            <p className="text-muted text-xs">No activity yet. Upload your first asset.</p>
          </div>
        ) : (
          <>
            {/* Recent files */}
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
