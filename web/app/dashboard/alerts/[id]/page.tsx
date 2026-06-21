'use client'

import { useParams, useRouter } from 'next/navigation'
import { ArrowLeft, ExternalLink, Mail, Search } from 'lucide-react'
import { getScanResultById } from '@/lib/db'
import { useQuery } from '@tanstack/react-query'

function hostname(url: string) {
  try { return new URL(url).hostname.replace('www.', '') }
  catch { return url }
}

export default function AlertDetailPage() {
  const { id } = useParams()
  const router = useRouter()

  const { data: alert, isLoading } = useQuery({
    queryKey: ['scan-result', Number(id)],
    queryFn: () => getScanResultById(Number(id)),
  })

  if (isLoading) {
    return (
      <div className="flex-1 min-h-0 flex items-center justify-center">
        <div className="animate-pulse space-y-4 max-w-2xl w-full px-4">
          <div className="h-4 w-24 rounded bg-zinc-800" />
          <div className="h-8 w-64 rounded bg-zinc-800" />
          <div className="h-4 w-48 rounded bg-zinc-800/50" />
          <div className="h-32 rounded bg-zinc-800/30" />
        </div>
      </div>
    )
  }

  if (!alert) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <p className="text-secondary text-sm">Alert not found.</p>
      </div>
    )
  }

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
            <span className="text-xs font-medium uppercase tracking-wider text-amber-500">Match</span>
            <span className="text-muted text-xs">·</span>
            <span className="text-muted text-xs">{new Date(alert.detected_at).toLocaleDateString()}</span>
          </div>

          {/* Title */}
          <h1 className="text-3xl sm:text-4xl font-semibold text-primary leading-tight mb-4">
            {alert.page_title || 'Detected Match'}
          </h1>

          {/* Tracking ID byline */}
          <p className="text-secondary text-sm mb-2">
            <Search className="h-3.5 w-3.5 inline mr-1.5 align-text-top text-muted" />
            Tracking: <code className="text-amber-400">{alert.tracking_id}</code>
          </p>

          {/* Summary */}
          <div className="mt-8 text-body text-sm leading-relaxed space-y-4">
            <p>
              On <span className="text-primary font-medium">{new Date(alert.detected_at).toLocaleDateString()}</span>, our scanner detected a match on{' '}
              <a href={alert.matched_url} target="_blank" rel="noreferrer" className="text-secondary hover:text-primary underline underline-offset-2 transition-colors inline-flex items-center gap-1">
                {hostname(alert.matched_url)} <ExternalLink className="h-3 w-3" />
              </a>
              .
            </p>
            {alert.impact_summary && <p>{alert.impact_summary}</p>}
          </div>

          {/* Divider */}
          <div className="my-10 border-t border-subtle" />

          {/* Details */}
          <div className="space-y-3">
            <p className="text-xs text-muted uppercase tracking-wider font-medium">Details</p>
            <div className="space-y-2 text-sm">
              <div>
                <span className="text-muted">URL: </span>
                <a href={alert.matched_url} target="_blank" rel="noreferrer" className="text-secondary hover:text-primary underline underline-offset-2 transition-colors">
                  {alert.matched_url}
                </a>
              </div>
              {alert.matched_image_url && (
                <div>
                  <span className="text-muted">Matched image: </span>
                  <a href={alert.matched_image_url} target="_blank" rel="noreferrer" className="text-secondary hover:text-primary underline underline-offset-2 transition-colors">
                    View image
                  </a>
                </div>
              )}
              {alert.site_email && (
                <div className="flex items-center gap-2">
                  <Mail className="h-3.5 w-3.5 text-muted" />
                  <a href={`mailto:${alert.site_email}`} className="text-secondary hover:text-primary transition-colors">
                    {alert.site_email}
                  </a>
                </div>
              )}
              <div>
                <span className="text-muted">Tracking ID: </span>
                <code className="text-amber-400">{alert.tracking_id}</code>
              </div>
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