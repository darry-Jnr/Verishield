import { User, Bell, Shield, CreditCard } from 'lucide-react'

const sections = [
  {
    icon: User,
    title: 'Profile',
    desc: 'Your name, email, and brand details.',
    fields: [
      { label: 'Full Name', value: 'Jane Doe' },
      { label: 'Email', value: 'jane@acmebrands.com' },
      { label: 'Brand', value: 'Acme Brands Inc.' },
      { label: 'Website', value: 'acmebrands.com' },
    ],
  },
  {
    icon: Bell,
    title: 'Notifications',
    desc: 'Which alerts trigger email or in-app notifications.',
    toggles: [
      { label: 'Unauthorized Replicas', on: true },
      { label: 'MAP Violations', on: true },
      { label: 'Weekly Summary', on: false },
      { label: 'Product Matches', on: true },
    ],
  },
  {
    icon: Shield,
    title: 'Security',
    desc: 'Session and access control.',
    toggles: [
      { label: 'Two-Factor Authentication', on: false },
      { label: 'Login Alerts', on: true },
    ],
  },
  {
    icon: CreditCard,
    title: 'Subscription',
    desc: 'Your current plan and usage.',
    fields: [
      { label: 'Plan', value: 'Enterprise' },
      { label: 'Assets', value: '12 / 50' },
      { label: 'Monitored Domains', value: '8 / ∞' },
      { label: 'Renewal', value: '2026-07-20' },
    ],
  },
]

export default function SettingsPage() {
  return (
    <div className="p-4 sm:p-8">
      <div className="mb-6">
        <h1 className="text-primary text-xl sm:text-2xl font-medium">Settings</h1>
        <p className="text-secondary mt-1 text-sm">Account and brand configuration.</p>
      </div>

      <div className="space-y-4 sm:space-y-6">
        {sections.map((s) => {
          const Icon = s.icon
          return (
            <div key={s.title} className="surface rounded-xl border border-subtle p-4 sm:p-6">
              <div className="mb-4 sm:mb-5 flex items-center gap-3">
                <div className="elevated flex h-9 w-9 shrink-0 items-center justify-center rounded-lg">
                  <Icon className="h-4 w-4 text-primary" />
                </div>
                <div className="min-w-0">
                  <h2 className="text-primary text-sm font-medium">{s.title}</h2>
                  <p className="text-muted text-xs">{s.desc}</p>
                </div>
              </div>

              {'fields' in s && s.fields && (
                <div className="grid gap-4 sm:grid-cols-2">
                  {s.fields.map((f) => (
                    <div key={f.label}>
                      <p className="text-muted text-xs mb-1">{f.label}</p>
                      <p className="text-primary text-sm truncate">{f.value}</p>
                    </div>
                  ))}
                </div>
              )}

              {'toggles' in s && s.toggles && (
                <div className="space-y-3">
                  {s.toggles.map((t) => (
                    <div key={t.label} className="flex items-center justify-between">
                      <span className="text-secondary text-sm">{t.label}</span>
                      <div className={`h-5 w-9 shrink-0 rounded-full transition-colors ${t.on ? 'bg-emerald-500' : 'bg-zinc-700'} relative cursor-pointer`}>
                        <div className={`absolute top-0.5 h-4 w-4 rounded-full bg-white transition-transform ${t.on ? 'translate-x-4' : 'translate-x-0.5'}`} />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
