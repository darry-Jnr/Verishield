export interface AlertData {
  asset: string
  type: string
  thumb: string
  domain: string
  folderId: number
  folderName: string
  violation: string
  severity: 'critical' | 'warning' | 'safe'
  impact: string
  date: string
  status: string
}

export const alerts: AlertData[] = [
  {
    asset: 'Summer Collection — Hero Shot',
    type: 'image',
    thumb: 'from-rose-500/20 to-orange-500/20',
    domain: 'luxewear.com',
    folderId: 1,
    folderName: 'Summer Collection',
    violation: 'Unauthorized Replica',
    severity: 'critical',
    impact: 'Sold at $29.99 — 58% below MSRP',
    date: '2026-06-20',
    status: 'new',
  },
  {
    asset: 'Summer Collection — Hero Shot',
    type: 'image',
    thumb: 'from-rose-500/20 to-orange-500/20',
    domain: 'shopmart.io',
    folderId: 1,
    folderName: 'Summer Collection',
    violation: 'MAP Violation',
    severity: 'warning',
    impact: 'Listed at $39.99 — MSRP $79.99',
    date: '2026-06-19',
    status: 'new',
  },
  {
    asset: 'Product Video — 30s Ad',
    type: 'video',
    thumb: 'from-blue-500/20 to-cyan-500/20',
    domain: 'trendbay.net',
    folderId: 2,
    folderName: 'Product Videos',
    violation: 'Unauthorized Replica',
    severity: 'critical',
    impact: 'Stolen video used in Facebook Ads',
    date: '2026-06-18',
    status: 'investigating',
  },
  {
    asset: 'Holiday Campaign — Banner',
    type: 'image',
    thumb: 'from-emerald-500/20 to-teal-500/20',
    domain: 'fashionhub.net',
    folderId: 3,
    folderName: 'Holiday Campaign',
    violation: 'MAP Violation',
    severity: 'warning',
    impact: 'Discounted to $24.99 — 50% off MSRP',
    date: '2026-06-17',
    status: 'investigating',
  },
  {
    asset: 'Spring Line — Detail Shots',
    type: 'image',
    thumb: 'from-pink-500/20 to-red-500/20',
    domain: 'stylesphere.io',
    folderId: 4,
    folderName: 'Spring Line',
    violation: 'Unauthorized Replica',
    severity: 'critical',
    impact: 'Full product set copied on landing page',
    date: '2026-06-16',
    status: 'new',
  },
  {
    asset: 'Influencer Collateral Pack',
    type: 'image',
    thumb: 'from-amber-500/20 to-yellow-500/20',
    domain: 'trendbay.net',
    folderId: 5,
    folderName: 'Influencer Packs',
    violation: 'Status Clear',
    severity: 'safe',
    impact: 'Site removed — enforcement completed',
    date: '2026-06-15',
    status: 'resolved',
  },
  {
    asset: 'Lookbook Page 1-5',
    type: 'document',
    thumb: 'from-violet-500/20 to-purple-500/20',
    domain: 'luxewear.com',
    folderId: 6,
    folderName: 'Lookbook',
    violation: 'Status Clear',
    severity: 'safe',
    impact: 'DMCA takedown successful',
    date: '2026-06-14',
    status: 'resolved',
  },
]
