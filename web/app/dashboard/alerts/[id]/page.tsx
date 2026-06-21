'use client'

import { useParams, useRouter } from 'next/navigation'
import { ArrowLeft, ExternalLink, Mail, Phone, Image, FileText, Video } from 'lucide-react'
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
    critical: { text: 'text-red-500', label: 'Critical' },
    warning: { text: 'text-orange-500', label: 'Warning' },
    safe: { text: 'text-emerald-500', label: 'Clear' },
  }

  const s = severityStyles[alert.severity]
  const TypeIcon = alert.type === 'image' ? Image : alert.type === 'video' ? Video : FileText

  return (
    <div className="flex-1 min-h-0 flex flex-col">

      <div className="flex-1 overflow-auto">
        <article className="max-w-2xl mx-auto px-4 sm:px-6 py-8 sm:py-16">
          {/* Back link */}
          <div className="mb-8">
            <button onClick={() => router.back()} className="inline-flex items-center gap-1 text-xs text-muted hover:text-primary transition-colors">
              <ArrowLeft className="h-3 w-3" />
              Alerts
            </button>
          </div>

          {/* Status + date */}
          <div className="flex items-center gap-3 mb-8">
            <span className={`text-xs font-medium uppercase tracking-wider ${s.text}`}>{s.label}</span>
            <span className="text-muted text-xs">·</span>
            <span className="text-muted text-xs">{alert.date}</span>
          </div>

          {/* Title */}
          <h1 className="text-3xl sm:text-4xl font-semibold text-primary leading-tight mb-4">
            {alert.violation}
          </h1>

          {/* Asset byline */}
          <p className="text-secondary text-sm mb-2">
            <TypeIcon className="h-3.5 w-3.5 inline mr-1.5 align-text-top text-muted" />
            {alert.asset}
          </p>

          {/* Summary — what happened */}
          <div className="mt-8 text-body text-sm leading-relaxed space-y-4">
            <p>
              On <span className="text-primary font-medium">{alert.date}</span>, our scanner detected{' '}
              <span className="text-primary font-medium">{alert.asset}</span> being used on{' '}
              <a href={`https://${alert.domain}`} target="_blank" rel="noreferrer" className="text-secondary hover:text-primary underline underline-offset-2 transition-colors inline-flex items-center gap-1">
                {alert.domain} <ExternalLink className="h-3 w-3" />
              </a>
              {' '}without authorization.
            </p>
            <p>{alert.impact}</p>
          </div>

          {/* Divider */}
          <div className="my-10 border-t border-subtle" />

          {/* Contact */}
          <div className="space-y-3">
            <p className="text-xs text-muted uppercase tracking-wider font-medium">Contact</p>
            <div className="flex flex-wrap gap-3">
              <a
                href={`mailto:abuse@${alert.domain}`}
                className="inline-flex items-center gap-2 bg-elevated border border-subtle rounded-lg px-4 py-2.5 text-sm text-secondary hover:text-primary hover:border-zinc-600 transition-colors"
              >
                <Mail className="h-4 w-4" />
                abuse@{alert.domain}
              </a>
              <a
                href={`tel:+12025551234`}
                className="inline-flex items-center gap-2 bg-elevated border border-subtle rounded-lg px-4 py-2.5 text-sm text-secondary hover:text-primary hover:border-zinc-600 transition-colors"
              >
                <Phone className="h-4 w-4" />
                +1 (202) 555-1234
              </a>
              <a
                href={`https://${alert.domain}/contact`}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 bg-elevated border border-subtle rounded-lg px-4 py-2.5 text-sm text-secondary hover:text-primary hover:border-zinc-600 transition-colors"
              >
                <ExternalLink className="h-4 w-4" />
                {alert.domain}/contact
              </a>
            </div>
          </div>

          {/* Footer */}
          <div className="mt-12 pt-6 border-t border-subtle flex items-center justify-between">
            <span className="text-xs text-muted">AuraGuard Enforcement Report</span>
            <button onClick={() => router.back()} className="text-xs text-muted hover:text-primary transition-colors">
              &larr; Alerts
            </button>
          </div>
        </article>
      </div>
    </div>
  )
}
