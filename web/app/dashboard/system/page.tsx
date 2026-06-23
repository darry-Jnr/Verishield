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

const STATUS_COLORS: Record<string, { dot: string; bg: string; text: string; border: string }> = {
  resolved: { dot: 'bg-emerald-500', bg: 'bg-emerald-500/10', text: 'text-emerald-500', border: 'border-emerald-500/20' },
  investigating: { dot: 'bg-amber-500', bg: 'bg-amber-500/10', text: 'text-amber-500', border: 'border-amber-500/20' },
  identified: { dot: 'bg-orange-500', bg: 'bg-orange-500/10', text: 'text-orange-500', border: 'border-orange-500/20' },
  monitoring: { dot: 'bg-blue-500', bg: 'bg-blue-500/10', text: 'text-blue-500', border: 'border-blue-500/20' },
}

function statusStyle(status: string) {
  return STATUS_COLORS[status.toLowerCase()] ?? { dot: 'bg-zinc-500', bg: 'bg-zinc-800', text: 'text-muted', border: 'border-zinc-800' }
}

export default function SystemPage() {
  const [services, setServices] = useState<Service[]>(
    SERVICES.map((s) => ({ name: s.name, icon: s.icon, ok: false, label: 'Checking…', timestamp: null }))
  )
  const [incidents, setIncidents] = useState<Incident[]>([])
  const [touched, setTouched] = useState(false)

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
      const { data, error } = await supabase.storage.from('media').list('', { limit: 1 })
      results.push({ ok: !error && data !== null, timestamp: new Date().toISOString() })
    } catch { results.push({ ok: false, timestamp: new Date().toISOString() }) }

    try {
      const res = await fetch(window.location.origin, { method: 'HEAD' })
      results.push({ ok: res.ok, timestamp: new Date().toISOString() })
    } catch { results.push({ ok: false, timestamp: new Date().toISOString() }) }

    setServices((prev) =>
      prev.map((s, i) => ({ ...s, ok: results[i].ok, label: results[i].ok ? 'Operational' : 'Down', timestamp: results[i].timestamp }))
    )
    setTouched(true)

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
        <div className="flex items-center gap-3">
          <div className="h-6 w-1 rounded-full bg-gradient-to-b from-emerald-500 to-emerald-500/20" />
          <h1 className="text-lg font-medium text-primary">System Status</h1>
        </div>
        <p className="mt-3 text-xs text-muted">
          {allOk ? 'All systems operational' : 'Some systems are down'}
          {' · '}refreshes every 10s
        </p>
      </div>

      {touched && allOk && (
        <div className="mb-6 rounded-xl border border-emerald-500/20 bg-emerald-500/5 px-5 py-3">
          <div className="flex items-center gap-3">
            <span className="relative flex h-3 w-3 shrink-0">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-40" />
              <span className="relative inline-flex h-3 w-3 rounded-full bg-emerald-400" />
            </span>
            <p className="text-xs font-medium text-emerald-400">All systems are operating normally</p>
          </div>
        </div>
      )}

      <div className="mb-10 space-y-2">
        {services.map((svc) => (
          <div
            key={svc.name}
            className={`group flex items-center gap-4 rounded-xl border bg-surface px-5 py-4 transition-all duration-300 ${
              svc.ok ? 'border-subtle' : 'border-red-500/20'
            } ${touched ? 'opacity-100' : 'opacity-0 translate-y-2'}`}
            style={{ transitionDelay: `${SERVICES.indexOf(svc) * 60}ms` }}
          >
            <div className={`flex h-10 w-10 items-center justify-center rounded-lg border bg-elevated transition-colors duration-300 ${
              svc.ok ? 'border-subtle' : 'border-red-500/20'
            }`}>
              <svc.icon className={`h-5 w-5 transition-colors duration-300 ${
                svc.ok ? 'text-muted' : 'text-red-400'
              }`} />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <span className="relative flex h-2.5 w-2.5 shrink-0 items-center justify-center">
                  {svc.ok && (
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-500 opacity-40" />
                  )}
                  <span className={`relative h-2 w-2 rounded-full transition-colors duration-300 ${
                    svc.ok ? 'bg-green-500' : 'bg-red-500'
                  }`} />
                </span>
                <span className="text-sm font-medium text-primary">{svc.name}</span>
              </div>
              <div className="mt-0.5 flex items-center gap-2 text-[11px] text-muted">
                <span className={`transition-colors duration-300 ${svc.ok ? 'text-emerald-400/80' : 'text-red-400/80'}`}>{svc.label}</span>
                {svc.timestamp && (
                  <>
                    <span className="opacity-30">·</span>
                    <span className="opacity-60">{new Date(svc.timestamp).toLocaleString()}</span>
                  </>
                )}
              </div>
            </div>
            <RefreshCw className={`h-4 w-4 shrink-0 animate-spin transition-opacity duration-300 ${
              svc.ok ? 'text-emerald-500/20' : 'text-red-500/20'
            }`} />
          </div>
        ))}
      </div>

      <div className="mb-4 flex items-center gap-3">
        <div className="h-4 w-1 rounded-full bg-gradient-to-b from-zinc-500 to-zinc-500/20" />
        <h2 className="text-xs font-medium text-secondary uppercase tracking-wide">Past Incidents</h2>
      </div>

      <div className="space-y-6">
        {Object.keys(groupedIncidents).length === 0 ? (
          <div className="flex flex-col items-center gap-2 rounded-xl border border-subtle bg-surface px-6 py-10">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-500/10">
              <span className="text-sm text-emerald-400">✓</span>
            </div>
            <p className="text-xs text-muted">No incidents recorded.</p>
          </div>
        ) : (
          Object.entries(groupedIncidents).map(([date, incs]) => (
            <div key={date}>
              <p className="mb-2 text-[11px] font-medium text-muted">{date}</p>
              <div className="space-y-2">
                {incs.map((inc) => {
                  const style = statusStyle(inc.status)
                  return (
                    <div key={inc.id} className="rounded-lg border border-subtle bg-elevated px-4 py-3 transition-colors duration-200 hover:border-zinc-700">
                      <div className="flex items-start justify-between gap-4">
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <span className={`h-2 w-2 shrink-0 rounded-full ${style.dot}`} />
                            <span className="text-sm font-medium text-primary">{inc.title}</span>
                            <span className={`rounded-full ${style.bg} ${style.border} ${style.text} border px-2 py-0.5 text-[10px] uppercase`}>
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
                            <span className="text-emerald-400">Resolved {new Date(inc.resolved_at).toLocaleTimeString()}</span>
                          </>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
