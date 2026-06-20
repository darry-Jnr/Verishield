'use client'

import { useState, useRef, useEffect } from 'react'
import { Upload, ArrowRight, Scan, Square } from 'lucide-react'
import Link from 'next/link'

const initialAlerts = [
  { threat: 'Unauthorized Replica Detected', brand: 'luxewear.com', level: 'critical' as const, time: '2m ago' },
  { threat: 'MAP Violation — 40% below MSRP', brand: 'shopmart.io', level: 'warning' as const, time: '15m ago' },
  { threat: 'Status Clear — Enforcement Sent', brand: 'trendbay.net', level: 'safe' as const, time: '1h ago' },
]

const fakeFindings = [
  { threat: 'Unauthorized Replica — 86% match on product images', brand: 'stylesphere.io', level: 'critical' as const },
  { threat: 'MAP Violation — Listed 32% below MSRP', brand: 'quickcart.org', level: 'warning' as const },
  { threat: 'Unauthorized Replica — Video stolen for ad campaign', brand: 'copybay.net', level: 'critical' as const },
  { threat: 'MAP Violation — Price undercut by $24.00', brand: 'dealfinder.io', level: 'warning' as const },
  { threat: 'Status Clear — DMCA takedown enforced', brand: 'luxewear.com', level: 'safe' as const },
]

