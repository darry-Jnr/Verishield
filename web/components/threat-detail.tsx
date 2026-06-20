'use client'

import { X, ExternalLink, Globe, Mail, Phone, Shield, Image, AlertTriangle } from 'lucide-react'

interface ThreatDetailProps {
  open: boolean
  onClose: () => void
  alert: {
    domain: string
    violation: string
    severity: string
    asset: string
    impact: string
    impressions: string
    date: string
    status: string
    type?: string
    thumb?: string
  } | null
}

const whoisData: Record<string, { registrar: string; owner: string; email: string; phone: string; created: string; country: string }> = {
  'luxewear.com': {
    registrar: 'GoDaddy LLC',
    owner: 'Luxe Fashion Group',
    email: 'legal@luxewear.com',
    phone: '+1 (212) 555-0192',
    created: '2024-03-15',
    country: 'United States',
  },
  'shopmart.io': {
    registrar: 'Namecheap Inc.',
    owner: 'Redwood Holdings LTD',
    email: 'contact@shopmart.io',
    phone: '+44 20 7123 4567',
    created: '2025-01-22',
    country: 'United Kingdom',
  },
  'trendbay.net': {
    registrar: 'Cloudflare Inc.',
    owner: 'Trendbay Operations',
    email: 'abuse@trendbay.net',
    phone: '+1 (415) 555-0187',
    created: '2024-11-08',
    country: 'United States',
  },
  'fashionhub.net': {
    registrar: 'Namecheap Inc.',
    owner: 'FashionHub PTE LTD',
    email: 'dmca@fashionhub.net',
    phone: '+65 6789 0123',
    created: '2025-02-14',
    country: 'Singapore',
  },
  'stylesphere.io': {
    registrar: 'GoDaddy LLC',
    owner: 'StyleSphere Inc.',
    email: 'info@stylesphere.io',
    phone: '+1 (310) 555-0241',
    created: '2024-06-30',
    country: 'United States',
  },
  'quickcart.org': {
    registrar: 'Porkbun LLC',
    owner: 'QuickCart Enterprises',
    email: 'support@quickcart.org',
    phone: '+1 (503) 555-0332',
    created: '2025-04-01',
    country: 'United States',
  },
  'copybay.net': {
    registrar: 'Namecheap Inc.',
    owner: 'Private Registration',
    email: 'admin@copybay.net',
    phone: '+1 (302) 555-0100',
    created: '2025-05-10',
    country: 'United States',
  },
  'dealfinder.io': {
    registrar: 'Cloudflare Inc.',
    owner: 'DealFinder Group',
    email: 'legal@dealfinder.io',
    phone: '+1 (512) 555-0456',
    created: '2025-03-20',
    country: 'United States',
  },
}

const getContactInfo = (alert: NonNullable<ThreatDetailProps['alert']>) => {
  return whoisData[alert.domain] || {
    registrar: 'Unknown',
    owner: 'Unknown',
    email: `abuse@${alert.domain}`,
    phone: 'Unlisted',
    created: 'Unknown',
    country: 'Unknown',
  }
}

