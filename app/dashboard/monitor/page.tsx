import { Globe, Image } from 'lucide-react'

const findings = [
  { domain: 'luxewear.com', asset: 'Summer Collection — Hero Shot', match: '95%', status: 'unauthorized', found: '2026-06-20' },
  { domain: 'trendbay.net', asset: 'Product Video — 30s Ad', match: '88%', status: 'unauthorized', found: '2026-06-19' },
  { domain: 'shopmart.io', asset: 'Summer Collection — Hero Shot', match: '92%', status: 'unauthorized', found: '2026-06-18' },
  { domain: 'officialstore.com', asset: 'Lookbook Page 1-5', match: '100%', status: 'authorized', found: '2026-06-17' },
  { domain: 'fashionhub.net', asset: 'Holiday Campaign — Banner', match: '78%', status: 'unauthorized', found: '2026-06-16' },
  { domain: 'retailplus.com', asset: 'Influencer Collateral Pack', match: '100%', status: 'authorized', found: '2026-06-15' },
  { domain: 'stylesphere.io', asset: 'Spring Line — Detail Shots', match: '85%', status: 'unauthorized', found: '2026-06-14' },
]

export default function MonitorPage() {
  return (
    <div className="p-4 sm:p-8">
      <div className="mb-6">
        <h1 className="text-primary text-xl sm:text-2xl font-medium">Monitor</h1>
        <p className="text-secondary mt-1 text-sm">Live web monitoring — domains using your assets.</p>
      </div>

      {/* Mobile cards */}
      <div className="space-y-3 sm:hidden">
        {findings.map((f) => (
          <div key={f.domain + f.asset} className="surface rounded-xl border border-subtle p-4">
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <Globe className="h-4 w-4 shrink-0 text-secondary" />
                  <span className="text-primary text-sm truncate">{f.domain}</span>
                </div>
                <div className="flex items-center gap-2 mt-1.5">
                  <Image className="h-3.5 w-3.5 shrink-0 text-muted" />
                  <span className="text-secondary text-xs truncate">{f.asset}</span>
                </div>
              </div>
              <span className={`shrink-0 rounded-full px-2 py-0.5 text-[11px] font-medium ${
                f.status === 'unauthorized' ? 'text-threat-critical bg-threat-critical' : 'text-emerald-500 bg-emerald-500/10'
              }`}>{f.status}</span>
            </div>
            <div className="mt-2 flex items-center gap-3 text-xs text-muted">
              <span>Match: {f.match}</span>
              <span>{f.found}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Desktop table */}
      <div className="hidden sm:block surface rounded-xl border border-subtle overflow-x-auto">
        <div className="grid grid-cols-[1fr_1.5fr_100px_120px] gap-4 border-b border-subtle px-5 py-3 text-xs text-muted min-w-[550px]">
          <span>Domain</span>
          <span>Asset</span>
          <span className="text-center">Match</span>
          <span className="text-right">Status</span>
        </div>
        {findings.map((f) => (
          <div key={f.domain + f.asset} className="grid grid-cols-[1fr_1.5fr_100px_120px] gap-4 border-b border-subtle px-5 py-3.5 last:border-0 items-center min-w-[550px]">
            <div className="flex items-center gap-2 min-w-0">
              <Globe className="h-4 w-4 shrink-0 text-secondary" />
              <span className="text-primary text-sm truncate">{f.domain}</span>
            </div>
            <div className="flex items-center gap-2 min-w-0">
              <Image className="h-4 w-4 shrink-0 text-secondary" />
              <span className="text-secondary text-sm truncate">{f.asset}</span>
            </div>
            <span className="text-secondary text-sm text-center">{f.match}</span>
            <span className={`text-right text-xs font-medium ${
              f.status === 'unauthorized' ? 'text-threat-critical' : 'text-emerald-500'
            }`}>{f.status}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
