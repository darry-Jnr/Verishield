'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { useQueryClient, useQuery } from '@tanstack/react-query'
import { Shield, LayoutDashboard, FolderKanban, Bell, LogOut, Menu, X, MoreVertical } from 'lucide-react'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import { getScanResults } from '@/lib/db'
import SystemStatus from '@/components/system-status'

const nav = [
  { icon: LayoutDashboard, label: 'Dashboard', href: '/dashboard' },
  { icon: FolderKanban, label: 'Assets', href: '/dashboard/assets' },
  { icon: Bell, label: 'Alerts', href: '/dashboard/alerts' },
]

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const queryClient = useQueryClient()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [userEmail, setUserEmail] = useState<string | null>(null)
  const [menuOpen, setMenuOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  const { data: results } = useQuery({
    queryKey: ['scan-results'],
    queryFn: getScanResults,
    refetchInterval: 30000,
  })
  const maxAlertId = results?.reduce((max, r) => Math.max(max, r.id), 0) ?? 0
  const lastSeen = typeof window !== 'undefined' ? Number(localStorage.getItem('lastSeenAlertId') ?? 0) : 0
  const hasUnread = maxAlertId > lastSeen

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_OUT') {
        setUserEmail(null)
        queryClient.clear()
        router.push('/')
      } else if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED' || event === 'INITIAL_SESSION') {
        setUserEmail(session?.user?.email ?? null)
      }
    })
    return () => subscription.unsubscribe()
  }, [])

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  const handleSignOut = async () => {
    setMenuOpen(false)
    await supabase.auth.signOut()
    queryClient.clear()
    router.push('/')
  }

  return (
    <div className="min-h-screen bg-canvas lg:flex">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-40 bg-black/60 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Sidebar */}
      <aside className={`fixed inset-y-0 left-0 z-50 flex w-56 flex-col border-r border-subtle bg-surface transition-transform duration-200 lg:sticky lg:top-0 lg:translate-x-0 lg:h-screen ${
        sidebarOpen ? 'translate-x-0' : '-translate-x-full'
      }`}>
        <div className="flex items-center justify-between border-b border-subtle px-5 py-4">
          <div className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-primary" />
            <span className="text-primary text-sm font-medium">AuraGuard</span>
          </div>
          <button onClick={() => setSidebarOpen(false)} className="text-muted hover:text-primary lg:hidden transition-colors">
            <X className="h-4 w-4" />
          </button>
        </div>

        <nav className="flex-1 space-y-0.5 px-3 py-4">
          {nav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setSidebarOpen(false)}
              className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-secondary transition-colors hover:bg-elevated hover:text-primary"
            >
              <span className="relative">
                <item.icon className="h-4 w-4 shrink-0" />
                {item.label === 'Alerts' && hasUnread && (
                  <span className="absolute -top-1 -right-1 h-2 w-2 rounded-full bg-red-500" />
                )}
              </span>
              {item.label}
            </Link>
          ))}
        </nav>

        <SystemStatus />
        {userEmail ? (
          <div className="border-t border-subtle px-4 py-4">
            <div className="flex items-center gap-3">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-zinc-700 text-xs text-primary font-medium">
                {userEmail[0].toUpperCase()}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-primary truncate text-xs font-medium">{userEmail}</p>
                <p className="text-muted truncate text-[11px]">Signed in</p>
              </div>
              <div ref={menuRef} className="relative">
                <button onClick={() => setMenuOpen(!menuOpen)} className="text-muted hover:text-primary transition-colors">
                  <MoreVertical className="h-4 w-4" />
                </button>
                {menuOpen && (
                  <div className="absolute bottom-full right-0 mb-2 w-44 rounded-lg border border-subtle bg-surface py-1 shadow-xl">
                    <button onClick={handleSignOut} className="flex w-full items-center gap-2.5 px-3.5 py-2 text-sm text-red-400 hover:bg-zinc-800 transition-colors">
                      <LogOut className="h-4 w-4" />
                      Sign out
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        ) : (
          <div className="border-t border-subtle px-4 py-4">
            <div className="flex items-center gap-3">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-zinc-700 text-xs text-primary font-medium">
                G
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-primary truncate text-xs font-medium">Guest</p>
                <p className="text-muted truncate text-[11px]">Not signed in</p>
              </div>
            </div>
          </div>
        )}
      </aside>

      {/* Main */}
      <main className="min-w-0 flex-1">
        {/* Mobile top bar */}
        <div className="flex items-center gap-3 border-b border-subtle px-4 py-3 lg:hidden">
          <button onClick={() => setSidebarOpen(true)} className="text-muted hover:text-primary transition-colors">
            <Menu className="h-5 w-5" />
          </button>
          <div className="flex items-center gap-2">
            <Shield className="h-4 w-4 text-primary" />
            <span className="text-primary text-sm font-medium">AuraGuard</span>
          </div>
        </div>
        {children}
      </main>
    </div>
  )
}