export default function DashboardPage() {
  const [alerts, setAlerts] = useState(initialAlerts)
  const [threatCount, setThreatCount] = useState(3)
  const [scanning, setScanning] = useState(false)
  const [scanDone, setScanDone] = useState(false)
  const [mounted, setMounted] = useState(false)
  const scanRef = useRef<number | null>(null)
  const alertRef = useRef<number | null>(null)
  const findingIndex = useRef(0)

  useEffect(() => { setMounted(true) }, [])

  const startScan = () => {
    if (scanning) return
    setScanning(true)
    setScanDone(false)
    findingIndex.current = 0

    alertRef.current = window.setInterval(() => {
      if (findingIndex.current < fakeFindings.length) {
        const f = fakeFindings[findingIndex.current]
        setAlerts((prev) => [{ ...f, time: 'just now' }, ...prev])
        setThreatCount((c) => c + 1)
        findingIndex.current++
      } else {
        // No more threats — auto-stop
        if (alertRef.current) clearInterval(alertRef.current)
        setScanning(false)
        setScanDone(true)
      }
    }, 5000)
  }

  const stopScan = () => {
    if (alertRef.current) clearInterval(alertRef.current)
    setScanning(false)
    setScanDone(false)
  }

  useEffect(() => {
    return () => {
      if (alertRef.current) clearInterval(alertRef.current)
    }
  }, [])

  return (
    <div className="p-4 sm:p-8">
      <div className="mb-6 sm:mb-8">
        <h1 className="text-primary text-xl sm:text-2xl font-medium">Dashboard</h1>
        <p className="text-secondary mt-1 text-sm">Brand intelligence overview</p>
      </div>

      {/* Stats */}
      <div className="mb-6 grid gap-4 grid-cols-2 lg:grid-cols-4">
        {[
          { label: 'Registered Assets', value: '12' },
          { label: 'Active Monitorings', value: '8' },
          { label: 'Threats Flagged', value: String(threatCount) },
          { label: 'Resolved', value: '5' },
        ].map((s) => (
          <div key={s.label} className="surface rounded-xl border border-subtle p-4 sm:p-5">
            <p className="text-secondary text-xs">{s.label}</p>
            <p className="text-primary mt-1 text-xl sm:text-2xl font-medium">{s.value}</p>
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
              {scanning && (
                <div className="absolute inset-0 overflow-hidden rounded-full">
                  <div className="h-full w-full animate-spin" style={{ animationDuration: '2s' }}>
                    <div className="mx-auto h-1/2 w-1/2 origin-bottom rounded-tl-full bg-gradient-to-r from-emerald-500/40 to-transparent" />
                  </div>
                </div>
              )}
              {/* Center dot */}
              <div className={`relative z-10 h-2.5 w-2.5 rounded-full ${scanning ? 'bg-emerald-500 animate-pulse' : 'bg-zinc-500'}`} />
              {/* Blips */}
              {scanning && (
                <>
                  <span className="absolute top-2 left-1/2 z-10 h-1.5 w-1.5 -translate-x-1/2 rounded-full bg-emerald-400 animate-ping" style={{ animationDuration: '1.5s' }} />
                  <span className="absolute bottom-3 right-3 z-10 h-1 w-1 rounded-full bg-emerald-400 animate-ping" style={{ animationDuration: '2.5s' }} />
                  <span className="absolute top-1/2 left-2 z-10 h-1 w-1 rounded-full bg-emerald-400 animate-ping" style={{ animationDuration: '2s' }} />
                </>
              )}
            </div>
          </div>

          {/* Content */}
          <div className="flex flex-1 items-center gap-3 px-4 sm:px-5 py-4">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <p className="text-primary text-sm font-medium">
                  {scanning ? 'Scanning...' : scanDone ? 'Scan Complete' : 'Asset Monitoring'}
                </p>
                {scanning && <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />}
              </div>
              <p className="text-xs text-muted mt-1">
                {scanning
                  ? `Scanning 8 assets · ${findingIndex.current} threats found`
                  : scanDone
                  ? `Found ${findingIndex.current} threats — monitoring updated`
                    : `${threatCount} active threats · Last scan ${mounted ? new Date().toLocaleTimeString() : '...'}`
                }
              </p>
            </div>
            <button
              onClick={scanning ? stopScan : startScan}
              className={`flex items-center gap-1.5 rounded-lg px-3.5 py-2 text-xs font-medium transition-all shrink-0 ${
                scanning
                  ? 'bg-red-500/10 text-red-500 hover:bg-red-500/20 border border-red-500/20'
                  : 'bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500/20 border border-emerald-500/20'
              }`}
            >
              {scanning ? (
                <><Square className="h-3 w-3" /> Stop</>
              ) : scanDone ? (
                <><Scan className="h-3 w-3" /> Scan Again</>
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

      {/* Alerts */}
      <div className="surface rounded-xl border border-subtle">
        <div className="flex items-center justify-between border-b border-subtle px-4 sm:px-5 py-3">
          <div className="flex items-center gap-2">
            <h2 className="text-primary text-sm font-medium">Live Alerts</h2>
            <span className="flex h-5 items-center rounded-full bg-red-500/10 px-2 text-[11px] font-medium text-red-500">{threatCount}</span>
          </div>
          <Link href="/dashboard/alerts" className="text-muted text-xs hover:text-secondary transition-colors">
            View all
          </Link>
        </div>
          {alerts.map((a, i) => (
            <div key={i} className="flex items-center justify-between border-b border-subtle px-4 sm:px-5 py-3.5 last:border-0">
              <div className="flex items-center gap-3 min-w-0">
                <span className={`h-2 w-2 shrink-0 rounded-full ${
                  a.level === 'critical' ? 'bg-red-500' : a.level === 'warning' ? 'bg-orange-500' : 'bg-emerald-500'
                }`} />
                <div className="min-w-0">
                  <p className={`text-sm font-medium truncate ${
                    a.level === 'critical' ? 'text-threat-critical' : a.level === 'warning' ? 'text-threat-warning' : 'text-threat-safe'
                  }`}>
                    {a.threat}
                    {a.time === 'just now' && <span className="ml-1.5 inline-block h-1.5 w-1.5 rounded-full bg-red-500 animate-pulse align-middle" />}
                  </p>
                  <p className="text-muted text-xs">{a.brand}</p>
                </div>
              </div>
              <div className="flex items-center gap-3 shrink-0">
                <span className="text-muted text-xs">{a.time}</span>
              </div>
            </div>
          ))}
      </div>
    </div>
  )
}
