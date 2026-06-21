import { Shield } from 'lucide-react'

export default function Footer() {
  return (
    <footer className="border-t border-white/[4%] px-6 py-10">
      <div className="mx-auto flex max-w-6xl flex-col items-center gap-6 sm:flex-row sm:justify-between">
        <div className="flex items-center gap-2">
          <Shield className="h-4 w-4 text-muted" />
          <span className="text-sm text-muted">AuraGuard</span>
        </div>
        <div className="flex items-center gap-6 text-xs text-muted">
          <span>Built for the hackathon</span>
          <span>·</span>
          <span>&copy; {new Date().getFullYear()}</span>
        </div>
      </div>
    </footer>
  )
}
