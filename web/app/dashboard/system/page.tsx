'use client'

import { useState, useEffect, useCallback } from 'react'
import { Server, Database, HardDrive, Globe, RefreshCw } from 'lucide-react'
import { supabase } from '@/lib/supabase'

const THRESHOLD_MS = 30_000

interface ServiceStatus {
  name: string
  icon: typeof Server
  ok: boolean
  label: string
  timestamp: string | null
}

export default function SystemPage() {
  const [services, setServices] = useState<ServiceStatus[]>([
    { name: 'Forge Worker', icon: Server, ok: false, label: 'Checking…', timestamp: null },
    { name: 'Supabase DB', icon: Database, ok: false, label: 'Checking…', timestamp: null },
    { name: 'Supabase Storage', icon: HardDrive, ok: false, label: 'Checking…', timestamp: null },
    { name: 'Vercel', icon: Globe, ok: false, label: 'Checking…', timestamp: null },
  ])

  const checkAll = useCallback(async () => {
    const next = [...services]

    const { data: hb } = await supabase
      .from('service_heartbeat')
      .select('last_seen')
      .eq('service_name', 'forge')
      .maybeSingle()
    const forgeOnline = hb?.last_seen ? Date.now() - new Date(hb.last_seen).getTime() < THRESHOLD_MS : false
    next[0] = { ...next[0], ok: forgeOnline, label: forgeOnline ? 'Online' : 'Offline', timestamp: hb?.last_seen ?? null }

    try {
      const { error } = await supabase.from('service_heartbeat').select('count', { count: 'exact', head: true })
      next[1] = { ...next[1], ok: !error, label: error ? 'Error' : 'Connected', timestamp: new Date().toISOString() }
    } catch {
      next[1] = { ...next[1], ok: false, label: 'Unreachable', timestamp: new Date().toISOString() }
    }

    try {
      const { data: buckets } = await supabase.storage.listBuckets()
      const mediaBucket = buckets?.find((b) => b.name === 'media')
      next[2] = { ...next[2], ok: !!mediaBucket, label: mediaBucket ? 'Connected' : 'Missing "media" bucket', timestamp: new Date().toISOString() }
    } catch {
      next[2] = { ...next[2], ok: false, label: 'Unreachable', timestamp: new Date().toISOString() }
    }

    try {
      const res = await fetch(window.location.origin, { method: 'HEAD' })
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

  const allOk = services.every((s) => s.ok)

  return (
    <div className="p-6">
      <div className="mb-6 flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-subtle bg-elevated">
          <Server className="h-5 w-5 text-primary" />
        </div>
        <div>
          <h1 className="text-lg font-medium text-primary">System Control</h1>
          <p className="text-xs text-muted">
            {allOk ? 'All systems operational' : 'Some systems have issues'}
            {' · '}refreshes every 10s
          </p>
        </div>
      </div>

      <div className="space-y-2">
        {services.map((svc) => (
          <div key={svc.name} className="flex items-center gap-4 rounded-xl border border-subtle bg-surface px-5 py-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg border border-subtle bg-elevated">
              <svc.icon className="h-5 w-5 text-muted" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <span className={`h-2.5 w-2.5 shrink-0 rounded-full ${svc.ok ? 'bg-green-500' : 'bg-red-500'}`} />
                <span className="text-sm font-medium text-primary">{svc.name}</span>
              </div>
              <div className="mt-0.5 flex items-center gap-2 text-[11px] text-muted">
                <span>{svc.label}</span>
                {svc.timestamp && (
                  <>
                    <span className="opacity-30">·</span>
                    <span className="opacity-60">{new Date(svc.timestamp).toLocaleString()}</span>
                  </>
                )}
              </div>
            </div>
            <RefreshCw className="h-4 w-4 shrink-0 animate-spin text-muted opacity-40" />
          </div>
        ))}
      </div>
    </div>
  )
}
