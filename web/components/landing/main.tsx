import { Shield, Upload, Radar, Fingerprint } from 'lucide-react'

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
          <button onClick={onCta} className="btn-primary text-base">
            Start protecting your brand
          </button>
        </div>
      </section>

      {/* Features */}
      <section className="mx-auto max-w-5xl px-6 pb-24">
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
    </>
  )
}
