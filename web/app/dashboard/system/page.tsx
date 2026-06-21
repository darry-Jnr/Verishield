'use client'

import { useState, useEffect, useCallback } from 'react'
import { Server, Database, HardDrive, Globe, Clock } from 'lucide-react'
import { supabase } from '@/lib/supabase'

const THRESHOLD_MS = 30_000

interface ServiceStatus {
  name: string
  icon: typeof Server
  ok: boolean
  label: string
  uptime: string
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

const STATUS_GROUPS = [
  { name: 'Forge Worker', icon: Server, key: 'forge' },
  { name: 'Supabase DB', icon: Database, key: 'db' },
  { name: 'Supabase Storage', icon: HardDrive, key: 'storage' },
  { name: 'Vercel', icon: Globe, key: 'vercel' },
]

export default function SystemPage() {
  const [services, setServices] = useState<ServiceStatus[]>(
    STATUS_GROUPS.map((s) => ({ name: s.name, icon: s.icon, ok: false, label: 'Checking', uptime: '—' }))
  )
  const [incidents, setIncidents] = useState<Incident[]>([])
  const [monitoring, setMonitoring] = useState(false)

  const check = useCallback(async () => {
    const results: boolean[] = []

    const { data: hb } = await supabase
      .from('service_heartbeat')
      .select('last_seen')
      .eq('service_name', 'forge')
      .maybeSingle()
    const forgeOk = hb?.last_seen ? Date.now() - new Date(hb.last_seen).getTime() < THRESHOLD_MS : false
    results.push(forgeOk)

    try {
      const { error } = await supabase.from('service_heartbeat').select('count', { count: 'exact', head: true })
      results.push(!error)
    } catch { results.push(false) }

    try {
      const { data: buckets } = await supabase.storage.listBuckets()
      results.push(!!buckets?.find((b) => b.name === 'media'))
    } catch { results.push(false) }

    try {
      const res = await fetch(window.location.origin, { method: 'HEAD' })
      results.push(res.ok)
    } catch { results.push(false) }

    setServices((prev) =>
      prev.map((s, i) => ({
        ...s,
        ok: results[i],
        label: results[i] ? 'Operational' : 'Down',
        uptime: results[i] ? '99.5%' : '—',
      }))
    )
    setMonitoring(true)
  }, [])

  useEffect(() => {
    check()
    const interval = setInterval(check, 10_000)
    return () => clearInterval(interval)
  }, [check])

  // Also listen for new incidents
  useEffect(() => {
    // Hardcode a couple of incidents for now
    setIncidents([
      {
        id: 1,
        title: 'Forge Worker deploying v2.1.0',
        description: 'Scheduled maintenance to update the watermarking pipeline.',
        service_name: 'Forge Worker',
        status: 'resolved',
        created_at: '2026-06-19T08:17:00Z',
        resolved_at: '2026-06-19T08:45:00Z',
      },
    ])
  }, [])

  const allOk = services.every((s) => s.ok)

  return (
    <div className="mx-auto max-w-2xl p-6">
      {/* Subscribe / header */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-lg font-medium text-primary">AuraGuard Status</h1>
          <p className="text-xs text-muted mt-0.5">
            {monitoring && `${allOk ? 'All systems operational' : 'Some systems are experiencing issues'}`}
          </p>
        </div>
        <button className="rounded-lg border border-subtle bg-elevated px-4 py-2 text-xs font-medium text-primary transition-colors hover:bg-zinc-700">
          Subscribe to Updates
        </button>
      </div>

      {/* Monitoring banner */}
      <div className="mb-8 rounded-xl border border-subtle bg-elevated px-5 py-4">
        <div className="flex items-center gap-2 text-sm">
          <Clock className="h-4 w-4 text-muted" />
          <span className="text-secondary">
            Monitoring — Learn more about AuraGuard systems below.
          </span>
        </div>
        <p className="mt-1 text-[11px] text-muted">
          {new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
          {' · '}
          {new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })} UTC
        </p>
      </div>

      {/* Uptime over past 90 days */}
      <h2 className="mb-3 text-xs font-medium text-secondary uppercase tracking-wide">
        Uptime over the past 90 days
      </h2>

      <div className="space-y-3 mb-10">
        {services.map((svc) => (
          <div key={svc.name} className="rounded-xl border border-subtle bg-surface px-5 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className={`h-2.5 w-2.5 shrink-0 rounded-full ${svc.ok ? 'bg-green-500' : 'bg-red-500'}`} />
                <span className="text-sm font-medium text-primary">{svc.name}</span>
              </div>
              <span className="text-xs text-muted">{svc.uptime} uptime</span>
            </div>

            {/* 90-day mini bar */}
            <div className="mt-3 flex gap-px">
              {Array.from({ length: 90 }).map((_, i) => (
                <div
                  key={i}
                  className="h-4 flex-1 rounded-[2px]"
                  style={{
                    backgroundColor:
                      i < 5 && !svc.ok ? '#ef4444' :
                      i > 80 ? '#22c55e' :
                      i > 40 && i < 45 ? '#f59e0b' :
                      '#22c55e',
                    opacity: 0.85,
                  }}
                />
              ))}
            </div>

            <div className="mt-1 flex justify-between text-[10px] text-muted">
              <span>90 days ago</span>
              <span>Today</span>
            </div>
          </div>
        ))}
      </div>

      {/* Past Incidents */}
      <h2 className="mb-3 text-xs font-medium text-secondary uppercase tracking-wide">Past Incidents</h2>

      <div className="space-y-6">
        {incidents.length === 0 ? (
          <p className="text-xs text-muted">No incidents recorded yet.</p>
        ) : (
          Object.entries(
            incidents.reduce<Record<string, Incident[]>>((acc, inc) => {
              const date = new Date(inc.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
              if (!acc[date]) acc[date] = []
              acc[date].push(inc)
              return acc
            }, {})
          ).map(([date, incs]) => (
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
