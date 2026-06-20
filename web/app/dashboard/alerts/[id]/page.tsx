'use client'

import { useParams, useRouter } from 'next/navigation'
import { ArrowLeft, ExternalLink, Globe, Mail, Phone, Image, FileText, Video, Shield, Calendar, Users } from 'lucide-react'
import { alerts } from '@/lib/alerts-data'

export default function AlertDetailPage() {
  const { id } = useParams()
  const router = useRouter()
  const alert = alerts[Number(id)]

  if (!alert) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <p className="text-secondary text-sm">Alert not found.</p>
      </div>
    )
  }

  const severityStyles = {
    critical: { bg: 'bg-red-500/10', border: 'border-red-500/20', text: 'text-red-500', dot: 'bg-red-500', label: 'Critical Threat' },
    warning: { bg: 'bg-orange-500/10', border: 'border-orange-500/20', text: 'text-orange-500', dot: 'bg-orange-500', label: 'Warning' },
    safe: { bg: 'bg-emerald-500/10', border: 'border-emerald-500/20', text: 'text-emerald-500', dot: 'bg-emerald-500', label: 'Status Clear' },
  }

  const s = severityStyles[alert.severity]
  const TypeIcon = alert.type === 'image' ? Image : alert.type === 'video' ? Video : FileText

  return (
    <div className="flex-1 min-h-0 flex flex-col">
      <div className="px-4 sm:px-6 py-4 border-b border-subtle flex items-center justify-between">
        <button onClick={() => router.back()} className="flex items-center gap-1.5 text-secondary hover:text-primary transition-colors text-sm">
          <ArrowLeft className="h-4 w-4" />
          Back to Alerts
        </button>
      </div>

      <div className="flex-1 overflow-auto">
        <div className="max-w-4xl mx-auto p-4 sm:p-6 space-y-6">

          {/* Summary Card */}
          <div className={`${s.bg} ${s.border} border rounded-xl p-5`}>
            <div className="flex items-center gap-2 mb-3">
              <span className={`h-2 w-2 rounded-full ${s.dot}`} />
              <span className={`text-xs font-medium uppercase tracking-wider ${s.text}`}>{s.label}</span>
              <span className="text-muted text-xs mx-1">·</span>
              <span className="text-muted text-xs">{alert.date}</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-semibold text-primary mb-2">{alert.violation}</h1>
            <p className="text-body text-sm">{alert.impact}</p>
            <div className="flex items-center gap-4 mt-4 pt-4 border-t border-white/5">
              <div className="flex items-center gap-2 text-sm">
                <TypeIcon className="h-4 w-4 text-muted" />
                <span className="text-secondary capitalize">{alert.type}</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Users className="h-4 w-4 text-muted" />
                <span className="text-secondary">{alert.impressions === '—' ? 'N/A' : `${alert.impressions} reach`}</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Calendar className="h-4 w-4 text-muted" />
                <span className="text-secondary">{alert.date}</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Domain Information */}
            <div className="bg-elevated border border-subtle rounded-xl overflow-hidden">
              <div className="px-4 py-3 border-b border-subtle flex items-center gap-2">
                <Globe className="h-4 w-4 text-muted" />
                <h2 className="text-sm font-medium text-primary">Domain Information</h2>
              </div>
              <div className="divide-y divide-subtle">
                {[
                  { label: 'Domain', value: alert.domain, href: `https://${alert.domain}`, icon: ExternalLink },
                  { label: 'Registrar', value: 'NameCheap, Inc.' },
                  { label: 'Registered', value: '2024-03-14' },
                  { label: 'Country', value: 'United States' },
                  { label: 'Status', value: alert.status === 'resolved' ? 'Resolved' : alert.status === 'investigating' ? 'Under Investigation' : 'New', highlight: alert.status !== 'resolved' },
                ].map((row, i) => (
                  <div key={i} className="flex items-center justify-between px-4 py-3">
                    <span className="text-muted text-sm">{row.label}</span>
                    {row.href ? (
                      <a href={row.href} target="_blank" rel="noreferrer" className="text-secondary hover:text-primary transition-colors inline-flex items-center gap-1 text-sm">
                        {row.value} <ExternalLink className="h-3 w-3" />
                      </a>
                    ) : (
                      <span className={`text-sm ${row.highlight ? 'text-red-400' : 'text-body'}`}>{row.value}</span>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Affected Asset */}
            <div className="bg-elevated border border-subtle rounded-xl overflow-hidden">
              <div className="px-4 py-3 border-b border-subtle flex items-center gap-2">
                <Shield className="h-4 w-4 text-muted" />
                <h2 className="text-sm font-medium text-primary">Affected Asset</h2>
              </div>
              <div className="p-4">
                <div className="flex items-center gap-3 mb-4">
                  <div className={`h-12 w-12 rounded-xl bg-gradient-to-br ${alert.thumb} flex items-center justify-center shrink-0`}>
                    <TypeIcon className="h-6 w-6 text-white/60" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-primary">{alert.asset}</p>
                    <p className="text-xs text-muted capitalize">{alert.type} · {alert.status.replace('-', ' ')}</p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-muted text-xs">Reach</span>
                    <p className="text-body mt-0.5">{alert.impressions}</p>
                  </div>
                  <div>
                    <span className="text-muted text-xs">Detected</span>
                    <p className="text-body mt-0.5">{alert.date}</p>
                  </div>
                  <div>
                    <span className="text-muted text-xs">Type</span>
                    <p className="text-body mt-0.5 capitalize">{alert.type}</p>
                  </div>
                  <div>
                    <span className="text-muted text-xs">Status</span>
                    <p className="text-body mt-0.5 capitalize">{alert.status.replace('-', ' ')}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Contact & Enforcement - full width */}
          <div className="bg-elevated border border-subtle rounded-xl overflow-hidden">
            <div className="px-4 py-3 border-b border-subtle flex items-center gap-2">
              <Mail className="h-4 w-4 text-muted" />
              <h2 className="text-sm font-medium text-primary">Contact & Enforcement</h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 divide-y sm:divide-y-0 sm:divide-x divide-subtle">
              <a href={`mailto:abuse@${alert.domain}`} className="flex items-center gap-3 px-4 py-4 hover:bg-zinc-900/50 transition-colors group">
                <div className="h-9 w-9 rounded-lg bg-zinc-800/50 flex items-center justify-center shrink-0">
                  <Mail className="h-4 w-4 text-muted group-hover:text-primary transition-colors" />
                </div>
                <div>
                  <p className="text-xs text-muted">Email</p>
                  <p className="text-sm text-secondary group-hover:text-primary transition-colors">abuse@{alert.domain}</p>
                </div>
              </a>
              <a href={`tel:+12025551234`} className="flex items-center gap-3 px-4 py-4 hover:bg-zinc-900/50 transition-colors group">
                <div className="h-9 w-9 rounded-lg bg-zinc-800/50 flex items-center justify-center shrink-0">
                  <Phone className="h-4 w-4 text-muted group-hover:text-primary transition-colors" />
                </div>
                <div>
                  <p className="text-xs text-muted">Phone</p>
                  <p className="text-sm text-secondary group-hover:text-primary transition-colors">+1 (202) 555-1234</p>
                </div>
              </a>
              <a href={`https://${alert.domain}/contact`} target="_blank" rel="noreferrer" className="flex items-center gap-3 px-4 py-4 hover:bg-zinc-900/50 transition-colors group">
                <div className="h-9 w-9 rounded-lg bg-zinc-800/50 flex items-center justify-center shrink-0">
                  <ExternalLink className="h-4 w-4 text-muted group-hover:text-primary transition-colors" />
                </div>
                <div>
                  <p className="text-xs text-muted">Website</p>
                  <p className="text-sm text-secondary group-hover:text-primary transition-colors">{alert.domain}/contact</p>
                </div>
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
