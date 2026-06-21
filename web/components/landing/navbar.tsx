import { Shield } from 'lucide-react'

interface NavbarProps {
  onSignIn: () => void
}

export default function Navbar({ onSignIn }: NavbarProps) {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 border-b border-white/[4%] bg-black/60 backdrop-blur-xl">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
            <Shield className="h-5 w-5 text-primary" />
          </div>
          <span className="text-primary font-semibold tracking-tight">AuraGuard</span>
        </div>
        <button onClick={onSignIn} className="rounded-lg bg-primary px-5 py-2 text-sm font-medium text-white transition-all hover:bg-primary/90">
          Get started
        </button>
      </div>
    </nav>
  )
}
