import { Shield, Upload, Radar, Fingerprint, Bell, ArrowRight, CheckCircle } from 'lucide-react'

interface MainProps {
  onCta: () => void
}

const features = [
  {
    icon: Upload,
    title: 'Register Assets',
    desc: 'Upload product images and videos into a secure vault. Each file is compressed and stamped with a unique tracking ID.',
  },
  {
    icon: Radar,
    title: 'Web Monitoring',
    desc: 'Cross-reference your registered assets against public listings. Get alerted when your media appears on unauthorized sites.',
  },
  {
    icon: Fingerprint,
    title: 'Tracking Watermarks',
    desc: 'Every file embeds an invisible tracking ID via EXIF metadata. Trace stolen assets back to their source instantly.',
  },
]

const steps = [
  { num: '01', title: 'Create a folder', desc: 'Organize by campaign, brand, or product line.' },
  { num: '02', title: 'Upload your media', desc: 'Images and videos are automatically compressed and secured.' },
  { num: '03', title: 'Forge stamps each file', desc: 'A background worker embeds tracking IDs and optimizes file size.' },
  { num: '04', title: 'Monitor & act', desc: 'View secured files, check system health, and download stamped assets.' },
]

export default function Main({ onCta }: MainProps) {
  return (
    <>
      {/* Hero */}
      <section className="relative overflow-hidden pt-32 pb-24 sm:pt-40 sm:pb-32">
        <div className="pointer-events-none absolute inset-0 flex items-start justify-center">
          <div className="sticky top-1/3 h-[500px] w-[500px] -translate-y-1/2 rounded-full bg-primary/5 blur-3xl" />
        </div>
        <div className="relative mx-auto max-w-4xl px-6 text-center">
          <div className="mx-auto mb-6 inline-flex items-center gap-2 rounded-full border border-white/[6%] bg-white/[3%] px-4 py-1.5 text-sm text-muted backdrop-blur-sm">
            <Shield className="h-3.5 w-3.5 text-primary" />
            Brand Protection Platform
          </div>
          <h1 className="text-pretty text-primary mb-4 text-4xl font-semibold tracking-tight sm:text-5xl md:text-6xl">
            Upload once.
            <br />
            Protect everywhere.
          </h1>
          <p className="text-pretty text-body mx-auto mb-10 max-w-xl text-base leading-relaxed sm:text-lg">
            Register your product media, watermark it with invisible tracking IDs, and monitor
            for unauthorized use — all in one place.
          </p>
          <div className="flex items-center justify-center gap-4">
            <button onClick={onCta} className="btn-primary text-sm sm:text-base">
              Start protecting your brand
            </button>
            <button className="btn-inverted text-sm sm:text-base">Watch demo</button>
          </div>
          <div className="mt-10 flex items-center justify-center gap-6 text-xs text-muted">
            <span className="flex items-center gap-1.5">
              <CheckCircle className="h-3.5 w-3.5 text-emerald-500" />
              No credit card
            </span>
            <span className="flex items-center gap-1.5">
              <CheckCircle className="h-3.5 w-3.5 text-emerald-500" />
              Free to start
            </span>
            <span className="flex items-center gap-1.5">
              <CheckCircle className="h-3.5 w-3.5 text-emerald-500" />
              1-click setup
            </span>
          </div>
        </div>
      </section>

      {/* Stats bar */}
      <section className="border-y border-white/[4%] bg-white/[2%]">
        <div className="mx-auto max-w-5xl px-6 py-10">
          <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
            {[
              { label: 'Assets Protected', value: '100+' },
              { label: 'Tracking IDs Issued', value: '500+' },
              { label: 'Threats Detected', value: '12' },
              { label: 'Avg Response Time', value: '< 5s' },
            ].map((s) => (
              <div key={s.label} className="text-center">
                <p className="text-primary text-2xl font-semibold tracking-tight">{s.value}</p>
                <p className="text-muted text-xs mt-1">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="mx-auto max-w-5xl px-6 py-24">
        <div className="mb-12 text-center">
          <h2 className="text-primary text-2xl font-semibold tracking-tight sm:text-3xl">
            How AuraGuard works
          </h2>
          <p className="text-body mx-auto mt-3 max-w-md text-sm leading-relaxed">
            Three simple steps to protect your brand assets from unauthorized use.
          </p>
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          {features.map((f) => (
            <div key={f.title} className="group surface rounded-xl border border-subtle p-6 transition-colors hover:border-zinc-700">
              <div className="elevated mb-4 flex h-10 w-10 items-center justify-center rounded-lg ring-1 ring-white/[4%]">
                <f.icon className="h-5 w-5 text-primary" />
              </div>
              <h3 className="text-primary mb-1.5 font-medium">{f.title}</h3>
              <p className="text-secondary text-sm leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Steps */}
      <section className="border-y border-white/[4%] bg-white/[2%]">
        <div className="mx-auto max-w-5xl px-6 py-24">
          <div className="mb-12 text-center">
            <h2 className="text-primary text-2xl font-semibold tracking-tight sm:text-3xl">
              From upload to protection
            </h2>
            <p className="text-body mx-auto mt-3 max-w-md text-sm leading-relaxed">
              The forge pipeline automates everything after you upload.
            </p>
          </div>
          <div className="grid gap-6 md:grid-cols-4">
            {steps.map((s, i) => (
              <div key={s.num} className="relative">
                <div className="surface rounded-xl border border-subtle p-5">
                  <div className="mb-3 flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-[11px] font-semibold text-primary">
                    {s.num}
                  </div>
                  <h3 className="text-primary mb-1 text-sm font-medium">{s.title}</h3>
                  <p className="text-muted text-xs leading-relaxed">{s.desc}</p>
                </div>
                {i < steps.length - 1 && (
                  <div className="absolute -right-3 top-1/2 hidden -translate-y-1/2 md:block">
                    <ArrowRight className="h-4 w-4 text-muted/30" />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="mx-auto max-w-3xl px-6 py-24 text-center">
        <div className="surface rounded-2xl border border-subtle p-10 sm:p-14">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10">
            <Shield className="h-6 w-6 text-primary" />
          </div>
          <h2 className="text-primary text-2xl font-semibold tracking-tight sm:text-3xl">
            Ready to protect your brand?
          </h2>
          <p className="text-body mx-auto mt-3 max-w-md text-sm leading-relaxed">
            Upload your first asset in under a minute. No commitment, no credit card.
          </p>
          <div className="mt-8 flex items-center justify-center gap-4">
            <button onClick={onCta} className="btn-primary text-sm sm:text-base">
              Get started free
            </button>
            <button className="btn-inverted text-sm sm:text-base">Learn more</button>
          </div>
        </div>
      </section>
    </>
  )
}
