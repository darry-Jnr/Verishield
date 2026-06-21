'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'

const THRESHOLD_MS = 30_000

export default function SystemStatus() {
  const [forgeOk, setForgeOk] = useState(false)
  const [checking, setChecking] = useState(true)

  useEffect(() => {
    const check = async () => {
      const { data } = await supabase
        .from('service_heartbeat')
        .select('last_seen')
        .eq('service_name', 'forge')
        .maybeSingle()
      if (data?.last_seen) {
        const age = Date.now() - new Date(data.last_seen).getTime()
        setForgeOk(age < THRESHOLD_MS)
      } else {
        setForgeOk(false)
      }
      setChecking(false)
    }
    check()
    const interval = setInterval(check, 10_000)
    return () => clearInterval(interval)
  }, [])

  if (checking) return null

  return (
    <Link
      href="/dashboard/system"
      className="flex w-full items-center gap-2 border-t border-subtle px-4 py-2.5 transition-colors hover:bg-elevated"
    >
      <span className={`h-2 w-2 shrink-0 rounded-full ${forgeOk ? 'bg-green-500' : 'bg-red-500'}`} />
      <span className="text-xs text-secondary">System {forgeOk ? 'Online' : 'Offline'}</span>
    </Link>
  )
}
