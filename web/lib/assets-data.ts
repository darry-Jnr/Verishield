export interface AssetFile {
  name: string
  type: string
  size: string
  thumb: string
}

export interface Asset {
  id: string
  name: string
  type: string
  date: string
  matches: number
  status: string
  thumb: string
  brand: string
  campaign: string
  files: AssetFile[]
}

export const assets: Asset[] = [
  {
    id: 'summer-collection',
    name: 'Summer Collection — Hero Shot',
    type: 'image',
    date: '2026-06-18',
    matches: 4,
    status: 'active',
    thumb: 'from-rose-500/20 to-orange-500/20',
    brand: 'Acme Brands',
    campaign: 'Summer 2026',
    files: [
      { name: 'hero-front.jpg', type: 'image', size: '2.4 MB', thumb: 'from-rose-500/30 to-orange-500/30' },
      { name: 'hero-angle.jpg', type: 'image', size: '1.8 MB', thumb: 'from-rose-500/30 to-orange-500/30' },
      { name: 'hero-detail.jpg', type: 'image', size: '3.1 MB', thumb: 'from-rose-500/30 to-orange-500/30' },
    ],
  },
  {
    id: 'product-video',
    name: 'Product Video — 30s Ad',
    type: 'video',
    date: '2026-06-17',
    matches: 2,
    status: 'active',
    thumb: 'from-blue-500/20 to-cyan-500/20',
    brand: 'Acme Brands',
    campaign: 'Summer 2026',
    files: [
      { name: 'ad-30s-final.mp4', type: 'video', size: '24.6 MB', thumb: 'from-blue-500/30 to-cyan-500/30' },
      { name: 'ad-thumbnail.png', type: 'image', size: '0.4 MB', thumb: 'from-blue-500/30 to-cyan-500/30' },
    ],
  },
  {
    id: 'lookbook',
    name: 'Lookbook Page 1-5',
    type: 'document',
    date: '2026-06-15',
    matches: 0,
    status: 'active',
    thumb: 'from-violet-500/20 to-purple-500/20',
    brand: 'Acme Brands',
    campaign: 'Spring 2026',
    files: [
      { name: 'lookbook-p1.pdf', type: 'application', size: '5.2 MB', thumb: 'from-violet-500/30 to-purple-500/30' },
      { name: 'lookbook-p2.pdf', type: 'application', size: '4.8 MB', thumb: 'from-violet-500/30 to-purple-500/30' },
      { name: 'lookbook-p3.pdf', type: 'application', size: '5.1 MB', thumb: 'from-violet-500/30 to-purple-500/30' },
      { name: 'lookbook-p4.pdf', type: 'application', size: '4.9 MB', thumb: 'from-violet-500/30 to-purple-500/30' },
      { name: 'lookbook-p5.pdf', type: 'application', size: '5.0 MB', thumb: 'from-violet-500/30 to-purple-500/30' },
    ],
  },
  {
    id: 'holiday-campaign',
    name: 'Holiday Campaign — Banner',
    type: 'image',
    date: '2026-06-12',
    matches: 6,
    status: 'active',
    thumb: 'from-emerald-500/20 to-teal-500/20',
    brand: 'Acme Brands',
    campaign: 'Holiday 2026',
    files: [
      { name: 'banner-desktop.png', type: 'image', size: '3.6 MB', thumb: 'from-emerald-500/30 to-teal-500/30' },
      { name: 'banner-mobile.png', type: 'image', size: '1.2 MB', thumb: 'from-emerald-500/30 to-teal-500/30' },
      { name: 'banner-tablet.png', type: 'image', size: '2.1 MB', thumb: 'from-emerald-500/30 to-teal-500/30' },
    ],
  },
  {
    id: 'influencer-collateral',
    name: 'Influencer Collateral Pack',
    type: 'image',
    date: '2026-06-10',
    matches: 1,
    status: 'active',
    thumb: 'from-amber-500/20 to-yellow-500/20',
    brand: 'Acme Brands',
    campaign: 'Influencer Q2',
    files: [
      { name: 'collateral-photo-1.jpg', type: 'image', size: '4.2 MB', thumb: 'from-amber-500/30 to-yellow-500/30' },
      { name: 'collateral-photo-2.jpg', type: 'image', size: '3.8 MB', thumb: 'from-amber-500/30 to-yellow-500/30' },
      { name: 'collateral-photo-3.jpg', type: 'image', size: '5.0 MB', thumb: 'from-amber-500/30 to-yellow-500/30' },
      { name: 'usage-guide.pdf', type: 'application', size: '1.5 MB', thumb: 'from-amber-500/30 to-yellow-500/30' },
    ],
  },
  {
    id: 'spring-line',
    name: 'Spring Line — Detail Shots',
    type: 'image',
    date: '2026-06-08',
    matches: 3,
    status: 'archived',
    thumb: 'from-pink-500/20 to-red-500/20',
    brand: 'Acme Brands',
    campaign: 'Spring 2026',
    files: [
      { name: 'detail-front.jpg', type: 'image', size: '2.8 MB', thumb: 'from-pink-500/30 to-red-500/30' },
      { name: 'detail-back.jpg', type: 'image', size: '2.6 MB', thumb: 'from-pink-500/30 to-red-500/30' },
      { name: 'detail-side.jpg', type: 'image', size: '2.5 MB', thumb: 'from-pink-500/30 to-red-500/30' },
      { name: 'detail-closeup.jpg', type: 'image', size: '3.3 MB', thumb: 'from-pink-500/30 to-red-500/30' },
    ],
  },
]
