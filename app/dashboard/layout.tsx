'use client'

import { useState } from 'react'
import { Shield, LayoutDashboard, FolderKanban, ScanEye, Bell, Settings, LogOut, Menu, X } from 'lucide-react'
import Link from 'next/link'

const nav = [
  { icon: LayoutDashboard, label: 'Dashboard', href: '/dashboard' },
  { icon: FolderKanban, label: 'Assets', href: '/dashboard/assets' },
  { icon: ScanEye, label: 'Monitor', href: '/dashboard/monitor' },
  { icon: Bell, label: 'Alerts', href: '/dashboard/alerts' },
  { icon: Settings, label: 'Settings', href: '/dashboard/settings' },
]

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
    <div className="flex min-h-screen bg-canvas">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-40 bg-black/60 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Sidebar */}
      <aside className={`fixed inset-y-0 left-0 z-50 flex w-56 flex-col border-r border-subtle bg-surface transition-transform duration-200 lg:static lg:translate-x-0 ${
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
              <item.icon className="h-4 w-4 shrink-0" />
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="border-t border-subtle px-4 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-zinc-700 text-xs text-primary font-medium">
              JD
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-primary truncate text-xs font-medium">Jane Doe</p>
              <p className="text-muted truncate text-[11px]">Acme Brands Inc.</p>
            </div>
            <LogOut className="h-4 w-4 shrink-0 text-muted hover:text-primary cursor-pointer transition-colors" />
          </div>
        </div>
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
