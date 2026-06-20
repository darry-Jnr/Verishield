import { Shield, Radar, Search, Bell } from 'lucide-react'

interface MainProps {
  onCta: () => void
}

const features = [
  {
    icon: Radar,
    title: 'Asset Registry',
    desc: 'Register your product media in a secure digital vault.',
  },
  {
    icon: Search,
    title: 'Web Monitoring',
    desc: 'Cross-reference assets against global listings in real-time.',
  },
  {
    icon: Bell,
    title: 'Instant Alerts',
    desc: 'Get flagged on unauthorized replicas and MAP violations.',
  },
]

export default function Main({ onCta }: MainProps) {
  return (
    <>
      <section className="mx-auto max-w-4xl px-6 pt-20 pb-24 text-center">
        <div className="surface mx-auto mb-6 inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-sm text-secondary">
          <Shield className="h-3.5 w-3.5" />
          Enterprise Brand Intelligence
        </div>
        <h1 className="text-primary mb-4 text-4xl font-medium tracking-tight sm:text-5xl md:text-6xl">
          Protect your brand
          <br />
          from copycats.
        </h1>
        <p className="text-body mx-auto mb-10 max-w-xl text-lg leading-relaxed">
          Register your product media once. We monitor the web for stolen assets,
          unauthorized replicas, and MAP violations — so you don&apos;t have to.
        </p>
        <div className="flex items-center justify-center gap-4">
          <button onClick={onCta} className="btn-primary">
            Register your first asset
          </button>
          <button className="btn-inverted">See how it works</button>
        </div>
      </section>

      <section className="mx-auto max-w-5xl px-6 pb-24">
        <div className="grid gap-4 md:grid-cols-3">
          {features.map((f) => (
            <div key={f.title} className="surface rounded-xl border border-subtle p-6">
              <div className="elevated mb-4 flex h-10 w-10 items-center justify-center rounded-lg">
                <f.icon className="h-5 w-5 text-primary" />
              </div>
              <h3 className="text-primary mb-1.5 font-medium">{f.title}</h3>
              <p className="text-secondary text-sm leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>
    </>
  )
}
