'use client'

import { useRouter } from 'next/navigation'
import { Shield, X } from 'lucide-react'

interface SignInProps {
  open: boolean
  onClose: () => void
}

export default function SignIn({ open, onClose }: SignInProps) {
  const router = useRouter()
  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="surface w-full max-w-sm rounded-2xl border border-subtle p-8 shadow-2xl">
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-primary" />
            <span className="text-primary font-medium">AuraGuard</span>
          </div>
          <button onClick={onClose} className="text-muted hover:text-primary transition-colors">
            <X className="h-5 w-5" />
          </button>
        </div>
        <h2 className="text-primary mb-1 text-xl font-medium">Welcome back</h2>
        <p className="text-secondary mb-6 text-sm">Sign in to your dashboard.</p>
        <div className="space-y-3">
          <input
            type="email"
            placeholder="Email"
            className="elevated w-full rounded-lg border border-subtle px-4 py-2.5 text-sm text-primary placeholder-muted outline-none focus:border-zinc-600 transition-colors"
          />
          <input
            type="password"
            placeholder="Password"
            className="elevated w-full rounded-lg border border-subtle px-4 py-2.5 text-sm text-primary placeholder-muted outline-none focus:border-zinc-600 transition-colors"
          />
          <button onClick={() => router.push('/dashboard')} className="btn-primary w-full justify-center py-2.5">
            Sign in
          </button>
        </div>
        <p className="text-muted mt-4 text-center text-xs">
          Demo — no account needed. Click sign in to continue.
        </p>
      </div>
    </div>
  )
}
