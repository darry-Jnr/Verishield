import { Upload } from 'lucide-react'
import Link from 'next/link'

const alerts = [
  { threat: 'Unauthorized Replica Detected', brand: 'luxewear.com', level: 'critical', time: '2m ago' },
  { threat: 'MAP Violation — 40% below MSRP', brand: 'shopmart.io', level: 'warning', time: '15m ago' },
  { threat: 'Status Clear — Enforcement Sent', brand: 'trendbay.net', level: 'safe', time: '1h ago' },
]

export default function DashboardPage() {
  return (
    <div className="p-4 sm:p-8">
      <div className="mb-6 sm:mb-8">
        <h1 className="text-primary text-xl sm:text-2xl font-medium">Dashboard</h1>
        <p className="text-secondary mt-1 text-sm">Overview of your brand intelligence.</p>
      </div>

      <div className="mb-6 sm:mb-8 grid gap-4 grid-cols-2 lg:grid-cols-4">
        {[
          { label: 'Registered Assets', value: '12' },
          { label: 'Active Monitorings', value: '8' },
          { label: 'Threats Flagged', value: '3' },
          { label: 'Resolved', value: '5' },
        ].map((s) => (
          <div key={s.label} className="surface rounded-xl border border-subtle p-4 sm:p-5">
            <p className="text-secondary text-xs">{s.label}</p>
            <p className="text-primary mt-1 text-xl sm:text-2xl font-medium">{s.value}</p>
          </div>
        ))}
      </div>

      <Link
        href="/dashboard/assets"
        className="elevated mb-6 sm:mb-8 flex items-center gap-4 rounded-xl border border-subtle p-4 sm:p-5 transition-colors hover:border-zinc-700"
      >
        <div className="flex h-10 w-10 sm:h-12 sm:w-12 shrink-0 items-center justify-center rounded-xl border border-dashed border-zinc-600">
          <Upload className="h-4 w-4 sm:h-5 sm:w-5 text-secondary" />
        </div>
        <div className="min-w-0">
          <p className="text-primary text-sm font-medium">Register a new asset</p>
          <p className="text-muted text-xs">Upload product media to start monitoring.</p>
        </div>
      </Link>

      <div className="surface rounded-xl border border-subtle">
        <div className="flex items-center justify-between border-b border-subtle px-4 sm:px-5 py-3">
          <h2 className="text-primary text-sm font-medium">Recent Alerts</h2>
          <Link href="/dashboard/alerts" className="text-muted text-xs hover:text-secondary transition-colors">
            View all
          </Link>
        </div>
        {alerts.map((a) => (
          <div key={a.time} className="flex items-center justify-between border-b border-subtle px-4 sm:px-5 py-3.5 last:border-0">
            <div className="flex items-center gap-3 min-w-0">
              <span className={`h-2 w-2 shrink-0 rounded-full ${
                a.level === 'critical' ? 'bg-red-500' : a.level === 'warning' ? 'bg-orange-500' : 'bg-emerald-500'
              }`} />
              <div className="min-w-0">
                <p className={`text-sm font-medium truncate ${
                  a.level === 'critical' ? 'text-threat-critical' : a.level === 'warning' ? 'text-threat-warning' : 'text-threat-safe'
                }`}>{a.threat}</p>
                <p className="text-muted text-xs">{a.brand}</p>
              </div>
            </div>
            <span className="text-muted text-xs shrink-0">{a.time}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
