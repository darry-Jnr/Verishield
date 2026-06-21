'use client'

import { useState, useEffect, useCallback } from 'react'
import { X, Server, Database, HardDrive, Globe, RefreshCw } from 'lucide-react'
import { supabase } from '@/lib/supabase'

const THRESHOLD_MS = 30_000

interface ServiceStatus {
  name: string
  icon: typeof Server
  ok: boolean
  label: string
  timestamp: string | null
}

export default function SystemStatus() {
  const [open, setOpen] = useState(false)
  const [forgeOk, setForgeOk] = useState(false)
  const [forgeTime, setForgeTime] = useState<string | null>(null)
  const [initialised, setInitialised] = useState(false)

  useEffect(() => {
    const check = async () => {
      const { data } = await supabase
        .from('service_heartbeat')
        .select('last_seen')
        .eq('service_name', 'forge')
        .maybeSingle()
      if (data?.last_seen) {
        const age = Date.now() - new Date(data.last_seen).getTime()
        setForgeOk(age < THRESHOLD_MS)
        setForgeTime(data.last_seen)
      } else {
        setForgeOk(false)
        setForgeTime(null)
      }
      setInitialised(true)
    }
    check()
    const interval = setInterval(check, 10_000)
    return () => clearInterval(interval)
  }, [])

  if (!initialised) return null

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="flex w-full items-center gap-2 border-t border-subtle px-4 py-2.5 text-left transition-colors hover:bg-elevated"
      >
        <span className={`h-2 w-2 shrink-0 rounded-full ${forgeOk ? 'bg-green-500' : 'bg-red-500'}`} />
        <span className="text-xs text-secondary">System {forgeOk ? 'Online' : 'Offline'}</span>
      </button>

      {open && (
        <SystemControlModal onClose={() => setOpen(false)} forgeOk={forgeOk} forgeTime={forgeTime} />
      )}
    </>
  )
}

function SystemControlModal({ onClose, forgeOk, forgeTime: _forgeTime }: { onClose: () => void; forgeOk: boolean; forgeTime: string | null }) {
  const [services, setServices] = useState<ServiceStatus[]>([
    { name: 'Forge Worker', icon: Server, ok: forgeOk, label: forgeOk ? 'Online' : 'Offline', timestamp: _forgeTime },
    { name: 'Supabase DB', icon: Database, ok: false, label: 'Checking…', timestamp: null },
    { name: 'Supabase Storage', icon: HardDrive, ok: false, label: 'Checking…', timestamp: null },
    { name: 'Vercel', icon: Globe, ok: false, label: 'Checking…', timestamp: null },
  ])

  const checkAll = useCallback(async () => {
    const next = [...services]

    // Forge Worker
    const { data: hb } = await supabase
      .from('service_heartbeat')
      .select('last_seen')
      .eq('service_name', 'forge')
      .maybeSingle()
    const forgeOnline = hb?.last_seen ? Date.now() - new Date(hb.last_seen).getTime() < THRESHOLD_MS : false
    next[0] = { ...next[0], ok: forgeOnline, label: forgeOnline ? 'Online' : 'Offline', timestamp: hb?.last_seen ?? null }

    // Supabase DB — just ping a known table
    try {
      const { error } = await supabase.from('service_heartbeat').select('count', { count: 'exact', head: true })
      next[1] = { ...next[1], ok: !error, label: error ? 'Error' : 'Connected', timestamp: new Date().toISOString() }
    } catch {
      next[1] = { ...next[1], ok: false, label: 'Unreachable', timestamp: new Date().toISOString() }
    }

    // Supabase Storage — list bucket
    try {
      const { data: buckets } = await supabase.storage.listBuckets()
      const mediaBucket = buckets?.find((b) => b.name === 'media')
      next[2] = { ...next[2], ok: !!mediaBucket, label: mediaBucket ? 'Connected' : 'Missing "media" bucket', timestamp: new Date().toISOString() }
    } catch {
      next[2] = { ...next[2], ok: false, label: 'Unreachable', timestamp: new Date().toISOString() }
    }

    // Vercel — HEAD to homepage
    try {
      const vercelUrl = window.location.origin
      const res = await fetch(vercelUrl, { method: 'HEAD' })
      next[3] = { ...next[3], ok: res.ok, label: res.ok ? 'Live' : `${res.status}`, timestamp: new Date().toISOString() }
    } catch {
      next[3] = { ...next[3], ok: false, label: 'Unreachable', timestamp: new Date().toISOString() }
    }

    setServices(next)
  }, [services])

  useEffect(() => {
    checkAll()
    const interval = setInterval(checkAll, 10_000)
    return () => clearInterval(interval)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center" onClick={onClose}>
      <div className="fixed inset-0 bg-black/60" />
      <div
        className="relative z-10 w-full max-w-md rounded-t-2xl border border-subtle bg-surface p-5 shadow-2xl sm:rounded-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-sm font-medium text-primary">System Control</h2>
          <button onClick={onClose} className="text-muted hover:text-primary transition-colors">
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="space-y-2">
          {services.map((svc) => (
            <div key={svc.name} className="flex items-center gap-3 rounded-lg border border-subtle bg-elevated px-4 py-3">
              <svc.icon className="h-4 w-4 shrink-0 text-muted" />
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <span className={`h-2 w-2 shrink-0 rounded-full ${svc.ok ? 'bg-green-500' : 'bg-red-500'}`} />
                  <span className="text-sm text-primary">{svc.name}</span>
                </div>
                <p className="mt-0.5 text-[11px] text-muted">
                  {svc.label}
                  {svc.timestamp && (
                    <span className="ml-2 opacity-60">
                      {new Date(svc.timestamp).toLocaleTimeString()}
                    </span>
                  )}
                </p>
              </div>
              <RefreshCw className="h-3.5 w-3.5 shrink-0 animate-spin text-muted opacity-50" />
            </div>
          ))}
        </div>

        <p className="mt-4 text-[10px] text-muted opacity-60 text-center">
          Auto-updates every 10s
        </p>
      </div>
    </div>
  )
}
