'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Shield, X, Loader2, Eye, EyeOff } from 'lucide-react'
import { supabase } from '@/lib/supabase'

interface SignInProps {
  open: boolean
  onClose: () => void
}

export default function SignIn({ open, onClose }: SignInProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [email, setEmail] = useState('auraguard@gmail.com')
  const [password, setPassword] = useState('hackaton2026')
  const [showPassword, setShowPassword] = useState(false)

  if (!open) return null

  const handleSignIn = async () => {
    setLoading(true)
    setError('')

    const { error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (signInError) {
      setError(signInError.message)
      setLoading(false)
      return
    }

    router.push('/dashboard')
  }

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
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="elevated w-full rounded-lg border border-subtle px-4 py-2.5 text-sm text-primary placeholder-muted outline-none focus:border-zinc-600 transition-colors"
          />
          <div className="relative">
            <input
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="elevated w-full rounded-lg border border-subtle px-4 py-2.5 pr-10 text-sm text-primary placeholder-muted outline-none focus:border-zinc-600 transition-colors"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted hover:text-primary transition-colors"
            >
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
          {error && <p className="text-red-400 text-xs">{error}</p>}
          <button
            onClick={handleSignIn}
            disabled={loading}
            className="btn-primary w-full justify-center py-2.5 disabled:opacity-50"
          >
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
            {loading ? 'Signing in...' : 'Sign in'}
          </button>
        </div>
        <p className="text-muted mt-4 text-center text-xs">
          Demo — click sign in to continue.
        </p>
      </div>
    </div>
  )
}
