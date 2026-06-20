export interface AlertData {
  asset: string
  type: string
  thumb: string
  domain: string
  violation: string
  severity: 'critical' | 'warning' | 'safe'
  impact: string
  impressions: string
  date: string
  status: string
}

export const alerts: AlertData[] = [
  {
    asset: 'Summer Collection — Hero Shot',
    type: 'image',
    thumb: 'from-rose-500/20 to-orange-500/20',
    domain: 'luxewear.com',
    violation: 'Unauthorized Replica',
    severity: 'critical',
    impact: 'Sold at $29.99 — 58% below MSRP',
    impressions: '12.4K',
    date: '2026-06-20',
    status: 'new',
  },
  {
    asset: 'Summer Collection — Hero Shot',
    type: 'image',
    thumb: 'from-rose-500/20 to-orange-500/20',
    domain: 'shopmart.io',
    violation: 'MAP Violation',
    severity: 'warning',
    impact: 'Listed at $39.99 — MSRP $79.99',
    impressions: '4.2K',
    date: '2026-06-19',
    status: 'new',
  },
  {
    asset: 'Product Video — 30s Ad',
    type: 'video',
    thumb: 'from-blue-500/20 to-cyan-500/20',
    domain: 'trendbay.net',
    violation: 'Unauthorized Replica',
    severity: 'critical',
    impact: 'Stolen video used in Facebook Ads',
    impressions: '8.7K',
    date: '2026-06-18',
    status: 'investigating',
  },
  {
    asset: 'Holiday Campaign — Banner',
    type: 'image',
    thumb: 'from-emerald-500/20 to-teal-500/20',
    domain: 'fashionhub.net',
    violation: 'MAP Violation',
    severity: 'warning',
    impact: 'Discounted to $24.99 — 50% off MSRP',
    impressions: '2.1K',
    date: '2026-06-17',
    status: 'investigating',
  },
  {
    asset: 'Spring Line — Detail Shots',
    type: 'image',
    thumb: 'from-pink-500/20 to-red-500/20',
    domain: 'stylesphere.io',
    violation: 'Unauthorized Replica',
    severity: 'critical',
    impact: 'Full product set copied on landing page',
    impressions: '6.3K',
    date: '2026-06-16',
    status: 'new',
  },
  {
    asset: 'Influencer Collateral Pack',
    type: 'image',
    thumb: 'from-amber-500/20 to-yellow-500/20',
    domain: 'trendbay.net',
    violation: 'Status Clear',
    severity: 'safe',
    impact: 'Site removed — enforcement completed',
    impressions: '—',
    date: '2026-06-15',
    status: 'resolved',
  },
  {
    asset: 'Lookbook Page 1-5',
    type: 'document',
    thumb: 'from-violet-500/20 to-purple-500/20',
    domain: 'luxewear.com',
    violation: 'Status Clear',
    severity: 'safe',
    impact: 'DMCA takedown successful',
    impressions: '—',
    date: '2026-06-14',
    status: 'resolved',
  },
]
