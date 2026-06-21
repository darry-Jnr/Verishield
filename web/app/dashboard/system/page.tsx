'use client'

import { useState, useEffect, useCallback } from 'react'
import { Server, Database, HardDrive, Globe, RefreshCw } from 'lucide-react'
import { supabase } from '@/lib/supabase'

const THRESHOLD_MS = 30_000

interface Service {
  name: string
  icon: typeof Server
  ok: boolean
  label: string
  timestamp: string | null
}

interface Incident {
  id: number
  title: string
  description: string | null
  service_name: string
  status: string
  created_at: string
  resolved_at: string | null
}

const SERVICES = [
  { name: 'Forge Worker', icon: Server },
  { name: 'Supabase DB', icon: Database },
  { name: 'Supabase Storage', icon: HardDrive },
  { name: 'Vercel', icon: Globe },
]

export default function SystemPage() {
  const [services, setServices] = useState<Service[]>(
    SERVICES.map((s) => ({ name: s.name, icon: s.icon, ok: false, label: 'Checking…', timestamp: null }))
  )
  const [incidents, setIncidents] = useState<Incident[]>([])

  const check = useCallback(async () => {
    const results: { ok: boolean; timestamp: string | null }[] = []

    const { data: hb } = await supabase
      .from('service_heartbeat')
      .select('last_seen')
      .eq('service_name', 'forge')
      .maybeSingle()
    const forgeOk = hb?.last_seen ? Date.now() - new Date(hb.last_seen).getTime() < THRESHOLD_MS : false
    results.push({ ok: forgeOk, timestamp: hb?.last_seen ?? null })

    try {
      const { error } = await supabase.from('service_heartbeat').select('count', { count: 'exact', head: true })
      results.push({ ok: !error, timestamp: new Date().toISOString() })
    } catch { results.push({ ok: false, timestamp: new Date().toISOString() }) }

    try {
      const { data: buckets } = await supabase.storage.listBuckets()
      results.push({ ok: !!buckets?.find((b) => b.name === 'media'), timestamp: new Date().toISOString() })
    } catch { results.push({ ok: false, timestamp: new Date().toISOString() }) }

    try {
      const res = await fetch(window.location.origin, { method: 'HEAD' })
      results.push({ ok: res.ok, timestamp: new Date().toISOString() })
    } catch { results.push({ ok: false, timestamp: new Date().toISOString() }) }

    setServices((prev) =>
      prev.map((s, i) => ({ ...s, ok: results[i].ok, label: results[i].ok ? 'Operational' : 'Down', timestamp: results[i].timestamp }))
    )

    // Fetch real incidents
    const { data } = await supabase
      .from('system_incidents')
      .select('*')
      .order('created_at', { ascending: false })
    if (data) setIncidents(data)
  }, [])

  useEffect(() => {
    check()
    const interval = setInterval(check, 10_000)
    return () => clearInterval(interval)
  }, [check])

  const allOk = services.every((s) => s.ok)

  const groupedIncidents = incidents.reduce<Record<string, Incident[]>>((acc, inc) => {
    const date = new Date(inc.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
    if (!acc[date]) acc[date] = []
    acc[date].push(inc)
    return acc
  }, {})

  return (
    <div className="mx-auto max-w-2xl p-6">
      <div className="mb-8">
        <h1 className="text-lg font-medium text-primary">System Status</h1>
        <p className="mt-1 text-xs text-muted">
          {allOk ? 'All systems operational' : 'Some systems are down'}
          {' · '}refreshes every 10s
        </p>
      </div>

      <div className="mb-10 space-y-2">
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
            <RefreshCw className="h-4 w-4 shrink-0 animate-spin text-muted opacity-30" />
          </div>
        ))}
      </div>

      <h2 className="mb-3 text-xs font-medium text-secondary uppercase tracking-wide">Past Incidents</h2>

      <div className="space-y-6">
        {Object.keys(groupedIncidents).length === 0 ? (
          <p className="text-xs text-muted">No incidents recorded.</p>
        ) : (
          Object.entries(groupedIncidents).map(([date, incs]) => (
            <div key={date}>
              <p className="mb-2 text-[11px] font-medium text-muted">{date}</p>
              <div className="space-y-2">
                {incs.map((inc) => (
                  <div key={inc.id} className="rounded-lg border border-subtle bg-elevated px-4 py-3">
                    <div className="flex items-start justify-between gap-4">
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium text-primary">{inc.title}</span>
                          <span className="rounded-full bg-zinc-800 px-2 py-0.5 text-[10px] text-muted uppercase">
                            {inc.status}
                          </span>
                        </div>
                        {inc.description && (
                          <p className="mt-0.5 text-xs text-muted">{inc.description}</p>
                        )}
                      </div>
                    </div>
                    <div className="mt-1.5 flex items-center gap-1 text-[11px] text-muted">
                      <span>{inc.service_name}</span>
                      <span className="opacity-30">·</span>
                      <span>{new Date(inc.created_at).toLocaleTimeString()}</span>
                      {inc.resolved_at && (
                        <>
                          <span className="opacity-30">·</span>
                          <span className="text-green-500">Resolved {new Date(inc.resolved_at).toLocaleTimeString()}</span>
                        </>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
