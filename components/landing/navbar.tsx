import { Shield } from 'lucide-react'

interface NavbarProps {
  onSignIn: () => void
}

export default function Navbar({ onSignIn }: NavbarProps) {
  return (
    <nav className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
      <div className="flex items-center gap-2">
        <Shield className="h-5 w-5 text-primary" />
        <span className="text-primary font-medium">AuraGuard</span>
      </div>
      <div className="flex items-center gap-3">
        <button onClick={onSignIn} className="btn-inverted text-sm">
          Sign in
        </button>
        <button onClick={onSignIn} className="btn-primary text-sm">
          Get started
        </button>
      </div>
    </nav>
  )
}
