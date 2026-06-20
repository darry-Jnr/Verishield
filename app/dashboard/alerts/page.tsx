const alerts = [
  { type: 'Unauthorized Replica', source: 'luxewear.com', asset: 'Summer Collection — Hero Shot', severity: 'critical', date: '2026-06-20', status: 'new' },
  { type: 'MAP Violation', source: 'shopmart.io', asset: 'Summer Collection — Hero Shot', severity: 'warning', date: '2026-06-19', status: 'new' },
  { type: 'Unauthorized Replica', source: 'trendbay.net', asset: 'Product Video — 30s Ad', severity: 'critical', date: '2026-06-18', status: 'investigating' },
  { type: 'MAP Violation', source: 'fashionhub.net', asset: 'Holiday Campaign — Banner', severity: 'warning', date: '2026-06-17', status: 'investigating' },
  { type: 'Unauthorized Replica', source: 'stylesphere.io', asset: 'Spring Line — Detail Shots', severity: 'critical', date: '2026-06-16', status: 'new' },
  { type: 'Status Clear', source: 'trendbay.net', asset: 'Influencer Collateral Pack', severity: 'safe', date: '2026-06-15', status: 'resolved' },
  { type: 'Status Clear', source: 'luxewear.com', asset: 'Lookbook Page 1-5', severity: 'safe', date: '2026-06-14', status: 'resolved' },
]

const severityStyles = {
  critical: 'text-threat-critical bg-threat-critical border-threat-critical',
  warning: 'text-threat-warning bg-threat-warning border-threat-warning',
  safe: 'text-threat-safe bg-threat-safe border-threat-safe',
}

const statusDots = {
  new: 'bg-red-500',
  investigating: 'bg-orange-500',
  resolved: 'bg-emerald-500',
}

export default function AlertsPage() {
  return (
    <div className="p-4 sm:p-8">
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-primary text-xl sm:text-2xl font-medium">Alerts</h1>
          <p className="text-secondary mt-1 text-sm">All threats and violations flagged by the system.</p>
        </div>
        <div className="flex flex-wrap items-center gap-3 text-xs text-secondary">
          <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-red-500" />3 New</span>
          <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-orange-500" />2 Investigating</span>
          <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-emerald-500" />2 Resolved</span>
        </div>
      </div>

      <div className="space-y-3">
        {alerts.map((a, i) => (
          <div key={i} className="surface flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-4 rounded-xl border border-subtle px-4 py-3.5 sm:px-5 sm:py-4">
            <div className="flex items-center gap-3 min-w-0">
              <span className={`h-2 w-2 shrink-0 rounded-full ${statusDots[a.status as keyof typeof statusDots]}`} />
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <p className="text-primary text-sm font-medium">{a.type}</p>
                  <span className={`rounded-full border px-2 py-0.5 text-[11px] font-medium ${severityStyles[a.severity as keyof typeof severityStyles]}`}>
                    {a.severity}
                  </span>
                </div>
                <p className="text-muted text-xs mt-0.5 truncate">{a.source} · {a.asset}</p>
              </div>
            </div>
            <span className="text-muted text-xs sm:ml-auto shrink-0">{a.date}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