export default function ThreatDetail({ open, onClose, alert }: ThreatDetailProps) {
  if (!open || !alert) return null

  const whois = getContactInfo(alert)
  const isCritical = alert.severity?.toLowerCase() === 'critical'
  const isWarning = alert.severity?.toLowerCase() === 'warning'

  return (
    <>
      {/* Backdrop with elegant fade overlay */}
      <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs transition-opacity" onClick={onClose} />

      {/* Side Slide-out Panel Layer */}
      <div 
        className="fixed inset-y-0 right-0 z-50 w-full max-w-lg border-l border-zinc-800 bg-[#111111] shadow-2xl overflow-y-auto flex flex-col font-sans"
        style={{ animation: 'slideIn 0.2s cubic-bezier(0.16, 1, 0.3, 1) forwards' }}
      >
        <style>{`@keyframes slideIn{from{transform:translateX(100%)}to{transform:translateX(0)}}`}</style>

        {/* Top Boundary Bar */}
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-zinc-800 bg-[#111111]/90 backdrop-blur-md px-6 py-4">
          <div className="flex items-center gap-2.5">
            <Shield className="h-4 w-4 text-white" />
            <span className="text-white text-sm font-medium tracking-tight">Threat Assessment</span>
          </div>
          <button 
            onClick={onClose} 
            className="text-zinc-400 hover:text-white border border-transparent hover:border-zinc-800 p-1 transition-all"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Core Main Panel Scroll Window */}
        <div className="p-6 space-y-6 flex-1">
          
          {/* Laser Alert Status Banner */}
          <div className={`border px-4 py-3.5 ${
            isCritical ? 'bg-red-500/5 border-red-500/20' :
            isWarning ? 'bg-orange-500/5 border-orange-500/20' :
            'bg-emerald-500/5 border-emerald-500/20'
          }`}>
            <div className="flex items-center gap-2.5">
              <AlertTriangle className={`h-4 w-4 ${
                isCritical ? 'text-red-500' :
                isWarning ? 'text-orange-500' :
                'text-emerald-500'
              }`} />
              <span className={`text-xs font-mono font-bold tracking-wider uppercase ${
                isCritical ? 'text-red-400' :
                isWarning ? 'text-orange-400' :
                'text-emerald-400'
              }`}>
                {isCritical ? 'CRITICAL_LEAK_DETECTED' :
                 isWarning ? 'MAP_COMPLIANCE_WARNING' :
                 'CASE_RESOLVED'}
              </span>
            </div>
            <p className="text-zinc-200 text-sm font-medium mt-2">{alert.violation}</p>
            <p className="text-zinc-500 font-mono text-[11px] mt-1">LOGGED: {alert.date}</p>
          </div>

          {/* Whois Domain Registry Metrics Card */}
          <div>
            <h3 className="text-zinc-400 text-xs font-medium uppercase tracking-wider mb-3 flex items-center gap-2">
              <Globe className="h-3.5 w-3.5 text-zinc-500" />
              Domain Infrastructure
            </h3>
            <div className="bg-black border border-zinc-800 divide-y divide-zinc-800">
              {[
                { label: 'Infringing Target', value: alert.domain, isMono: true },
                { label: 'Domain Registrar', value: whois.registrar },
                { label: 'Reported Operator', value: whois.owner },
                { label: 'Hosting Geo', value: whois.country },
                { label: 'Domain Age Record', value: whois.created, isMono: true },
              ].map((f) => (
                <div key={f.label} className="flex items-center justify-between px-4 py-3">
                  <span className="text-zinc-400 text-xs">{f.label}</span>
                  <span className={`text-white text-xs text-right truncate max-w-[65%] ${f.isMono ? 'font-mono' : ''}`}>
                    {f.value}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Action Blocks Container */}
          <div>
            <h3 className="text-zinc-400 text-xs font-medium uppercase tracking-wider mb-3 flex items-center gap-2">
              <Mail className="h-3.5 w-3.5 text-zinc-500" />
              Enforcement Actions
            </h3>
            <div className="space-y-2">
              <a
                href={`mailto:${whois.email}?subject=IMMEDIATE TAKE DOWN NOTICE: Intellectual Property Infringement at ${alert.domain}`}
                className="flex items-center gap-4 bg-black border border-zinc-800 px-4 py-3.5 hover:bg-zinc-900/50 hover:border-zinc-700 transition-all group"
              >
                <div className="p-2 border border-zinc-800 bg-zinc-950 text-zinc-400 group-hover:text-white group-hover:border-zinc-700 transition-colors">
                  <Mail className="h-4 w-4" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-white text-xs font-medium">Generate DMCA Cease & Desist</p>
                  <p className="text-zinc-500 font-mono text-[11px] truncate mt-0.5">{whois.email}</p>
                </div>
                <ExternalLink className="h-3.5 w-3.5 text-zinc-600 group-hover:text-zinc-400 transition-colors" />
              </a>

              <a
                href={`https://${alert.domain}`}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-4 bg-black border border-zinc-800 px-4 py-3.5 hover:bg-zinc-900/50 hover:border-zinc-700 transition-all group"
              >
                <div className="p-2 border border-zinc-800 bg-zinc-950 text-zinc-400 group-hover:text-white group-hover:border-zinc-700 transition-colors">
                  <ExternalLink className="h-4 w-4" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-white text-xs font-medium">Inspect Infringing Marketplace</p>
                  <p className="text-zinc-500 font-mono text-[11px] truncate mt-0.5">https://{alert.domain}</p>
                </div>
                <ExternalLink className="h-3.5 w-3.5 text-zinc-600 group-hover:text-zinc-400 transition-colors" />
              </a>
            </div>
          </div>

          {/* Secure Registered Media Fingerprints */}
          <div>
            <h3 className="text-zinc-400 text-xs font-medium uppercase tracking-wider mb-3 flex items-center gap-2">
              <Image className="h-3.5 w-3.5 text-zinc-500" />
              Protected Brand Asset Details
            </h3>
            <div className="bg-black border border-zinc-800 divide-y divide-zinc-800">
              {[
                { label: 'Asset Identifier', value: alert.asset },
                { label: 'Media Track Format', value: alert.type || 'IMAGE/STATIC', isMono: true },
                { label: 'Estimated Vector Harm', value: alert.impact },
                { label: 'Logged Tracker Reach', value: alert.impressions !== '—' ? `${alert.impressions} impressions` : '0 (Initial Phase)', isMono: true },
                { label: 'System Action Status', value: alert.status },
              ].map((f) => (
                <div key={f.label} className="flex items-center justify-between px-4 py-3">
                  <span className="text-zinc-400 text-xs">{f.label}</span>
                  <span className={`text-white text-xs text-right max-w-[60%] truncate ${f.isMono ? 'font-mono text-zinc-300' : ''}`}>
                    {f.value}
                  </span>
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* Fixed Vercel Pure-Contrast Control Footer */}
        <div className="sticky bottom-0 border-t border-zinc-800 bg-[#111111] p-4">
          <button
            onClick={onClose}
            className="w-full bg-white hover:bg-zinc-200 text-black text-xs font-medium py-2.5 transition-all focus:outline-none"
          >
            Dismiss View
          </button>
        </div>
      </div>
    </>
  )
}